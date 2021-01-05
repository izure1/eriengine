declare namespace Engine {
    namespace ModuleSystem {
        interface InstallSuccess extends Engine.ActionSuccessState {}
        interface InstallFail extends Error, Engine.ActionFailState {}
    }
}