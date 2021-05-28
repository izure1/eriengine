<template>
  <v-card
    flat
    tile
    @click="openExternal"
    :min-width="$props.minWidth"
    :min-height="$props.minHeight"
    :max-width="$props.maxWidth"
    :max-height="$props.maxHeight"
    class="ma-5"
    elevation="1"
  >
    <v-img class="white--text align-end"
      :src="$props.backgroundImage"
    >
      <v-card-title class="text-h3">
        <slot name="title" />
      </v-card-title>
    </v-img>

    <v-card-subtitle>
      <slot name="subtitle" />
    </v-card-subtitle>

    <v-card-text>
      <slot name="text" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

@Component({
  props: {
    'min-width': {
      type: Number,
      default: 350
    },
    'min-height': {
      type: Number,
      default: 400
    },
    'max-width': {
      type: Number,
      default: 350
    },
    'max-height': {
      type: Number,
      default: 400
    },
    'background-image': {
      type: String,
      default: ''
    },
    uri: {
      type: String,
      default: ''
    }
  }
})
export default class CardComponent extends Vue {
  private uri!: string
  
  private openExternal(): void {
    shell.openExternal(this.uri)
  }
}
</script>