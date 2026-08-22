package com.focusgrid.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface RunDao {

    @Insert
    suspend fun insert(run: RunEntity)

    @Query("SELECT * FROM runs WHERE gridDimension = :gridDimension ORDER BY completedAtEpochMillis DESC")
    fun runsForGrid(gridDimension: Int): Flow<List<RunEntity>>

    @Query("SELECT * FROM runs ORDER BY completedAtEpochMillis DESC")
    fun allRuns(): Flow<List<RunEntity>>

    @Query("SELECT MIN(timeMillis) FROM runs WHERE gridDimension = :gridDimension")
    fun bestTimeMillis(gridDimension: Int): Flow<Long?>
}
