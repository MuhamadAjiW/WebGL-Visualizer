export class BufferInfo {
    public len: number;
    public data: Float32Array;

    constructor(len: number, data: Array<number>) {
        this.len = len;
        this.data = new Float32Array(data);
    }

    public transform(uniform : Uniforms) : BufferInfo {
        let retval = this.clone();
        let multiplier = Array.from(uniform.u_matrix);
        console.log(multiplier);
        console.log(retval.data);

        // TODO: Optimize
        for (let i = 0; i < this.data.length; i += 4) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for(let k = 0; k < 4; k++){
                    sum += multiplier[j + k * 4] * this.data[i + k];
                }
                retval.data[i + j] = sum;
            }
        }
        console.log(retval.data);

        return retval;
    }

    public clone() : BufferInfo{
        return new BufferInfo(this.len, Array.from(this.data));
    }
}

export interface Uniforms {
    [key: string]: Array<number> | Float32Array;
}
