export default class EventDispatcher {
    on(type: string, listener: EventListener, options?: AddEventListenerOptions): void;
    off(type: string, listener: EventListener, options?: AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions): void;
    dispatchEvent(event: Event, catchErrors?: boolean): void;
}
