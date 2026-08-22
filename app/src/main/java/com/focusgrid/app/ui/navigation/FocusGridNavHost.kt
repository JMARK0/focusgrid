package com.focusgrid.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.focusgrid.app.domain.GridSize
import com.focusgrid.app.ui.game.GameScreen
import com.focusgrid.app.ui.home.HomeScreen
import com.focusgrid.app.ui.result.ResultScreen

@Composable
fun FocusGridNavHost() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Screen.Home.route) {
        composable(Screen.Home.route) {
            HomeScreen(
                onPlay = { gridSize ->
                    navController.navigate(Screen.Game.createRoute(gridSize.dimension))
                },
            )
        }

        composable(
            route = Screen.Game.route,
            arguments = listOf(navArgument("gridDimension") { type = NavType.IntType }),
        ) {
            GameScreen(
                onRoundComplete = { finalTimeMillis, mistakes, isNewBest ->
                    val dimension = it.arguments?.getInt("gridDimension") ?: GridSize.DEFAULT.dimension
                    navController.navigate(
                        Screen.Result.createRoute(dimension, finalTimeMillis, mistakes, isNewBest)
                    ) {
                        popUpTo(Screen.Home.route)
                    }
                },
            )
        }

        composable(
            route = Screen.Result.route,
            arguments = listOf(
                navArgument("gridDimension") { type = NavType.IntType },
                navArgument("timeMillis") { type = NavType.LongType },
                navArgument("mistakes") { type = NavType.IntType },
                navArgument("isNewBest") { type = NavType.BoolType },
            ),
        ) { backStackEntry ->
            val args = backStackEntry.arguments
            val gridDimension = args?.getInt("gridDimension") ?: GridSize.DEFAULT.dimension
            ResultScreen(
                timeMillis = args?.getLong("timeMillis") ?: 0L,
                mistakes = args?.getInt("mistakes") ?: 0,
                isNewBest = args?.getBoolean("isNewBest") ?: false,
                onPlayAgain = {
                    navController.navigate(Screen.Game.createRoute(gridDimension)) {
                        popUpTo(Screen.Home.route)
                    }
                },
                onHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
            )
        }
    }
}
