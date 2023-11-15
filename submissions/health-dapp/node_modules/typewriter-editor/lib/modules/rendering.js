import { render as renderWhole, renderChanges } from '../rendering/rendering';
export function rendering(editor) {
    editor.on('change', onChange);
    function render(what) {
        if (!what) {
            const { doc } = editor.modules.decorations || editor;
            renderWhole(editor, doc);
        }
        else {
            const { doc, old } = what;
            if (old && doc) {
                renderChanges(editor, old, doc);
            }
            else if (doc) {
                renderWhole(editor, doc);
            }
        }
    }
    function onChange(event) {
        const { doc, old } = editor.modules.decorations || event;
        if (old.lines !== doc.lines) {
            renderChanges(editor, old, doc);
        }
    }
    return {
        render,
        destroy() {
            editor.off('change', onChange);
        }
    };
}
//# sourceMappingURL=rendering.js.map