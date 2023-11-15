export interface ShortcutEventInit extends KeyboardEventInit {
    shortcut?: string;
}
export declare class ShortcutEvent extends KeyboardEvent {
    readonly shortcut: string;
    readonly osShortcut: string;
    readonly modShortcut: string;
    constructor(type: string, init?: ShortcutEventInit);
    static fromKeyboardEvent(event: KeyboardEvent): ShortcutEvent;
}
export interface KeyboardEventWithShortcut extends KeyboardEvent {
    shortcut?: string;
    osShortcut?: string;
    modShortcut?: string;
}
export declare function addShortcutsToEvent(event: KeyboardEventWithShortcut): KeyboardEventWithShortcut;
/**
 * Returns the textual representation of a shortcut given a keyboard event. Examples of shortcuts:
 * Cmd+L
 * Cmd+Shift+M
 * Ctrl+O
 * Backspace
 * T
 * Right
 * Shift+Down
 * Shift+F1
 * Space
 */
export declare function shortcutFromEvent(event: any): string;
