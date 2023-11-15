import Editor from './Editor';
export default function asRoot(root: HTMLElement, editor: Editor): {
    update: (newEditor: Editor) => void;
    destroy: () => void;
};
