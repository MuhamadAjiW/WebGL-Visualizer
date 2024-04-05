import {BufferInfo, Uniforms} from "../types/buffer-info";
import {Coordinates} from "../types/coordinates";
import {BufferType} from "../types/enum/buffer-type";
import {ModelType} from "../types/enum/model-state";
import {id4, m4, Matrix4} from "../util/m4";

export class BaseModel {
    public type: ModelType = ModelType.NULL
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo = new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]};
    public x_translation: number = 0;
    public y_translation: number = 0;
    public z_rotation: number = 0;
    public width: number = 0;
    public length: number = 0;

    public getBufferData(type: BufferType, transformed: boolean): Array<Coordinates> {
        let retval: Array<Coordinates> = []

        let targetBuffer;
        switch (type) {
            case BufferType.COLOR:
                targetBuffer = this.colorBuffer;
                break;
            case BufferType.POSITION:
                targetBuffer = transformed ? this.positionBuffer.transform(this.uniforms) : this.positionBuffer;
                break;
            default:
                throw Error("Invalid type buffer requested");
        }

        for (let index = 0; index < targetBuffer.data.length; index += 4) {
            let coords = new Coordinates(
                targetBuffer.data[index],
                targetBuffer.data[index + 1],
                targetBuffer.data[index + 2],
                targetBuffer.data[index + 3]
            )
            retval.push(coords)
        }

        return retval;
    };

    public clone(): BaseModel {
        let retval = new BaseModel();
        retval.type = this.type;
        retval.positionBuffer = this.positionBuffer.clone();
        retval.colorBuffer = this.colorBuffer.clone();
        retval.uniforms = this.uniforms;
        retval.x_translation = this.x_translation;
        retval.y_translation = this.y_translation;
        retval.z_rotation = this.z_rotation;
        retval.length = this.length;
        retval.width = this.width;
        return retval;
    }

    public getCenter(): Coordinates {
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        let sumP = 0;
        for (let index = 0; index < this.positionBuffer.data.length; index += 4) {
            sumX += this.positionBuffer.data[index + 0];
            sumY += this.positionBuffer.data[index + 1];
            sumZ += this.positionBuffer.data[index + 2];
            sumP += this.positionBuffer.data[index + 3];
        }

        return new Coordinates(
            sumX / this.positionBuffer.len,
            sumY / this.positionBuffer.len,
            sumZ / this.positionBuffer.len,
            sumP / this.positionBuffer.len
        );
    }

    public generateUniform() {

        const center = this.getCenter();
        const matrixRotationT1 = m4.translation(-center.x, -center.y, 0);
        const matrixRotationT2 = m4.translation(center.x, center.y, 0);
        const matrixTranslationX = this.x_translation == 0 ? id4 : m4.translation(this.x_translation, 0, 0);
        const matrixTranslationY = this.y_translation == 0 ? id4 : m4.translation(0, this.y_translation, 0);
        const matrixRotation = m4.zRotation(this.z_rotation * Math.PI / 180);

        let widthScale: number
        if (this.width == -1) {
            widthScale = this.length != 0 ? 1 + (this.length / 30) : 1
        } else {
            widthScale = this.width != 0 ? 1 + (this.width / 30) : 1
        }
        const lengthScale: number = this.length != 0 ? 1 + (this.length / 30) : 1
        const matrixScale = m4.scaling(widthScale, lengthScale, 1);

        let u_matrix: Matrix4 = id4;
        u_matrix = m4.multiply(matrixRotationT1, u_matrix);
        u_matrix = m4.multiply(matrixScale, u_matrix);
        u_matrix = m4.multiply(matrixRotation, u_matrix);
        u_matrix = m4.multiply(matrixRotationT2, u_matrix);
        
        u_matrix = m4.multiply(matrixTranslationX, u_matrix);
        u_matrix = m4.multiply(matrixTranslationY, u_matrix);

        this.uniforms.u_matrix = u_matrix;
    }

    public moveVertex(index: number, targetX: number, targetY: number){}
}
