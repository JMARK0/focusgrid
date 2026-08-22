package com.focusgrid.app.ui.theme

import androidx.compose.ui.graphics.Color

// Core brand
val GridIndigo = Color(0xFF3949AB)
val GridIndigoDark = Color(0xFFB4C1FF)

// Standard checkerboard palette (WCAG AA against both light/dark cell text)
val CellLight = Color(0xFFF4F4F8)
val CellDark = Color(0xFF23252B)
val CellLightText = Color(0xFF1A1A1F)
val CellDarkText = Color(0xFFF4F4F8)

// Colorblind-safe alt palette (avoids red/green reliance; Okabe-Ito derived)
val CellAltA = Color(0xFFE1BE6A) // amber
val CellAltB = Color(0xFF5D3A9B) // violet
val CellAltAText = Color(0xFF1A1A1F)
val CellAltBText = Color(0xFFF4F4F8)

val CorrectTapFlash = Color(0xFF2E7D32)
val WrongTapFlash = Color(0xFFB3261E)

val BackgroundLight = Color(0xFFFDFDFD)
val BackgroundDark = Color(0xFF121318)
val SurfaceLight = Color(0xFFFFFFFF)
val SurfaceDark = Color(0xFF1B1C22)
