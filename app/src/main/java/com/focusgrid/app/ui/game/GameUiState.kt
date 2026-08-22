package com.focusgrid.app.ui.game

import com.focusgrid.app.domain.GridSize

data class GameUiState(
    val gridSize: GridSize = GridSize.DEFAULT,
    val board: List<Int> = emptyList(),
    val clearedIndices: Set<Int> = emptySet(),
    val nextTarget: Int = 1,
    val elapsedMillis: Long = 0L,
    val mistakes: Int = 0,
    val isPaused: Boolean = false,
    val isComplete: Boolean = false,
    /** Index of the most recent wrong tap, so the UI can flash just that cell. */
    val wrongTapIndex: Int? = null,
    val finalTimeMillis: Long = 0L,
    val isNewBest: Boolean = false,
    /** True once [finalTimeMillis]/[isNewBest] have been persisted and are safe to navigate on. */
    val roundResultReady: Boolean = false,
) {
    val isBoardReady: Boolean get() = board.isNotEmpty()
}
