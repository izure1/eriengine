<template>
    <div>
        <v-card-title class="d-flex justify-center grey--text text--darken-3 text-h3 mt-10">
            <slot name="title" />
        </v-card-title>
        <v-card-subtitle class="mt-0 text-center">
            <slot name="subtitle" />
        </v-card-subtitle>
        <v-card-text class="blue-grey--text text--darken-4 text-center mt-10">

            <v-row class="justify-center">
                <quote-component :width="$props.quoteWidth">
                    <template #message>
                        <span class="blue-grey--text text-h6">
                            <slot name="quote" />
                        </span>
                    </template>
                </quote-component>
            </v-row>

            <div class="mt-15 text-body-2">
                <slot name="description" />
            </div>
        </v-card-text>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import QuoteComponent from './Quote.vue'

@Component({
    props: {
        quoteWidth: {
            type: Number,
            default: 550
        }
    },
    components: {
        QuoteComponent
    }
})
export default class IndentComponent extends Vue {}
</script>

<style lang="scss" scoped>

</style>