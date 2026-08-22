package com.focusgrid.app.domain

/**
 * How a wrong tap is handled. Wired up fully once the Settings screen lands;
 * for now [GameViewModel] defaults every session to [FORGIVING].
 */
enum class WrongTapMode {
    FORGIVING, // ignore wrong taps entirely
    STRICT,    // apply a time penalty
    HARD,      // reshuffle the remaining board
}
