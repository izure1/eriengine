import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Error404 from '@/Renderer/components/Error/404.vue'
import ProjectMain from '@/Renderer/components/Project/Main.vue'
import ProjectNew from '@/Renderer/components/Project/New.vue'
import ProjectOpen from '@/Renderer/components/Project/Open.vue'
import ProjectClose from '@/Renderer/components/Project/Close.vue'
import Manager from '@/Renderer/components/Manager/Main.vue'
import ManagerConfigMain from '@/Renderer/components/Manager/Config/Main.vue'
import ManagerSceneMain from '@/Renderer/components/Manager/Scene/Main.vue'
import ManagerScriptList from '@/Renderer/components/Manager/Scene/List/Script.vue'
import ManagerAssetList from '@/Renderer/components/Manager/Asset/AssetList.vue'
import ManagerAnimationList from '@/Renderer/components/Manager/Animation/AnimationList.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/project',
        component: ProjectMain
    },
    {
        path: '/project/new',
        component: ProjectNew
    },
    {
        path: '/project/open',
        component: ProjectOpen
    },
    {
        path: '/project/close',
        component: ProjectClose
    },
    {
        path: '/manager',
        component: Manager,
        children: [
            {
                path: '',
                redirect: 'scene'
            },
            {
                path: 'config',
                component: ManagerConfigMain
            },
            {
                path: 'scene',
                component: ManagerSceneMain
            },
            {
                path: 'scene/script/:key',
                component: ManagerScriptList
            },
            {
                path: 'asset',
                component: ManagerAssetList
            },
            {
                path: 'animation',
                component: ManagerAnimationList
            }
        ]
    },
    {
        path: '*',
        component: Error404
    }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
