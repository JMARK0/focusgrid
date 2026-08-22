package com.focusgrid.app.ui.result

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.focusgrid.app.R
import com.focusgrid.app.domain.Stopwatch

@Composable
fun ResultScreen(
    timeMillis: Long,
    mistakes: Int,
    isNewBest: Boolean,
    onPlayAgain: () -> Unit,
    onHome: () -> Unit,
) {
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
                text = stringResource(R.string.result_title),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = Stopwatch.formatSeconds(timeMillis),
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.Bold,
            )
            if (isNewBest) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = stringResource(R.string.result_new_best),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "${stringResource(R.string.result_mistakes_label)}: $mistakes",
                style = MaterialTheme.typography.bodyLarge,
            )

            Spacer(modifier = Modifier.height(48.dp))

            Button(
                onClick = onPlayAgain,
                modifier = Modifier.height(56.dp).fillMaxWidth(0.7f),
            ) {
                Text(
                    text = stringResource(R.string.result_play_again),
                    style = MaterialTheme.typography.titleLarge,
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = onHome,
                modifier = Modifier.height(48.dp).fillMaxWidth(0.7f),
            ) {
                Text(text = stringResource(R.string.result_home))
            }
        }
    }
}
