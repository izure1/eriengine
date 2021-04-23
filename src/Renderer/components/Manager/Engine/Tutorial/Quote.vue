<template>
    <div :style="{ width: `${$props.width}px` }">
    
        <div class="text-left">
            <v-icon>{{ $props.prefixIcon }}</v-icon>
        </div>

        <div class="text-center">
            <article class="px-10 d-inline-block text-left text-body-1">
                <slot name="message"></slot>
            </article>
        </div>

        <div class="text-right">
            <v-icon>{{ $props.suffixIcon }}</v-icon>
        </div>
        
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
    props: {
        width: {
            type: Number,
            default: 800
        },
        'prefix-icon': {
            type: String,
            default: 'mdi-format-quote-open'
        },
        'suffix-icon': {
            type: String,
            default: 'mdi-format-quote-close'
        }
    }
})
export default class TutorialQuoteComponent extends Vue {
}
</script>

<style lang="scss" scoped>
.quote {
    width: 1200px;
    margin: 0 auto;

    >article {
        width: auto;
        max-width: 90%;
        margin: 0 auto;
    }
}
</style>