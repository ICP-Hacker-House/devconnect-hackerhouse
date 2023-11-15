import { decorations } from './decorations';
import { rendering } from './rendering';
import { keyboard } from './keyboard';
import { input } from './input';
import { selection } from './selection';
import { paste } from './paste';
import { copy } from './copy';
export declare const defaultModules: {
    keyboard: typeof keyboard;
    input: typeof input;
    copy: typeof copy;
    paste: typeof paste;
    history: (editor: import("..").Editor) => {
        options: import("./history").Options;
        hasUndo: () => boolean;
        hasRedo: () => boolean;
        undo: () => void;
        redo: () => void;
        cutoffHistory: () => void;
        clearHistory: () => void;
        setStack: (value: import("./history").UndoStack) => void;
        getStack: () => import("./history").UndoStack;
        getActive(): {
            undo: boolean;
            redo: boolean;
        };
        commands: {
            undo: () => void;
            redo: () => void;
        };
        shortcuts: {
            'win:Ctrl+Z': string;
            'mac:Cmd+Z': string;
            'win:Ctrl+Y': string;
            'mac:Cmd+Shift+Z': string;
        };
        init(): void;
        destroy(): void;
    };
    decorations: typeof decorations;
    rendering: typeof rendering;
    selection: typeof selection;
};
