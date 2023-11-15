import { getLineNodeEnd, getLineNodeStart } from './rendering';
import { isBRPlaceholder } from './html';
import { createTreeWalker } from './walker';
const EMPTY_NODE_OFFSET = [null, 0];
export function getIndexFromPoint(editor, x, y) {
    const document = editor.root.ownerDocument;
    if ('caretPositionFromPoint' in document) {
        try {
            const pos = document.caretPositionFromPoint(x, y);
            if (pos) {
                return getIndexFromNodeAndOffset(editor, pos.offsetNode, pos.offset);
            }
        }
        catch (_) { }
    }
    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);
        if (range) {
            return getIndexFromNodeAndOffset(editor, range.startContainer, range.startOffset);
        }
    }
    return null;
}
// Return the line that matches a point and true if the point comes after the midpoint of the line display
export function getLineInfoFromPoint(editor, y) {
    const { root } = editor;
    if (!root.ownerDocument)
        return;
    const lineElements = Array.from(root.querySelectorAll(editor.typeset.lines.selector))
        .filter(elem => elem.key);
    const last = lineElements[lineElements.length - 1];
    for (const element of lineElements) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom >= y || element === last) {
            const line = editor.doc.getLineBy(element.key);
            return { line, element, rect, belowMid: y > rect.top + rect.height / 2 };
        }
    }
}
// Get a browser range object for the given editor range tuple
export function getBrowserRange(editor, range) {
    if (range[0] > range[1])
        range = [range[1], range[0]];
    const [anchorNode, anchorOffset, focusNode, focusOffset] = getNodesForRange(editor, range);
    const browserRange = editor.root.ownerDocument.createRange();
    if (anchorNode && focusNode) {
        browserRange.setStart(anchorNode, anchorOffset);
        browserRange.setEnd(focusNode, focusOffset);
    }
    return browserRange;
}
export function getBoudingBrowserRange(editor, range) {
    const browserRange = getBrowserRange(editor, range);
    if ((browserRange === null || browserRange === void 0 ? void 0 : browserRange.endContainer.nodeType) === Node.ELEMENT_NODE) {
        try {
            browserRange.setEnd(browserRange.endContainer, browserRange.endOffset + 1);
        }
        catch (e) { }
    }
    return browserRange;
}
export function getIndexFromNodeAndOffset(editor, node, offset, current) {
    var _a;
    const { root } = editor;
    const { lines } = editor.typeset;
    if (!root.contains(node)) {
        return -1;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length === offset) {
            if (getLineNodeEnd(root, node) != null)
                return getLineNodeEnd(root, node) - 1;
            if (node.childNodes.length) {
                node = node.childNodes[offset - 1];
                offset = getNodeLength(editor, node);
            }
        }
        else {
            node = node.childNodes[offset];
            offset = 0;
        }
        const start = getLineNodeStart(root, node);
        if (start != null) {
            // If the node is frozen, we are getting the index of the start of the node (e.g. <hr>)
            if ((_a = lines.findByNode(node)) === null || _a === void 0 ? void 0 : _a.frozen) {
                return start + offset;
            }
            // Otherwise the selection fell between line nodes, if we came from before, we will go inside, if we came from inside, we will skip to before
            return (current == null || current < start ? start : start - 1) + offset;
        }
    }
    return getIndexFromNode(editor, node) + offset;
}
// Get the index the node starts at in the content
export function getIndexFromNode(editor, startNode) {
    var _a;
    const { root } = editor;
    if (!root.ownerDocument)
        return -1;
    const { lines, embeds } = editor.typeset;
    const walker = createTreeWalker(root);
    walker.currentNode = startNode;
    let node;
    let index = 0;
    let start;
    while ((node = walker.previousNode())) {
        if (node === root)
            break;
        else if ((start = getLineNodeStart(root, node)) != null) {
            index += start;
            break;
        }
        else if (node.nodeType === Node.TEXT_NODE)
            index += textNodeLength(lines, node);
        else if ((_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains('decoration'))
            index;
        else if (embeds.matches(node) && !isBRPlaceholder(editor, node))
            index++;
        else if (lines.matches(node) && editor.doc.lines[0].id !== node.key)
            index++;
    }
    return index;
}
export function getLineElementAt(editor, index) {
    const { root } = editor;
    if (!root.ownerDocument)
        return;
    const childNodes = Array.from(root.childNodes);
    return childNodes.find((line) => getLineNodeStart(root, line) <= index && getLineNodeEnd(root, line) > index);
}
export function getNodeLength(editor, parentNode) {
    var _a;
    const { lines, embeds } = editor.typeset;
    if (embeds.matches(parentNode) && !isBRPlaceholder(editor, parentNode)) {
        return 1;
    }
    if (parentNode.nodeType === Node.TEXT_NODE)
        return textNodeLength(lines, parentNode);
    const walker = createTreeWalker(parentNode);
    let length = lines.findByNode(parentNode) ? 1 : 0, node;
    while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE)
            length += textNodeLength(lines, node);
        else if ((_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains('decoration'))
            length;
        else if (embeds.matches(node) && !isBRPlaceholder(editor, node))
            length++;
        else if (lines.matches(node))
            length++;
    }
    return length;
}
// Get the browser nodes and offsets for the range (a tuple of indexes) of this view
export function getNodesForRange(editor, range) {
    if (range == null) {
        return [null, 0, null, 0];
    }
    else {
        const anchorFirst = range[0] <= range[1];
        const direction = anchorFirst ? 1 : -1;
        const isCollapsed = range[0] === range[1];
        const [anchorNode, anchorOffset, frozen] = getNodeAndOffset(editor, range[0], anchorFirst ? 0 : 1);
        const [focusNode, focusOffset] = isCollapsed && !frozen
            ? [anchorNode, anchorOffset]
            : frozen && (isCollapsed || range[1] - range[0] === direction * editor.doc.getLineAt(range[0]).length)
                ? [anchorNode, anchorOffset + (anchorFirst ? 1 : -1)]
                : getNodeAndOffset(editor, range[1], anchorFirst ? 1 : 0);
        return [anchorNode, anchorOffset, focusNode, focusOffset];
    }
}
export function getNodeAndOffset(editor, index, direction) {
    var _a;
    const { root } = editor;
    if (!root.ownerDocument)
        return EMPTY_NODE_OFFSET;
    const { lines, embeds } = editor.typeset;
    const childNodes = Array.from(root.childNodes);
    const line = getLineElementAt(editor, index);
    if (!line)
        return EMPTY_NODE_OFFSET;
    const type = lines.findByNode(line, true);
    if (type.frozen) {
        return [line.parentNode, childNodes.indexOf(line) + direction, true];
    }
    index -= getLineNodeStart(root, line);
    const atStart = !index;
    const walker = createTreeWalker(line);
    let node, firstLineSeen = false;
    while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) {
            const size = textNodeLength(lines, node);
            if (index <= size)
                return [node, index];
            index -= size;
        }
        else if ((_a = node.classList) === null || _a === void 0 ? void 0 : _a.contains('decoration')) {
        }
        else if (embeds.matches(node) && !isBRPlaceholder(editor, node)) {
            const embed = embeds.findByNode(node);
            if (!embed || embed.fromDom === false) {
                continue;
            }
            index -= 1;
            // If the selection lands after this embed, and the next node isn't a text node, place the selection
            if (index <= 0) {
                const children = Array.from(node.parentNode.childNodes);
                return [node.parentNode, children.indexOf(node) + 1 + index];
            }
        }
        else if (lines.matches(node)) {
            if (firstLineSeen)
                index -= 1;
            else
                firstLineSeen = true;
            // If the selection lands at the beginning of a line, and the first node isn't a text node, place the selection
            if (index === 0) {
                const first = walker.firstChild();
                if (first && first.nodeType === Node.TEXT_NODE) {
                    return [first, 0];
                }
                else if (first) {
                    const children = Array.from(node.childNodes);
                    return [node, children.indexOf(first)];
                }
                else {
                    return [node, 0];
                }
            }
        }
    }
    return atStart ? [line, 0] : EMPTY_NODE_OFFSET;
}
export function textNodeLength(lines, node) {
    const value = node.nodeValue || '';
    if (value.trim() || !(lines.matches(node.previousSibling) || lines.matches(node.nextSibling))) {
        return value.length;
    }
    return 0;
}
//# sourceMappingURL=position.js.map