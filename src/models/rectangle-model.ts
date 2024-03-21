import { BufferInfo } from "../types/buffer-info";
import { BaseModel } from "./base-model";

export class RectangleModel extends BaseModel {
    constructor(gl : WebGLRenderingContext) {
        super(gl);
    }
        
    draw(): void {
        const positionData = new BufferInfo(
            4,
            [
                -0.5, 0.5, 0, 1,
                -0.5, -0.5, 0, 1,
                0.5, -0.5, 0, 1,
                0.5, 0.5, 0, 1
            ]
        )
    
        const colorData = new BufferInfo(
            4,
            [
                1.0, 0.0, 0.0, 1,
                0.0, 1.0, 0.0, 1,
                0.0, 0.0, 1.0, 1,
                0.5, 0.5, 0.5, 1
            ]
        )
    
        this.setPosition(positionData);
        this.setColor(colorData);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
    }

    init(): void {
        this.gl.useProgram(this.program);
    }
}