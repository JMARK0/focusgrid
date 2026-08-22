package com.focusgrid.app.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.focusgrid.app.R
import com.focusgrid.app.domain.GridSize
import com.focusgrid.app.domain.Stopwatch
import androidx.compose.ui.res.stringResource

@Composable
fun HomeScreen(
    onPlay: (GridSize) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                text = stringResource(R.string.home_title),
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = stringResource(R.string.home_best_time),
                style = MaterialTheme.typography.labelLarge,
            )
            Text(
                text = state.bestTimeMillis?.let { Stopwatch.formatSeconds(it) }
                    ?: stringResource(R.string.home_best_time_placeholder),
                style = MaterialTheme.typography.headlineMedium,
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (state.currentStreakDays > 0) {
                    stringResource(R.string.home_streak_days, state.currentStreakDays)
                } else {
                    stringResource(R.string.home_no_streak)
                },
                style = MaterialTheme.typography.bodyLarge,
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = stringResource(R.string.home_difficulty_label),
                style = MaterialTheme.typography.labelLarge,
            )
            Spacer(modifier = Modifier.height(8.dp))
            DifficultySelector(
                selected = state.selectedGridSize,
                onSelect = viewModel::selectGridSize,
            )

            Spacer(modifier = Modifier.height(40.dp))

            Button(
                onClick = { onPlay(state.selectedGridSize) },
                modifier = Modifier.height(56.dp).fillMaxWidth(0.6f),
            ) {
                Text(
                    text = stringResource(R.string.home_play_cta),
                    style = MaterialTheme.typography.titleLarge,
                )
            }
        }
    }
}

@Composable
private fun DifficultySelector(
    selected: GridSize,
    onSelect: (GridSize) -> Unit,
) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 4.dp),
    ) {
        items(GridSize.entries) { size ->
            FilterChip(
                selected = size == selected,
                onClick = { onSelect(size) },
                label = { Text(size.label) },
            )
        }
    }
}
