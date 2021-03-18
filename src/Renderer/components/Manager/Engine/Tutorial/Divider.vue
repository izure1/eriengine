<template>
    <div
        ref="wrapper"
        class="wrapper my-10"
    >
        <div class="animation-square" />
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import anime from 'animejs';
import scrollMonitor, { ScrollContainer, ScrollWatcher } from 'scrollmonitor';
import { isElement } from '@/Utils/typeGuard';

@Component
export default class DividerComponent extends Vue {
    private container: ScrollContainer|null = null;
    private watcher: ScrollWatcher|null = null;

    private get element(): HTMLElement|null {
        const el: unknown = this.$refs['wrapper'];
        if (isElement(el)) {
            return el as HTMLElement;
        }
        return null;
    }

    private get viewport(): HTMLElement|null {
        if (!this.element) {
            return null;
        }
        const el: unknown = document.querySelector('.main-view');
        if (isElement(el)) {
            return el as HTMLElement;
        }
        return null;
    }

    private playAnimation(): void {
        if (!this.element) {
            return;
        }
        const targets: HTMLElement|null = this.element.querySelector('.animation-square');
        anime({
            targets,
            width: 20,
            height: 20,
            translateX: {
                value: [ 120, 180 ],
                easing: 'linear'
            },
            translateY: {
                value: [ 0, 300 ],
                easing: 'easeInOutQuint'
            },
            backgroundColor: '#ef007c',
            rotate: {
                value: 700,
                duration: 1500,
                easing: 'easeInOutBack'
            },
            duration: 1000
        });
        console.log(targets);
    }

    private addViewportEnter(): void {
        if (!this.viewport) {
            return;
        }
        if (!this.element) {
            return;
        }
        this.container = scrollMonitor.createContainer(this.viewport);
        this.watcher = this.container.create(this.element);
        this.watcher.enterViewport((): void => {
            this.playAnimation();
        });
    }

    private removeViewportEvent(): void {
        if (this.watcher) {
            this.watcher.destroy();
            this.watcher = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    mounted(): void {
        this.addViewportEnter();
    }

    beforeDestroy(): void {
        this.removeViewportEvent();
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    width: 300px;
    height: 300px;
    margin: 0 auto;

    .animation-square {
        width: 5px;
        height: 5px;
        border-radius: 3px;
    }
}
</style>