import { BufferInfo } from "../types/buffer-info";
import { m3 } from "../util/m3";
import { BaseModel } from "./base-model";

export class SquareModel extends BaseModel {
    constructor(gl : WebGLRenderingContext) {
        super(gl);
    }
        
    draw(): void {
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
    }
    
    init(): void {
        // Ini harusnya ntar jadi parameter atau attribut sesuain sama kelasnya, aing testing doang di sini
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
        const rotationMatrix = m3.rotation(Math.PI / 4);
        const translationMatrix = m3.translation(0.5, 0.5)
        const resultMatrix = m3.multiply(rotationMatrix, translationMatrix)

        this.setPosition(positionData);
        this.setMatrix(resultMatrix);
        this.setColor(colorData);

        this.gl.useProgram(this.program);
    }
}