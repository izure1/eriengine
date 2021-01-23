import path from 'path'

interface Module {
    name: string
    version: string
}

export const ENGINE_AUTH_SECRETKEY: string = 'eriengine4'

export const PROJECT_ALLOW_ASSET_EXTENSIONS: string[] = [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'ogg', 'mp4', 'webm', 'mp4', 'woff', 'woff2' ]

export const PROJECT_DIRECTORY_NAME: string = 'Eriengine Project_{{ PROJECT_NAME }}'
export const PROJECT_CONFIG_NAME: string = 'config.json'
export const PROJECT_PACAKGE_NAME: string = 'package.json'
export const PROJECT_TSCONFIG_NAME: string = 'tsconfig.json'

export const PROJECT_SRC_ACTORLIST_NAME: string = 'ACTOR_LIST.ts'
export const PROJECT_SRC_ANIMSLIST_NAME: string = 'ANIMS_LIST.ts'
export const PROJECT_SRC_ASSETLIST_NAME: string = 'ASSET_LIST.ts'
export const PROJECT_SRC_AUDIOLIST_NAME: string = 'AUDIO_LIST.ts'
export const PROJECT_SRC_IMAGELIST_NAME: string = 'IMAGE_LIST.ts'
export const PROJECT_SRC_SCENELIST_NAME: string = 'SCENE_LIST.ts'
export const PROJECT_SRC_SKILLLIST_NAME: string = 'SKILL_LIST.ts'
export const PROJECT_SRC_SPRITELIST_NAME: string = 'SPRITE_LIST.ts'
export const PROJECT_SRC_VIDEOLIST_NAME: string = 'VIDEO_LIST.ts'
export const PROJECT_LISTS: string =
`import Actors from '@/${       path.parse(PROJECT_SRC_ACTORLIST_NAME).name }'\n` +
`import Animations from '@/${   path.parse(PROJECT_SRC_ANIMSLIST_NAME).name }'\n` +
`import Assets from '@/${       path.parse(PROJECT_SRC_ASSETLIST_NAME).name }'\n` +
`import Audios from '@/${       path.parse(PROJECT_SRC_AUDIOLIST_NAME).name }'\n` +
`import Images from '@/${       path.parse(PROJECT_SRC_IMAGELIST_NAME).name }'\n` +
`import Scenes from '@/${       path.parse(PROJECT_SRC_SCENELIST_NAME).name }'\n` +
`import Skills from '@/${       path.parse(PROJECT_SRC_SKILLLIST_NAME).name }'\n` +
`import Videos from '@/${       path.parse(PROJECT_SRC_VIDEOLIST_NAME).name }'\n`

export const PROJECT_SRC_DIRECTORY_NAME: string = 'src'
export const PROJECT_SRC_ASSET_DIRECTORY_NAME: string = 'Asset'
export const PROJECT_SRC_ASSET_IMAGE_DIRECTORY_NAME: string = 'Image'
export const PROJECT_SRC_ASSET_SPRITE_DIRECTORY_NAME: string = 'Sprite'
export const PROJECT_SRC_ASSET_AUDIO_DIRECTORY_NAME: string = 'Audio'
export const PROJECT_SRC_ASSET_VIDEO_DIRECTORY_NAME: string = 'Video'
export const PROJECT_SRC_ASSET_FONT_DIRECTORY_NAME: string = 'Font'
export const PROJECT_SRC_STORAGE_DIRECTORY_NAME: string = 'Storage'
export const PROJECT_SRC_STORAGE_ACTOR_SCRIPT_DIRECTORY_NAME: string = 'Script'
export const PROJECT_SRC_STORAGE_SCENE_SCRIPT_DIRECTORY_NAME: string = 'Script'
export const PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME: string = 'Map'
export const PROJECT_SRC_STORAGE_SCENE_MAP_NAME: string = 'Map.json'
export const PROJECT_SRC_DATA_DIRECTORY_NAME: string = 'Data'
export const PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME: string = 'Scene'
export const PROJECT_SRC_DATA_SCENE_SCRIPT_DIRECTORY_NAME: string = 'Script'
export const PROJECT_SRC_DATA_SCENE_MAP_DIRECTORY_NAME: string = 'Map'
export const PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME: string = 'Actor'
export const PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME: string = 'Animation'
export const PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME: string = 'Audio'
export const PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME: string = 'Image'
export const PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME: string = 'Skill'
export const PROJECT_SRC_DATA_SPRITE_DIRECTORY_NAME: string = 'Sprite'
export const PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME: string = 'Video'