<template>
  <shell-print-component :print="text" />
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import Stream from 'stream'
import { readFromMain } from '@/Utils/stream'

import ShellPrintComponent from './Print.vue'

@Component({
  components: {
    ShellPrintComponent
  },
  props: {
    channel: {
      type: String,
      required: true
    },
    clear: {
      type: Number,
      default: 0
    }
  }
})
export default class PrintComponent extends Vue {
  private channel!: string
  private streamReader: Stream.Readable|null = null
  private text: string = ''

  private listen(): void {
    this.streamReader = readFromMain(this.channel)
    this.streamReader.setEncoding('utf-8').on('data', (data: string): void => {
      this.text += data
    })
  }

  private unlisten(): void {
    if (this.streamReader) {
      this.streamReader.destroy()
      this.streamReader = null
    }
  }

  @Watch('channel')
  private onChangeChannel(): void {
    this.unlisten()
    this.listen()
  }

  @Watch('clear')
  private onChangeClear(): void {
    this.text = ''
  }

  mounted(): void {
    this.listen()
  }

  beforeDestroy(): void {
    this.unlisten()
  }
}
</script>