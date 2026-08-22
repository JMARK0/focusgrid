package com.focusgrid.app.ui.game

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.focusgrid.app.R
import com.focusgrid.app.domain.Stopwatch
import com.focusgrid.app.ui.theme.CellDark
import com.focusgrid.app.ui.theme.CellDarkText
import com.focusgrid.app.ui.theme.CellLight
import com.focusgrid.app.ui.theme.CellLightText
import com.focusgrid.app.ui.theme.WrongTapFlash
import kotlinx.coroutines.delay

private const val MIN_TOUCH_TARGET_DP = 48

@Composable
fun GameScreen(
    onRoundComplete: (finalTimeMillis: Long, mistakes: Int, isNewBest: Boolean) -> Unit,
    viewModel: GameViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    val event by viewModel.events.collectAsState()
    val haptic = LocalHapticFeedback.current

    LaunchedEffect(event) {
        when (val e = event) {
            is GameEvent.CorrectTap -> haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
            is GameEvent.WrongTap -> haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            null -> Unit
        }
        if (event != null) viewModel.consumeEvent()
    }

    LaunchedEffect(state.roundResultReady) {
        if (state.roundResultReady) {
            onRoundComplete(state.finalTimeMillis, state.mistakes, state.isNewBest)
        }
    }

    LaunchedEffect(state.wrongTapIndex) {
        val index = state.wrongTapIndex ?: return@LaunchedEffect
        delay(300)
        viewModel.clearWrongTapFlash(index)
    }

    Scaffold(
        topBar = {
            GameTopBar(
                elapsedMillis = state.elapsedMillis,
                nextTarget = state.nextTarget,
                isPaused = state.isPaused,
                isComplete = state.isComplete,
                onTogglePause = viewModel::togglePause,
            )
        }
    ) { padding ->
        if (state.isPaused && !state.isComplete) {
            PausedOverlay(modifier = Modifier.padding(padding))
        } else if (state.isBoardReady) {
            GameGrid(
                board = state.board,
                dimension = state.gridSize.dimension,
                clearedIndices = state.clearedIndices,
                wrongTapIndex = state.wrongTapIndex,
                onCellTapped = viewModel::onCellTapped,
                modifier = Modifier.padding(padding),
            )
        }
    }
}

@Composable
private fun GameTopBar(
    elapsedMillis: Long,
    nextTarget: Int,
    isPaused: Boolean,
    isComplete: Boolean,
    onTogglePause: () -> Unit,
) {
    Surface(tonalElevation = 2.dp) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Column(modifier = Modifier.align(Alignment.CenterStart)) {
                Text(
                    text = stringResource(R.string.game_next_label) + " $nextTarget",
                    style = MaterialTheme.typography.titleLarge,
                )
                Text(
                    text = Stopwatch.formatSeconds(elapsedMillis),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
            }
            if (!isComplete) {
                IconButton(
                    onClick = onTogglePause,
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .size(MIN_TOUCH_TARGET_DP.dp)
                        .semantics {
                            contentDescription = if (isPaused) "Resume" else "Pause"
                        },
                ) {
                    Icon(
                        imageVector = if (isPaused) Icons.Filled.PlayArrow else Icons.Filled.Pause,
                        contentDescription = null,
                    )
                }
            }
        }
    }
}

@Composable
private fun PausedOverlay(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(
            text = stringResource(R.string.game_paused_title),
            style = MaterialTheme.typography.headlineMedium,
        )
    }
}

@Composable
private fun GameGrid(
    board: List<Int>,
    dimension: Int,
    clearedIndices: Set<Int>,
    wrongTapIndex: Int?,
    onCellTapped: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(dimension),
        contentPadding = PaddingValues(8.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier.fillMaxSize(),
    ) {
        items(count = board.size, key = { it }) { index ->
            GridCell(
                number = board[index],
                isCleared = index in clearedIndices,
                isWrong = index == wrongTapIndex,
                isDarkCell = (index / dimension + index % dimension) % 2 == 0,
                onClick = { onCellTapped(index) },
            )
        }
    }
}

@Composable
private fun GridCell(
    number: Int,
    isCleared: Boolean,
    isWrong: Boolean,
    isDarkCell: Boolean,
    onClick: () -> Unit,
) {
    val baseColor = if (isDarkCell) CellDark else CellLight
    val textColor = if (isDarkCell) CellDarkText else CellLightText

    val targetColor = when {
        isCleared -> MaterialTheme.colorScheme.surfaceVariant
        isWrong -> WrongTapFlash
        else -> baseColor
    }
    val animatedColor by animateColorAsState(
        targetValue = targetColor,
        animationSpec = tween(durationMillis = 180),
        label = "cellColor",
    )

    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .background(animatedColor)
            .semantics {
                contentDescription = if (isCleared) {
                    "Cell cleared"
                } else {
                    "Cell showing $number"
                }
            }
            .clickable(enabled = !isCleared, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        if (!isCleared) {
            Text(
                text = number.toString(),
                color = textColor,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}
