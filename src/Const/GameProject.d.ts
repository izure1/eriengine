interface PathRequired { path: string }
interface GameProjectState extends PathRequired, Engine.ActionState { config: Engine.GameProject.Config }

declare namespace Engine {
    namespace GameProject {
        interface CreateProjectSuccess extends GameProjectState, Engine.ActionSuccessState {}
        interface CreateProjectFail extends Engine.ActionFailState {}

        interface ReadProjectSuccess extends GameProjectState, Engine.ActionSuccessState {}
        interface ReadProjectFail extends Engine.ActionFailState {}

        interface AddSceneSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSceneFail extends Engine.ActionFailState {}

        interface Config extends Engine.Type.Json {
            ENGINE_VERSION: string
            PROJECT_NAME: string
            APPLICATION_ID: string
            GAME_DISPLAY_SIZE: number[]
            GAME_THEME_TEXT_COLOR: string
            GAME_THEME_BACKGROUND_COLOR: string
        }
    }
}