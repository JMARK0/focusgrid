package com.focusgrid.app.domain

import kotlin.random.Random

/**
 * Produces a new randomized board layout for a [GridSize] using a Fisher-Yates
 * shuffle, so every permutation of 1..cellCount is equally likely.
 */
object GridGenerator {

    fun shuffledBoard(size: GridSize, random: Random = Random.Default): List<Int> {
        val numbers = (1..size.cellCount).toMutableList()
        fisherYatesShuffle(numbers, random)
        return numbers
    }

    private fun fisherYatesShuffle(list: MutableList<Int>, random: Random) {
        for (i in list.lastIndex downTo 1) {
            val j = random.nextInt(i + 1)
            val tmp = list[i]
            list[i] = list[j]
            list[j] = tmp
        }
    }
}
