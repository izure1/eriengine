<template>
  <v-dialog :value="value"
    persistent
    max-width="500"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>

      <v-card-text>
        <v-form>
          <div v-for="(input, i) in inputs"
            :key="`modal-form-input-${i}`"
          >
            <v-subheader>{{ input.text }}</v-subheader>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-text-field v-if="input.type === 'string'"
                  v-model="inputData[input.key]"
                  v-on="on"
                  type="text"
                  :label="input.description"
                  dense
                  filled
                  rounded
                />
                <v-text-field v-else-if="input.type === 'number'"
                  v-model="inputData[input.key]"
                  v-on="on"
                  type="number"
                  :label="input.description"
                  dense
                  filled
                  rounded
                />
                <v-switch v-else-if="input.type === 'boolean'"
                  v-model="inputData[input.key]"
                  v-on="on"
                  :label="input.description"
                  dense
                  inset
                />
              </template>
              <span class="text-caption">{{ input.description }}</span>
            </v-tooltip>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-center">
        <v-btn v-for="(button, i) in buttons"
          :key="`modal-form-button-${i}`"
          text
          @click="onClickButton(button.click)"
        >
          {{ button.text }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

export interface ModalInput<T> {
  key: keyof T
  type: 'string'|'number'|'boolean'
  text: string
  description: string
  defaultValue: string|number|boolean
}

export interface ModalInputResult {
  [key: string]: string|number|boolean
}

export interface ModalButton<T> {
  text: string
  click: (result: T) => void
}

@Component({
  props: {
    value: {
      type: Boolean,
      required: true
    }
  }
})
export default class ModalFormComponent<T extends object = ModalInputResult> extends Vue {
  private value!: boolean
  private title: string = ''
  private subtitle: string = ''
  private inputs: ModalInput<T>[] = []
  private inputData: T = {} as any
  private buttons: ModalButton<T>[] = []

  private get result(): T {
    const rawResult = JSON.parse(JSON.stringify(this.inputData)) as T
    for (const property in rawResult) {
      const input = this.getMatchedInput(property, this.inputs)
      if (input === null) {
        continue
      }

      let inputValue = rawResult[property] as any
      switch (input.type) {
        case 'string': {
          inputValue = inputValue.toString()
          break
        }
        case 'number': {
          inputValue = parseFloat(inputValue)
          break
        }
        case 'boolean': {
          break
        }
        default: {
          inputValue = inputValue.toString()
          break
        }
      }
      rawResult[property] = inputValue
    }

    return rawResult
  }

  private getMatchedInput(key: string, inputs: ModalInput<T>[]): ModalInput<T>|null {
    return inputs.find((input) => input.key === key) ?? null
  }
 
  private createInputData(inputs: ModalInput<T>[]): T {
    const inputData: any = {}
    for (const { key, defaultValue } of inputs) {
      inputData[key] = defaultValue
    }
    return inputData
  }

  setTitle(title: string): this {
    this.title = title
    return this
  }

  setSubtitle(subtitle: string): this {
    this.subtitle = subtitle
    return this
  }

  setInputs(inputData: ModalInput<T>[]): this {
    this.inputs = inputData
    this.inputData = this.createInputData(inputData)
    return this
  }

  setButtons(buttonData: ModalButton<T>[]): this {
    this.buttons = buttonData
    return this
  }

  private onClickButton(buttonCallback: (result: unknown) => void): void {
    buttonCallback(this.result)
  }
}
</script>