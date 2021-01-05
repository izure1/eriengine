declare namespace Engine {
    interface ActionState {
        name: string
        message: string
    }
    interface ActionSuccessState extends ActionState {
        success: true
    }
    interface ActionFailState extends ActionState {
        success: false
    }
}