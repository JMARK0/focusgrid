package com.focusgrid.app.data.repository

import com.focusgrid.app.data.local.RunDao
import com.focusgrid.app.data.local.RunEntity
import com.focusgrid.app.domain.GridSize
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

data class CompletedRun(
    val gridSize: GridSize,
    val timeMillis: Long,
    val mistakes: Int,
)

interface RunRepository {
    suspend fun recordRun(run: CompletedRun)
    fun bestTimeMillis(gridSize: GridSize): Flow<Long?>
    fun runsForGrid(gridSize: GridSize): Flow<List<RunEntity>>
    fun allRuns(): Flow<List<RunEntity>>
}

class RunRepositoryImpl @Inject constructor(
    private val runDao: RunDao,
) : RunRepository {

    override suspend fun recordRun(run: CompletedRun) {
        runDao.insert(
            RunEntity(
                gridDimension = run.gridSize.dimension,
                timeMillis = run.timeMillis,
                mistakes = run.mistakes,
                completedAtEpochMillis = System.currentTimeMillis(),
            )
        )
    }

    override fun bestTimeMillis(gridSize: GridSize): Flow<Long?> =
        runDao.bestTimeMillis(gridSize.dimension)

    override fun runsForGrid(gridSize: GridSize): Flow<List<RunEntity>> =
        runDao.runsForGrid(gridSize.dimension)

    override fun allRuns(): Flow<List<RunEntity>> = runDao.allRuns()
}
