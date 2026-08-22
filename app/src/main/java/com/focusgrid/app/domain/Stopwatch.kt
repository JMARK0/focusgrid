package com.focusgrid.app.domain

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Elapsed-time source with 0.1s display precision. Elapsed time is always
 * derived from [System.nanoTime] deltas, never from counting UI ticks, so
 * frame drops or coroutine scheduling jitter can't skew the recorded time.
 * The periodic delay below only drives *when* the UI re-reads that value.
 */
class Stopwatch {

    private val _elapsedMillis = MutableStateFlow(0L)
    val elapsedMillis: StateFlow<Long> = _elapsedMillis.asStateFlow()

    private var startNanos: Long = 0L
    private var accumulatedNanos: Long = 0L
    private var running = false
    private var tickerJob: Job? = null

    fun start(scope: CoroutineScope) {
        if (running) return
        running = true
        startNanos = System.nanoTime()
        tickerJob = scope.launch {
            while (isActive && running) {
                _elapsedMillis.value = currentElapsedNanos() / 1_000_000
                delay(TICK_INTERVAL_MS)
            }
        }
    }

    fun pause() {
        if (!running) return
        accumulatedNanos = currentElapsedNanos()
        running = false
        tickerJob?.cancel()
        _elapsedMillis.value = accumulatedNanos / 1_000_000
    }

    fun stop(): Long {
        val finalNanos = if (running) currentElapsedNanos() else accumulatedNanos
        running = false
        tickerJob?.cancel()
        _elapsedMillis.value = finalNanos / 1_000_000
        return finalNanos / 1_000_000
    }

    fun reset() {
        running = false
        tickerJob?.cancel()
        accumulatedNanos = 0L
        _elapsedMillis.value = 0L
    }

    private fun currentElapsedNanos(): Long =
        accumulatedNanos + (System.nanoTime() - startNanos)

    companion object {
        private const val TICK_INTERVAL_MS = 50L

        fun formatSeconds(millis: Long): String {
            val totalTenths = millis / 100
            val seconds = totalTenths / 10
            val tenths = totalTenths % 10
            return "$seconds.${tenths}s"
        }
    }
}
