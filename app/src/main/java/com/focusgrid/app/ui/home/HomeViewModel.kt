package com.focusgrid.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.focusgrid.app.data.repository.RunRepository
import com.focusgrid.app.domain.GridSize
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val runRepository: RunRepository,
) : ViewModel() {

    private val selectedGridSize = MutableStateFlow(GridSize.DEFAULT)

    val uiState: StateFlow<HomeUiState> = combine(
        selectedGridSize,
        selectedGridSize.flatMapLatest { runRepository.bestTimeMillis(it) },
        runRepository.allRuns(),
    ) { gridSize, bestTime, allRuns ->
        HomeUiState(
            selectedGridSize = gridSize,
            bestTimeMillis = bestTime,
            currentStreakDays = currentStreak(allRuns.map { it.completedAtEpochMillis }),
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    fun selectGridSize(gridSize: GridSize) {
        selectedGridSize.value = gridSize
    }

    /** Consecutive-day streak ending today (or yesterday, so a still-open day doesn't zero it). */
    private fun currentStreak(completedAtEpochMillis: List<Long>): Int {
        if (completedAtEpochMillis.isEmpty()) return 0
        val zone = ZoneId.systemDefault()
        val playedDays = completedAtEpochMillis
            .map { Instant.ofEpochMilli(it).atZone(zone).toLocalDate() }
            .toSortedSet()
            .toList()
            .asReversed()

        val today = Instant.now().atZone(zone).toLocalDate()
        var expected = if (playedDays.first() == today) today else today.minusDays(1)
        if (playedDays.first() != today && playedDays.first() != expected) return 0

        var streak = 0
        for (day in playedDays) {
            if (day == expected) {
                streak++
                expected = expected.minusDays(1)
            } else if (ChronoUnit.DAYS.between(day, expected) < 0) {
                break
            }
        }
        return streak
    }
}
