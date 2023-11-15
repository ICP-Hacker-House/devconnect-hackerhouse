import Editor from '../Editor';
interface PlaceholderOptions {
    keepAttribute?: boolean;
}
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
export declare function placeholder(placeholder: string | Function, options?: PlaceholderOptions): (editor: Editor) => {
    destroy(): void;
};
export {};
