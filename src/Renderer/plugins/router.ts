import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Error404 from '@/Renderer/components/Error/404.vue'
import Home from '@/Renderer/components/Project/Home.vue'
import ProjectNew from '@/Renderer/components/Project/New.vue'
import ProjectOpen from '@/Renderer/components/Project/Open.vue'
import ProjectClose from '@/Renderer/components/Project/Close.vue'
import Manager from '@/Renderer/components/Manager/index.vue'
import ManagerSceneMain from '@/Renderer/components/Manager/Scene/Main.vue'
import ManagerScriptList from '@/Renderer/components/Manager/Scene/List/Script.vue'
import ManagerAnimationList from '@/Renderer/components/Manager/Scene/List/Animation.vue'
import ManagerAssetList from '@/Renderer/components/Manager/Asset/AssetList.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        component: Home
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
                path: 'scene',
                component: ManagerSceneMain
            },
            {
                path: 'scene/:key/script',
                component: ManagerScriptList
            },
            {
                path: 'scene/:key/animation',
                component: ManagerAnimationList
            },
            {
                path: 'asset',
                component: ManagerAssetList
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
