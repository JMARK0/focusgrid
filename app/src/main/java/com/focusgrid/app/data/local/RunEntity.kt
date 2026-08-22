package com.focusgrid.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "runs")
data class RunEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val gridDimension: Int,
    val timeMillis: Long,
    val mistakes: Int,
    val completedAtEpochMillis: Long,
)
