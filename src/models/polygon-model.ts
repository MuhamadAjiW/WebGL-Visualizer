import { BaseModel } from "./base-model";

export class PolygonModel extends BaseModel {
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