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
import { Vue, Component, Watch } from 'vue-property-decorator'
import Convert from 'ansi-to-html'
import * as RegExp from '@/Utils/Regexps'

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
        const html = this.converter.toHtml(this.print).replace(RegExp.uri, (match: string): string => `<a href="${match}" target="_blank">${match}</a>`)
        return this.converter.toHtml(html)
    }

    private copy(): void {
        const el: Element = this.$refs.code as Element
        const content = el?.textContent
        if (!content) {
            return
        }

        clipboard.writeText(content)
        this.$store.dispatch('snackbar', '복사 완료!')
    }

    @Watch('print')
    private onPrintChange(): void {
        this.$nextTick((): void => {
            const el: Element = this.$refs.code as Element
            if (!el) {
                return
            }
            el.scrollTop = el.scrollHeight
        })
    }
}
</script>

<style lang="scss" scoped>
code {
    font-family: Consolas;
    max-height: 380px;
    color: #333 !important;
    display: block;
    white-space: pre-wrap;
    overflow: auto;
    padding: 10px;
}
</style>