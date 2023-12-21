export interface ISqlStatement {
    originalText: string;
    text: string;
    offset: number;
    length: number;
    startLine: number;
    startColumn: number;
    stopLine: number;
    stopColumn: number;
}