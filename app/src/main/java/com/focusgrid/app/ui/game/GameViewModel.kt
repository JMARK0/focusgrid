package com.focusgrid.app.ui.game

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focusgrid.app.data.repository.CompletedRun
import com.focusgrid.app.data.repository.RunRepository
import com.focusgrid.app.domain.GridGenerator
import com.focusgrid.app.domain.GridSize
import com.focusgrid.app.domain.Stopwatch
import com.focusgrid.app.domain.WrongTapMode
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(
    private val runRepository: RunRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val stopwatch = Stopwatch()
    private val wrongTapMode = WrongTapMode.FORGIVING
    private val strictPenaltyMillisPerMistake = 3_000L

    private val gridSize: GridSize = GridSize.entries.firstOrNull {
        it.dimension == savedStateHandle.get<Int>("gridDimension")
    } ?: GridSize.DEFAULT

    private val _uiState = MutableStateFlow(GameUiState(gridSize = gridSize))
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    private val _events = MutableStateFlow<GameEvent?>(null)
    val events: StateFlow<GameEvent?> = _events.asStateFlow()

    init {
        startNewRound()
        viewModelScope.launch {
            stopwatch.elapsedMillis.collect { millis ->
                _uiState.value = _uiState.value.copy(elapsedMillis = millis)
            }
        }
    }

    private fun startNewRound() {
        val board = GridGenerator.shuffledBoard(gridSize)
        _uiState.value = GameUiState(gridSize = gridSize, board = board)
        stopwatch.reset()
        stopwatch.start(viewModelScope)
    }

    fun onCellTapped(index: Int) {
        val state = _uiState.value
        if (state.isPaused || state.isComplete) return
        if (index in state.clearedIndices) return

        val tappedValue = state.board[index]
        if (tappedValue == state.nextTarget) {
            handleCorrectTap(state, index)
        } else {
            handleWrongTap(state, index)
        }
    }

    private fun handleCorrectTap(state: GameUiState, index: Int) {
        val newCleared = state.clearedIndices + index
        val newTarget = state.nextTarget + 1
        val isComplete = newCleared.size == state.board.size

        _uiState.value = state.copy(
            clearedIndices = newCleared,
            nextTarget = newTarget,
            wrongTapIndex = null,
            isComplete = isComplete,
        )
        _events.value = GameEvent.CorrectTap(index)

        if (isComplete) {
            finishRound(state.mistakes)
        }
    }

    private fun handleWrongTap(state: GameUiState, index: Int) {
        val newMistakes = state.mistakes + 1
        _events.value = GameEvent.WrongTap(index)

        when (wrongTapMode) {
            WrongTapMode.FORGIVING -> {
                _uiState.value = state.copy(mistakes = newMistakes, wrongTapIndex = index)
            }
            WrongTapMode.STRICT -> {
                _uiState.value = state.copy(mistakes = newMistakes, wrongTapIndex = index)
            }
            WrongTapMode.HARD -> {
                val reshuffled = reshuffleRemaining(state)
                _uiState.value = state.copy(
                    board = reshuffled,
                    mistakes = newMistakes,
                    wrongTapIndex = index,
                )
            }
        }
    }

    private fun reshuffleRemaining(state: GameUiState): List<Int> {
        val remainingValues = state.board.filterIndexed { i, _ -> i !in state.clearedIndices }
            .let { GridGenerator.shuffledBoard(state.gridSize).filter { v -> v in it } }
        val newBoard = state.board.toMutableList()
        var cursor = 0
        newBoard.indices.forEach { i ->
            if (i !in state.clearedIndices) {
                newBoard[i] = remainingValues[cursor]
                cursor++
            }
        }
        return newBoard
    }

    fun togglePause() {
        val state = _uiState.value
        if (state.isComplete) return
        if (state.isPaused) {
            stopwatch.start(viewModelScope)
        } else {
            stopwatch.pause()
        }
        _uiState.value = state.copy(isPaused = !state.isPaused)
    }

    private fun finishRound(mistakes: Int) {
        val rawTimeMillis = stopwatch.stop()
        val penalty = if (wrongTapMode == WrongTapMode.STRICT) mistakes * strictPenaltyMillisPerMistake else 0L
        val finalTimeMillis = rawTimeMillis + penalty

        viewModelScope.launch {
            val previousBest = runRepository.bestTimeMillis(gridSize).first()
            val isNewBest = previousBest == null || finalTimeMillis < previousBest

            runRepository.recordRun(
                CompletedRun(
                    gridSize = gridSize,
                    timeMillis = finalTimeMillis,
                    mistakes = mistakes,
                )
            )

            _uiState.value = _uiState.value.copy(
                finalTimeMillis = finalTimeMillis,
                isNewBest = isNewBest,
                roundResultReady = true,
            )
        }
    }

    fun consumeEvent() {
        _events.value = null
    }

    fun clearWrongTapFlash(index: Int) {
        val state = _uiState.value
        if (state.wrongTapIndex == index) {
            _uiState.value = state.copy(wrongTapIndex = null)
        }
    }
}

sealed interface GameEvent {
    data class CorrectTap(val index: Int) : GameEvent
    data class WrongTap(val index: Int) : GameEvent
}
