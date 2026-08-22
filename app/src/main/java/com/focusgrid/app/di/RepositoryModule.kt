package com.focusgrid.app.di

import com.focusgrid.app.data.repository.RunRepository
import com.focusgrid.app.data.repository.RunRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindRunRepository(impl: RunRepositoryImpl): RunRepository
}
