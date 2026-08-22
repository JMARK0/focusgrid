package com.focusgrid.app.domain

import org.junit.Assert.assertEquals
import org.junit.Test

class StopwatchFormatTest {

    @Test
    fun `formats millis to one decimal place`() {
        assertEquals("0.0s", Stopwatch.formatSeconds(0))
        assertEquals("1.2s", Stopwatch.formatSeconds(1234))
        assertEquals("12.5s", Stopwatch.formatSeconds(12_549))
        assertEquals("59.9s", Stopwatch.formatSeconds(59_999))
    }
}
