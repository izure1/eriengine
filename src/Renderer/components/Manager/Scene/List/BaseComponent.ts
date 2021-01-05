import path from 'path'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { PROJECT_SCENE_DIRECTORY_NAME } from '@/Const'

@Component
export default class BaseComponent extends Vue {

    protected get cwd(): string {
        const { key } = this.$route.params
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return ''
        }
        return path.join(projectDirectory, PROJECT_SCENE_DIRECTORY_NAME, key)
    }

    protected openDirectory(): void {
        shell.openPath(this.cwd)
    }

    protected openFile(filePath: string): void {
        shell.openPath(filePath)
    }
    
}