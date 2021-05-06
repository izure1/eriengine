interface FileSystemState extends Engine.ActionState { path: string }
interface FileContent { encoding: Engine.Type.TransferableEncoding, content: string }
interface FileTranslate { src: string, dist: string }

declare namespace Engine {
  namespace FileSystem {
    interface OpenFileSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface OpenFileFail extends Engine.ActionFailState {}

    interface OpenFilesSuccess extends OpenFileSuccess { path: string[] }
    interface OpenFilesFail extends Engine.ActionFailState {}

    interface SaveFileSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface SaveFileFail extends Engine.ActionFailState {}

    interface OpenDirectorySuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface OpenDirectoryFail extends Engine.ActionFailState {}

    interface SaveDirectorySuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface SaveDirectoryFail extends Engine.ActionFailState {}

    interface MakeDirectorySuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface MakeDirectoryFail extends Engine.ActionFailState {}

    interface WriteFileSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface WriteFileFail extends Engine.ActionFailState {}

    interface ReadFileSuccess extends FileContent, FileSystemState, Engine.ActionSuccessState {}
    interface ReadFileFail extends Engine.ActionFailState {}

    interface WriteJsonSuccess extends WriteFileSuccess {}
    interface WriteJsonFail extends WriteFileFail {}

    interface ReadJsonSuccess extends ReadFileSuccess { content: object }
    interface ReadJsonFail extends ReadFileFail {}

    interface ReadDirectorySuccess extends FileSystemState, Engine.ActionSuccessState { files: string[] }
    interface ReadDirectoryFail extends Engine.ActionFailState {}

    interface FindSuccess extends FileSystemState, Engine.ActionSuccessState { files: string[] }
    interface FindFail extends Engine.ActionFailState {}

    interface CopySuccess extends FileTranslate, Engine.ActionSuccessState {}
    interface CopyFail extends Engine.ActionFailState {}

    interface RenameSuccess extends FileTranslate, Engine.ActionSuccessState {}
    interface RenameFail extends Engine.ActionFailState {}

    interface DeleteSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface DeleteFail extends Engine.ActionFailState {}

    interface TrashSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface TrashFail extends Engine.ActionFailState {}

    interface showItemSuccess extends FileSystemState, Engine.ActionSuccessState {}
    interface showItemFail extends Engine.ActionFailState {}

    interface FileFilter {
      name: string
      extensions: string[]
    }

    interface FileSearchFilter {
      includeDirectories?: boolean
      includeFiles?: boolean
      absolute?: boolean
      extensions?: string[]
    }
  }
}