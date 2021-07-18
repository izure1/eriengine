<template>
  <particles-bg
    :type="type"
    :num="10"
    :bg="true"
    class="bg-particles"
  />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ParticlesBg } from 'particles-bg-vue'

// eslint-disable-next-line no-unused-vars
enum ParticlesType {
  // eslint-disable-next-line no-unused-vars
  Ball        = 'ball',
  // eslint-disable-next-line no-unused-vars
  Circle      = 'circle',
  // eslint-disable-next-line no-unused-vars
  Cobweb      = 'cobweb',
  // eslint-disable-next-line no-unused-vars
  Polygon     = 'polygon',
  // eslint-disable-next-line no-unused-vars
  Square      = 'square'
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