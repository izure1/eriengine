<template>
    <particles-bg
        :type="type"
        :num="10"
        :bg="true"
        class="bg-particles"
    />
</template>

<script lang="ts">
import { PropType } from 'vue'
import { Vue, Component } from 'vue-property-decorator'
import { ParticlesBg } from 'particles-bg-vue'

enum ParticlesType {
    ball        = 'ball',
    circle      = 'circle',
    cobweb      = 'cobweb',
    polygon     = 'polygon',
    square      = 'square'
}

@Component({
    components: {
        ParticlesBg
    },
    props: {
        type: {
            type: String,
            default: (): String => {
                return Object.values(ParticlesType).sort((): number => Math.random() > 0.5 ? 1 : -1).pop()!
            }
        },
        num: {
            type: Number,
            default: 10
        },
        bg: {
            type: Boolean,
            default: true
        }
    }
})
export default class ParticleBgComponent extends Vue {
    private type!: string
    private num!: number
    private bg!: boolean
}
</script>

<style lang="scss" scoped>
.bg-particles {
    opacity: 0.3;
}
</style>