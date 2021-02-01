<template>
    <div>
        <div class="text-right">
            <v-tooltip left>
                <template v-slot:activator="{ on }">
                    <v-btn icon small v-on="on" @click="copy">
                        <v-icon small>mdi-content-copy</v-icon>
                    </v-btn>
                </template>
                <span>복사하기</span>
            </v-tooltip>
        </div>
        <code v-html="encodedText" ref="code"></code>
    </div>
</template>

<script lang="ts">
import { clipboard } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import Convert from 'ansi-to-html'

@Component({
    props: {
        print: {
            type: String,
            required: true
        }
    }
})
export default class ShellPrintComponent extends Vue {
    private print!: string
    private converter = new Convert({ stream: true, fg: '#333', bg: '#eee' })

    private get encodedText(): string {
        return this.converter.toHtml(this.print)
    }

    private copy(): void {
        const el: Element = this.$refs.code as Element
        const content: string|null = el?.textContent
        if (!content) {
            return
        }

        clipboard.writeText(content)
        this.$store.dispatch('snackbar', '복사 완료!')
    }
}
</script>

<style lang="scss" scoped>
code {
    font-family: Consolas;
    color: #333 !important;
    display: block;
    white-space: pre-wrap;
    padding: 10px;
}
</style>