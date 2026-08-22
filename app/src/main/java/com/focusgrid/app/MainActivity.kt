package com.focusgrid.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.focusgrid.app.ui.navigation.FocusGridNavHost
import com.focusgrid.app.ui.theme.FocusGridTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FocusGridRoot()
        }
    }
}

@Composable
private fun FocusGridRoot() {
    FocusGridTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            FocusGridNavHost()
        }
    }
}
