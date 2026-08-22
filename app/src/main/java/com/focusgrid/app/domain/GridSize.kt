package com.focusgrid.app.domain

/** Selectable board sizes. [dimension] is the side length; the board holds dimension^2 cells. */
enum class GridSize(val dimension: Int, val label: String) {
    EASY_3X3(3, "3×3"),
    MEDIUM_4X4(4, "4×4"),
    DEFAULT_5X5(5, "5×5"),
    HARD_6X6(6, "6×6"),
    EXPERT_7X7(7, "7×7"),
    ;

    val cellCount: Int get() = dimension * dimension

    companion object {
        val DEFAULT = DEFAULT_5X5
    }
}
