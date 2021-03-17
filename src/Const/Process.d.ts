interface StreamData {
    channel: string
}

declare namespace Engine {
    namespace Process {

        interface UpdateCheckResult {
            version: string
            releaseDate: string
        }

        interface UpdateProgress {
            bytesPerSecond: number
            percent: number
            transferred: number
            total: number
        }

        interface CheckCommandExistsSuccess extends Engine.ActionSuccessState { exists: boolean }
        interface CheckCommandExistsFail extends Engine.ActionFailState {}

        interface GetEngineAuthSuccess extends Engine.ActionSuccessState { auth: string }
        interface GetEngineAuthFail extends Engine.ActionFailState {}

        interface GetEngineVersionSuccess extends Engine.ActionSuccessState { version: string }
        interface GetEngineVersionFail extends Engine.ActionFailState {}

        interface KillProcessSuccess extends Engine.ActionSuccessState { pid: number }
        interface killProcessFail extends Engine.ActionFailState {}

        interface KillSpawnerSuccess extends Engine.ActionSuccessState {}
        interface KillSpawnerFail extends Engine.ActionFailState {}

        interface CheckUpdateSuccess extends Engine.ActionSuccessState { available: boolean, updateInfo: UpdateCheckResult }
        interface CheckUpdateFail extends Engine.ActionFailState {}

        interface DownloadUpdateSuccess extends CheckUpdateSuccess {}
        interface DownloadUpdateFail extends Engine.ActionFailState {}
    }
}