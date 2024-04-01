export class BufferInfo {
    public len: number;
    public data: Float32Array;

    constructor(len: number, data: Array<number>) {
        this.len = len;
        this.data = new Float32Array(data);
    }
}

export interface Uniforms {
    [key: string]: Array<number> | Float32Array;
}
