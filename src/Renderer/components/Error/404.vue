<template>
  <v-app>
    <v-main>
      <v-card
        flat
        tile
      >
        <v-card-title>아이~씻팔!!!  ٩(╬ʘ益ʘ╬)۶	</v-card-title>
        
        <v-card-text>
          알 수 없는 오류가 발생했습니다.
          <br>
          <strong>{{ $route.path }}</strong>은(는) 존재하지 않은 컴포넌트입니다.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn icon @click="goBack">
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
          <v-spacer />
        </v-card-actions>

      </v-card>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Error404Component extends Vue {
    private goBack(): void {
        this.$router.replace('/').catch(() => null)
    }
}
</script>