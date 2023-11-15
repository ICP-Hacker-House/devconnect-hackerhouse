const SHOW = NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT;
export function createTreeWalker(root, filter) {
    return (root.ownerDocument || document).createTreeWalker(root, SHOW, {
        acceptNode(node) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue === '') {
                return NodeFilter.FILTER_REJECT;
            }
            else if (filter) {
                const result = filter(node);
                if (!result)
                    return NodeFilter.FILTER_REJECT;
                if (result === true)
                    return NodeFilter.FILTER_ACCEPT;
                return result;
            }
            else {
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    });
}
//# sourceMappingURL=walker.js.map