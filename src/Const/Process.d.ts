declare namespace Engine {
    namespace Process {
        interface CheckCommandExistsSuccess extends Engine.ActionSuccessState {}
        interface CheckCommandExistsFail extends Engine.ActionFailState {}

        interface GetEngineAuthSuccess extends Engine.ActionSuccessState { auth: string }
        interface GetEngineAuthFail extends Engine.ActionFailState {}

        interface GetEngineVersionSuccess extends Engine.ActionSuccessState { version: string }
        interface GetEngineVersionFail extends Engine.ActionFailState {}
    }
}