import { BufferInfo } from "../types/buffer-info";
import { BaseModel } from "./base-model";

export class RectangleModel extends BaseModel {
    constructor() {
        super()
        
        this.positionBuffer =  new BufferInfo(
            4,
            [
                100, 100, 0, 1,
                0, 100, 0, 1,
                0, 0, 0, 1,
                100, 0, 0, 1
            ]
        )
        this.colorBuffer = new BufferInfo(
            4,
            [
                1.0, 0.0, 0.0, 1,
                1.0, 0.0, 0.0, 1,
                1.0, 0.0, 0.0, 1,
                0.0, 0.0, 1, 1
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