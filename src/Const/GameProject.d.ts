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

        interface AddSceneScriptSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSceneScriptFail extends Engine.ActionFailState {}

        interface AddActorScriptSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddActorScriptFail extends Engine.ActionFailState {}

        interface AddAnimationSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddAnimationFail extends Engine.ActionFailState {}

        interface AddSkillSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSkillFail extends Engine.ActionFailState {}

        interface AddActorSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddActorFail extends Engine.ActionFailState {}

        interface AddSpriteSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddSpriteFail extends Engine.ActionFailState {}

        interface AddImageSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddImageFail extends Engine.ActionFailState {}

        interface AddAudioSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddAudioFail extends Engine.ActionFailState {}

        interface AddVideoSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddVideoFail extends Engine.ActionFailState {}

        interface AddStorageSuccess extends PathRequired, Engine.ActionSuccessState { key: string }
        interface AddStorageFail extends Engine.ActionFailState {}

        interface AddStorageDirectorySuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddStorageDirectoryFail extends Engine.ActionFailState {}

        interface AddStorageFileSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface AddStorageFileFail extends Engine.ActionFailState {}

        interface AddStorageJSONSuccess extends AddStorageFileSuccess {}
        interface AddStorageJSONFail extends AddStorageFileFail {}

        interface ReadStorageFileSuccess extends PathRequired, Engine.ActionSuccessState { content: string }
        interface ReadStorageFileFail extends Engine.ActionFailState {}

        interface ReadStorageJSONSuccess extends ReadStorageFileSuccess { content: object }
        interface ReadStorageJSONFail extends ReadStorageFileFail {}

        interface CheckStorageExistsSuccess extends Engine.ActionSuccessState { exists: boolean }
        interface CheckStorageExistsFail extends Engine.ActionFailState {}

        interface GetStoragePathSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GetStoragePathFail extends Engine.ActionFailState {}

        interface GenerateAssetListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateAssetListFail extends Engine.ActionFailState {}

        interface GenerateAnimationListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateAnimationListFail extends Engine.ActionFailState {}

        interface GenerateSkillListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateSkillListFail extends Engine.ActionFailState {}

        interface GenerateActorListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateActorListFail extends Engine.ActionFailState {}

        interface GenerateSpriteListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateSpriteListFail extends Engine.ActionFailState {}

        interface GenerateImageListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateImageListFail extends Engine.ActionFailState {}

        interface GenerateAudioListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateAudioListFail extends Engine.ActionFailState {}

        interface GenerateVideoListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateVideoListFail extends Engine.ActionFailState {}

        interface GenerateSceneListSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface GenerateSceneListFail extends Engine.ActionFailState {}

        interface CheckValidProjectSuccess extends Engine.ActionSuccessState { valid: boolean }
        interface CheckValidProjectFail extends Engine.ActionFailState {}

        interface ReadSceneMapSuccess extends PathRequired, Engine.ActionSuccessState { content: SceneMap }
        interface ReadSceneMapFail extends Engine.ActionFailState {}

        interface WriteSceneMapSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface WriteSceneMapFail extends Engine.ActionFailState {}

        interface BuildToWebSuccess extends PathRequired, Engine.ActionSuccessState {}
        interface BuildToWebFail extends Engine.ActionFailState {}
    }
}