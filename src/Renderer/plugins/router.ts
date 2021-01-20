import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Error404 from '@/Renderer/components/Error/404.vue'
import ProjectMain from '@/Renderer/components/Project/Main.vue'
import ProjectNew from '@/Renderer/components/Project/New.vue'
import ProjectOpen from '@/Renderer/components/Project/Open.vue'
import ProjectClose from '@/Renderer/components/Project/Close.vue'
import Manager from '@/Renderer/components/Manager/Main.vue'
import ManagerConfig from '@/Renderer/components/Manager/Config/Main.vue'
import ManagerScene from '@/Renderer/components/Manager/Scene/Main.vue'
import ManagerSceneScript from '@/Renderer/components/Manager/Scene/Script/Main.vue'
import ManagerSceneMap from '@/Renderer/components/Manager/Scene/Map/Main.vue'
import ManagerRestructure from '@/Renderer/components/Manager/Restructure/Main.vue'
import ManagerActor from '@/Renderer/components/Manager/Actor/Main.vue'
import ManagerAsset from '@/Renderer/components/Manager/Asset/Main.vue'
import ManagerAnimation from '@/Renderer/components/Manager/Data/Animation/Main.vue'
import ManagerSkill from '@/Renderer/components/Manager/Data/Skill/Main.vue'
import ManagerSprite from '@/Renderer/components/Manager/Data/Sprite/Main.vue'
import ManagerImage from '@/Renderer/components/Manager/Data/Image/Main.vue'
import ManagerAudio from '@/Renderer/components/Manager/Data/Audio/Main.vue'
import ManagerVideo from '@/Renderer/components/Manager/Data/Video/Main.vue'

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
                path: 'scene',
                component: ManagerScene
            },
            {
                path: 'scene/script/:key',
                component: ManagerSceneScript
            },
            {
                path: 'scene/map/:key',
                component: ManagerSceneMap
            },
            {
                path: 'actor',
                component: ManagerActor
            },
            {
                path: 'asset',
                component: ManagerAsset
            },
            {
                path: 'animation',
                component: ManagerAnimation
            },
            {
                path: 'skill',
                component: ManagerSkill
            },
            {
                path: 'sprite',
                component: ManagerSprite
            },
            {
                path: 'image',
                component: ManagerImage
            },
            {
                path: 'audio',
                component: ManagerAudio
            },
            {
                path: 'video',
                component: ManagerVideo
            },
            {
                path: 'config',
                component: ManagerConfig
            },
            {
                path: 'restructure/:cwd',
                component: ManagerRestructure
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
