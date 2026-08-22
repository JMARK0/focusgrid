package com.focusgrid.app.ui.navigation

sealed class Screen(val route: String) {
    data object Home : Screen("home")

    data object Game : Screen("game/{gridDimension}") {
        fun createRoute(gridDimension: Int) = "game/$gridDimension"
    }

    data object Result : Screen("result/{gridDimension}/{timeMillis}/{mistakes}/{isNewBest}") {
        fun createRoute(gridDimension: Int, timeMillis: Long, mistakes: Int, isNewBest: Boolean) =
            "result/$gridDimension/$timeMillis/$mistakes/$isNewBest"
    }
}
