package com.focusgrid.app.ui.home

import com.focusgrid.app.domain.GridSize

data class HomeUiState(
    val selectedGridSize: GridSize = GridSize.DEFAULT,
    val bestTimeMillis: Long? = null,
    val currentStreakDays: Int = 0,
)
