import { BufferInfo, Uniforms } from "../types/buffer-info";

export class BaseModel {
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo =  new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]};

    constructor() {
        
    }
}
