import { h } from '../rendering/vdom';
const TableType = {
    name: 'table',
    selector: 'table td',
    renderMultiple(lines) {
        const first = lines[0][0].table;
        let row = h(first.startsWith('th-') ? 'th' : 'tr', { key: first });
        const table = h('table', null, [row]);
        for (let i = 0; i < lines.length; i++) {
            const [attributes, children, id] = lines[i];
            if (row.key !== attributes.table) {
                row = h(attributes.table.startsWith('th-') ? 'th' : 'tr', { key: attributes.table });
                table.children.push(row);
            }
            row.children.push(h('td', { key: id }));
        }
        return table;
    },
};
export function table(editor) {
    editor.typeset.lines.add(TableType);
    function onChanging(event) {
        // If text was deleted from a table, prevent the row from being deleted unless the _whole_ row was deleted
        // If text in a column was deleted, delete the whole column or none of it
        // i.e. always ensure a table has all the cells needed to keep it correct
    }
    function insertTable(rows, columns) {
    }
    function addColumn(direction) {
    }
    function addRow(direction) {
    }
    function deleteTable() {
    }
    function deleteColumn() {
    }
    function deleteRow() {
    }
    const addColumnLeft = () => addColumn(-1);
    const addColumnRight = () => addColumn(1);
    const addRowAbove = () => addRow(-1);
    const addRowBelow = () => addRow(1);
    return {
        commands: {
            insertTable,
            addColumn,
            addRow,
            deleteTable,
            deleteColumn,
            deleteRow,
            addColumnLeft,
            addColumnRight,
            addRowAbove,
            addRowBelow,
        },
    };
}
//# sourceMappingURL=tables.js.map