<template>
  <v-container>
    <v-row>
      <v-col v-for="col in links"
        :key="`enginehome-${col.subheader}`"
      >
        <v-list>
          <v-subheader>{{ col.subheader }}</v-subheader>
          <v-list-item v-for="({ text, uri }, i) in col.lists"
            :key="`enginehome-${col.subheader}-${i}`"
            two-line
            dense
          >
            <v-list-item-content>
              <v-list-item-title class="primary--text">
                <a v-if="isExternal(uri)"
                  href="javascript:void(0)" 
                  @click="openExternal(uri)"
                >
                  {{ text }}
                </a>
                <a v-else
                  href="javascript:void(0)" 
                  @click="openComponent(uri)"
                >
                  {{ text }}
                </a>
              </v-list-item-title>
              <v-list-item-subtitle v-if="isExternal(uri)"
                class="text-caption"
              >
                {{ uri }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { shell } from 'electron'

import { Vue, Component, Prop } from 'vue-property-decorator'

import { uri } from '@/Utils/Regexps'

interface Link {
  text: string
  uri: string
}

export interface LinkList {
  subheader: string
  lists: Link[]
}

@Component({
  props: {
    links: {
      type: () => Object as () => LinkList[],
      required: true
    }
  }
})
export default class EngineHomeLinkComponent extends Vue {
  @Prop() private links!: LinkList[]

  private isExternal(testUri: string): boolean {
    return uri.test(testUri)
  }

  private openExternal(uri: string): void {
    shell.openExternal(uri)
  }

  private openComponent(uri: string): void {
    this.$router.replace(uri).catch(() => null)
  }
}
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
