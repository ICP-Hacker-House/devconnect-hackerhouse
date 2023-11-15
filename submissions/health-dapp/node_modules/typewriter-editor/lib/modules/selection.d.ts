import Editor from '../Editor';
export declare function selection(editor: Editor): {
    pause: () => void;
    resume: () => void;
    renderSelection: () => void;
    init(): void;
    destroy(): void;
};
