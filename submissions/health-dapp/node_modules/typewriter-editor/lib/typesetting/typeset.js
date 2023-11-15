const EMPTY_ARR = [];
const lineTypes = {};
const formatTypes = {};
const embedTypes = {};
const shouldCombine = (prev, next) => true;
export class Typeset {
    constructor(types) {
        var _a, _b, _c;
        const lines = (_a = types.lines) === null || _a === void 0 ? void 0 : _a.map(entry => typeof entry === 'string' ? lineTypes[entry] : entry).filter(Boolean);
        const formats = (_b = types.formats) === null || _b === void 0 ? void 0 : _b.map(entry => typeof entry === 'string' ? formatTypes[entry] : entry).filter(Boolean);
        const embeds = (_c = types.embeds) === null || _c === void 0 ? void 0 : _c.map(entry => typeof entry === 'string' ? embedTypes[entry] : entry).filter(Boolean);
        this.lines = new Types(lines || EMPTY_ARR);
        this.formats = new Types(formats || EMPTY_ARR);
        this.embeds = new Types(embeds || EMPTY_ARR);
    }
}
Typeset.line = line;
Typeset.format = format;
Typeset.embed = embed;
export function line(type) {
    if (type.renderMultiple && !type.shouldCombine)
        type.shouldCombine = shouldCombine;
    return lineTypes[type.name] = type;
}
export function format(type) {
    return formatTypes[type.name] = type;
}
export function embed(type) {
    return embedTypes[type.name] = type;
}
/**
 * A type store to hold types and make it easy to manage them.
 */
export class Types {
    constructor(types) {
        this.list = types;
        this.init();
    }
    get default() {
        return this.list[0];
    }
    init() {
        this.selector = this.list.map(type => type.selector || '').filter(Boolean).join(', ');
        this.types = this.list.reduce((types, type) => { types[type.name] = type; return types; }, {});
        this.priorities = this.list.reduce((priorities, type, i) => { priorities[type.name] = i; return priorities; }, {});
    }
    add(type) {
        this.list.push(type);
        this.init();
    }
    remove(type) {
        const name = typeof type === 'string' ? type : type.name;
        this.list = this.list.filter(type => type.name !== name);
        this.init();
    }
    get(name) {
        return this.types[name];
    }
    priority(name) {
        // Attribute keys that do not have types assigned to them need a default sorting value.
        // A default value of -1 means that "loose" attribute keys do not corrupt priority sorting
        //   and are sorted to the back of the list in rendering.ts::renderInline()
        const priority = this.priorities[name];
        return priority !== undefined ? priority : -1;
    }
    // Whether or not the provided element is one of our types
    matches(node) {
        if (!node)
            return false;
        if (!node.nodeType)
            throw new Error('Cannot match against ' + node);
        if (node.nodeType === Node.ELEMENT_NODE) {
            return this.selector ? node.matches(this.selector) : false;
        }
    }
    findByNode(node, fallbackToDefault = false) {
        if (node.nodeType !== Node.ELEMENT_NODE)
            return;
        let i = this.list.length;
        while (i--) {
            let type = this.list[i];
            if (node.matches(type.selector))
                return type;
        }
        if (fallbackToDefault)
            return this.default;
    }
    findByAttributes(attributes, fallbackToDefault = false) {
        const keys = attributes && Object.keys(attributes);
        let type;
        keys && keys.every(name => !(type = this.get(name)));
        return type || (fallbackToDefault ? this.default : undefined);
    }
}
//# sourceMappingURL=typeset.js.map