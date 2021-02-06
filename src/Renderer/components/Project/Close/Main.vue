<template>
    <div>초기화 중...</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class CloseComponent extends Vue {
    created(): void {
        this.$store.dispatch('closeProject')
        this.$router.replace('/dependencies').catch(() => null)
    }
}
</script>