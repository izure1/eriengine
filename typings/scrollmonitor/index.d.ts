declare module 'scrollmonitor' {
    interface ElementLike {
        top: number
        bottom: number
    }
    interface ElementOffset {
        top?: number
        bottom?: number
    }
    type Events = 'visibilityChange'|'stateChange'|'enterViewport'|'fullyEnterViewport'|'exitViewport'|'partiallyExitViewport';
    export class ScrollWatcher {
        /** `true` if any part of the element is visible, `false` if not. */
        isInViewport: boolean
        /** `true` if the entire element is visible */
        isFullyInViewport: boolean
        /** `true` if any part of the element is above the viewport. */
        isAboveViewport: boolean
        /** `true` if any part of the element is below the viewport. */
        isBelowViewport: boolean
        /** distance from the top of the document to the top of this watcher. */
        top: number
        /** distance from the top of the document to the bottom of this watcher. */
        bottom: number
        /** top - bottom. */
        height: number
        /** the element, number, or object that this watcher is watching. */
        watchItem: string|HTMLElement|ElementLike|number|NodeList|Array<HTMLElement|ElementLike>

        on(event: Events, callback: () => void): void
        off(event: Events, callback: () => void): void
        one(event: Events, callback: () => void): void

        enterViewport(callback: () => void): void
        exitViewport(callback: () => void): void
        /** removes this watcher and clears out its event listeners. */
        destroy(): void
    }
    export interface ScrollContainer {
        viewportTop: number
        viewportBottom: number
        viewportHeight: number
        contentHeight: number
        documentHeight: number
        item: HTMLElement
        watchers: ScrollWatcher[]
        create(el: string|HTMLElement|ElementLike|number|NodeList|Array<HTMLElement|ElementLike>, offset?: number|ElementOffset): ScrollWatcher
        createContainer(containerEl: HTMLElement): ScrollContainer
        recalculateLocations(): void
        update(): void
        destroy(): void
    }
    const _: ScrollContainer;
    export default _;
}