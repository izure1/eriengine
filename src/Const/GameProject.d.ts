interface PathRequired { path: string }
interface GameProjectState extends PathRequired, Engine.ActionState { config: Engine.GameProject.Config }

declare namespace Engine {
    namespace GameProject {
        interface Config extends Engine.Type.Json {
            ENGINE_AUTH: string
            ENGINE_VERSION: string
            PROJECT_NAME: string
            APPLICATION_ID: string
            GAME_DISPLAY_SIZE: [number, number]
            GAME_THEME_TEXT_COLOR: string
            GAME_THEME_BACKGROUND_COLOR: string
        }

        interface SceneMap {
            walls: [number, number, string][],
            floors: [number, number, string][],
            actors: { name: string, x: number, y: number }[]
        }

        interface CreateProjectSuccess extends GameProjectState, Engine.ActionSuccessState {}
        interface CreateProjectFail extends Engine.ActionFailState {}

        interface ReadProjectSuccess extends GameProjectState, Engine.ActionSuccessState {}
        interface ReadProjectFail extends Engine.ActionFailState {}

        interface AddSceneSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSceneFail extends Engine.ActionFailState {}

        interface AddScriptSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddScriptFail extends Engine.ActionFailState {}

        interface GenerateAssetListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateAssetListFail extends Engine.ActionFailState {}

        interface AddAnimationSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddAnimationFail extends Engine.ActionFailState {}

        interface AddSkillSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSkillFail extends Engine.ActionFailState {}

        interface AddActorSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddActorFail extends Engine.ActionFailState {}

        interface GenerateAnimationListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateAnimationListFail extends Engine.ActionFailState {}

        interface GenerateSkillListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateSkillListFail extends Engine.ActionFailState {}

        interface GenerateActorListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateActorListFail extends Engine.ActionFailState {}

        interface CheckValidProjectSuccess extends Engine.ActionSuccessState {}
        interface CheckValidProjectFail extends Engine.ActionFailState {}

        interface GetEngineAuthSuccess extends Engine.ActionSuccessState { auth: string }
        interface GetEngineAuthFail extends Engine.ActionFailState {}

        interface ReadSceneMapSuccess extends PathRequired, Engine.ActionSuccessState { content: SceneMap }
        interface ReadSceneMapFail extends Engine.ActionFailState {}

        interface WriteSceneMapSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface WriteSceneMapFail extends Engine.ActionFailState {}
    }
}