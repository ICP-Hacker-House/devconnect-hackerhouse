import Editor from '../Editor';
/**
 * Replaces regular quotes with smart quotes as they are typed. Also affects pasted content.
 * Uses the text-changing event to prevent the original change and replace it with the new one. This makes the smart-
 * quotes act more seemlessly and includes them as part of regular text undo/redo instead of breaking it like the smart-
 * entry conversions do.
 */
export declare function smartQuotes(editor: Editor): {
    destroy(): void;
};
