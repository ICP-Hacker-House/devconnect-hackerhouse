import Editor from '../Editor';
export declare function table(editor: Editor): {
    commands: {
        insertTable: (rows: number, columns: number) => void;
        addColumn: (direction: -1 | 1) => void;
        addRow: (direction: -1 | 1) => void;
        deleteTable: () => void;
        deleteColumn: () => void;
        deleteRow: () => void;
        addColumnLeft: () => void;
        addColumnRight: () => void;
        addRowAbove: () => void;
        addRowBelow: () => void;
    };
};
