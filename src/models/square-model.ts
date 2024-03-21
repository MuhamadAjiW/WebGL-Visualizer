import { BaseModel } from "./base-model";

export class SquareModel extends BaseModel {
    constructor(gl : WebGLRenderingContext) {
        super(gl);
    }
        
    draw(): void {
        throw new Error("Method not implemented.");
    }
    init(): void {
        throw new Error("Method not implemented.");
    }
}