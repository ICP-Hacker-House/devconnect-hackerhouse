import isEqual from '../util/isEqual';
/**
 * Set placeholder text in the editable area when there is no content. Then add the css:
 *
 * ```css
 * .placeholder {
 *   position: relative;
 * }
 * .placeholder::before {
 *   content: attr(data-placeholder);
 *   position: absolute;
 *   left: 0;
 *   right: 0;
 *   opacity: 0.5;
 * }
 * ```
 */
export function placeholder(placeholder, options) {
    return (editor) => {
        function onDecorate({ doc }) {
            var _a, _b, _c;
            const decorator = editor.modules.decorations.getDecorator('placeholder');
            const text = (typeof placeholder === 'function' ? placeholder() : placeholder) || '';
            let lastDecorations;
            if (decorator.hasDecorations()) {
                const ops = decorator.getDecoration().ops;
                const last = ops[ops.length - 1];
                lastDecorations = (_b = (_a = last.attributes) === null || _a === void 0 ? void 0 : _a.decoration) === null || _b === void 0 ? void 0 : _b.placeholder;
            }
            const { lines } = editor.typeset;
            const type = lines.findByAttributes((_c = doc.lines[0]) === null || _c === void 0 ? void 0 : _c.attributes, true);
            const showPlaceholder = lines.default === type && doc.length === 1;
            if (showPlaceholder || (options === null || options === void 0 ? void 0 : options.keepAttribute)) {
                const attributes = { 'data-placeholder': text || '' };
                if (showPlaceholder)
                    attributes.class = 'placeholder';
                if (!isEqual(attributes, lastDecorations)) {
                    decorator.remove();
                    decorator.decorateLine(0, attributes).apply();
                }
            }
            else {
                decorator.remove();
            }
        }
        editor.addEventListener('decorate', onDecorate);
        return {
            destroy() {
                editor.removeEventListener('decorate', onDecorate);
            }
        };
    };
}
//# sourceMappingURL=placeholder.js.map