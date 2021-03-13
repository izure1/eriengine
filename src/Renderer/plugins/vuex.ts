import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        projectDirectory: '',
        projectConfig: {},
        snackbar: {
            active: false,
            message: ''
        }
    },
    mutations: {
        setProjectDirectory(state, directoryPath: string): void {
            state.projectDirectory = directoryPath;
        },
        setProjectConfig(state, config: Engine.GameProject.Config): void {
            state.projectConfig = config;
        },
        setSnackbar(state, message: string): void {
            state.snackbar.active = true;
            state.snackbar.message = message;
        }
    },
    actions: {
        openProject({ commit }, { path, config }): void {
            commit('setProjectDirectory', path);
            commit('setProjectConfig', config);
        },
        setProjectConfig({ commit }, config: Engine.GameProject.Config): void {
            commit('setProjectConfig', config);
        },
        closeProject({ commit }): void {
            commit('setProjectDirectory', '');
            commit('setProjectConfig', {});
        },
        snackbar({ commit }, message: string): void {
            commit('setSnackbar', message);
        }
    },
    modules: {
    }
})
