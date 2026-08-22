package com.focusgrid.app.domain

import kotlin.random.Random
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class GridGeneratorTest {

    @Test
    fun `shuffled board contains every number exactly once for each grid size`() {
        for (size in GridSize.entries) {
            val board = GridGenerator.shuffledBoard(size, Random(seed = 1))
            assertEquals(size.cellCount, board.size)
            assertEquals((1..size.cellCount).toSet(), board.toSet())
        }
    }

    @Test
    fun `different seeds produce different layouts`() {
        val boardA = GridGenerator.shuffledBoard(GridSize.DEFAULT_5X5, Random(seed = 1))
        val boardB = GridGenerator.shuffledBoard(GridSize.DEFAULT_5X5, Random(seed = 2))
        assertNotEquals(boardA, boardB)
    }

    @Test
    fun `same seed is deterministic`() {
        val boardA = GridGenerator.shuffledBoard(GridSize.DEFAULT_5X5, Random(seed = 42))
        val boardB = GridGenerator.shuffledBoard(GridSize.DEFAULT_5X5, Random(seed = 42))
        assertEquals(boardA, boardB)
    }
}
