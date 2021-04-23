import path from 'path';
import normalize from 'normalize-path';
import { killPortProcess } from 'kill-port-process';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { handler as del } from '../FileSystem/delete';
import { handler as buildCreateFiles } from './buildCreateFiles';
import { ProcessSpawner } from '@/Utils/ProcessSpawner';
import { writeToRenderer } from '@/Utils/stream';
import {
    ENGINE_BUILDING_SERVER_PORT,
    PROJECT_BUILD_DIRECTORY_NAME,
    PROJECT_BUILD_SRC_DIRECTORY_NAME
} from '@/Const';

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildServeSuccess|Engine.GameProject.BuildServeFail> {

    const srcDirPath = path.resolve(projectDirPath, PROJECT_BUILD_DIRECTORY_NAME, PROJECT_BUILD_SRC_DIRECTORY_NAME);
    const srcDirDelete = await del(srcDirPath, false);
    if (!srcDirDelete.success) {
        return srcDirDelete as Engine.GameProject.BuildProdFail;
    }

    const htmlAppend = await buildCreateFiles(projectDirPath);
    if (!htmlAppend.success) {
        return htmlAppend as Engine.GameProject.BuildServeFail;
    }

    try {
        const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath });
        const command = 'npm run serve';

        await killPortProcess(ENGINE_BUILDING_SERVER_PORT);
        await spawner.spawn(command, { writeStream: writeToRenderer('build'), deadWord: 'build-serve' });
    } catch(reason) {
        const { name, message } = reason as Error;
        return {
            success: false,
            name,
            message
        };
    }

    return {
        success: true,
        name: '게임 개발서버 빌드',
        message: '게임을 개발서버모드로 성공적으로 빌드하였습니다',
        path: normalize(srcDirPath)
    };

}

export function ipc(): void {
    ipcMain.handle('build-serve', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildServeSuccess|Engine.GameProject.BuildServeFail> => {
        return await handler(projectDirPath);
    });
}