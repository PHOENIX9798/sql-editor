export class SqlBlockInfo {
    parent: SqlBlockInfo | null;
    isHeader: boolean;
    constructor(parent: SqlBlockInfo | null, isHeader: boolean) {
        this.parent = parent;
        this.isHeader = isHeader;
    }
}