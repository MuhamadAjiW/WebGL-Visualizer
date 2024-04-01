import { BufferInfo, Uniforms } from "../types/buffer-info";

export class BaseShape {
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo =  new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: new Float32Array(16)};

    constructor() {
        this.positionBuffer =  new BufferInfo(
            4,
            [
                -0.5, 0.5, 0, 1,
                -0.5, -0.5, 0, 1,
                0.5, -0.5, 0, 1,
                0.5, 0.5, 0, 1
            ]
        )

        this.colorBuffer = new BufferInfo(
            4,
            [
                1.0, 0.0, 0.0, 1,
                0.0, 1.0, 0.0, 1,
                0.0, 0.0, 1.0, 1,
                0.5, 0.5, 0.5, 1
            ]
        )

        this.uniforms.u_matrix = 
            [
                1, 0, 0, 
                0, 1, 0,
                0, 0, 1, 
            ]
    }
}
