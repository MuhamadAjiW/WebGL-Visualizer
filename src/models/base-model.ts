import { BufferInfo } from "../types/buffer-info";
import { squareMatrix3 } from "../types/matrix-type";

export abstract class BaseModel {
    protected gl: WebGLRenderingContext;
    protected vertexShader: WebGLShader;
    protected fragmentShader: WebGLShader;
    protected program: WebGLProgram;
    protected positionBuffer: WebGLBuffer;
    protected colorBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext) {
        // a_position is 4 dimensional, x, y, z, p
        const vertexSource = /*glsl*/`
            attribute vec4 a_position;
            attribute vec4 vertColor;
            varying vec4 fragColor;
            uniform mat3 u_matrix;

            void main() {
                // Multiply the position by the matrix. scale to 2D first because matrix is 3D
                vec2 position = (u_matrix * vec3(a_position.xy, 1)).xy;
                gl_Position = vec4(position, 0, 1);
                fragColor = vertColor;
            }
        `;

        // Color is RGBA, red, green, blue, alpha (transparency)
        const fragmentSource = /*glsl*/`
            precision mediump float;
            varying vec4 fragColor;

            void main() {
                gl_FragColor = fragColor;
            }
        `;
        
        this.gl = gl;
        this.vertexShader = this.createShader(vertexSource, this.gl.VERTEX_SHADER);
        this.fragmentShader = this.createShader(fragmentSource, this.gl.FRAGMENT_SHADER);
        this.program = this.createProgram(this.vertexShader, this.fragmentShader);
        this.positionBuffer = this.gl.createBuffer() as WebGLBuffer;
        this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
    }

    protected createShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type) as WebGLShader
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!success){
            const err: string = `Shader compilation failed: ${this.gl.getShaderInfoLog(shader)}`;

            console.log(err);
            this.gl.deleteShader(shader);
            throw err;
        }

        return shader;
        
    }

    protected createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const program = this.gl.createProgram() as WebGLProgram;
        
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!success){
            const err: string = `Shader compilation failed: ${this.gl.getProgramInfoLog(program)}`;

            console.log(err);
            this.gl.deleteProgram(program);
            throw err;
        }

        return program;
    }
    
    protected setPosition(buffer: BufferInfo): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW)
        
        var positionAttribLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.vertexAttribPointer(positionAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionAttribLocation);
    }
    
    protected setColor(buffer: BufferInfo): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW)
        
        var colorAttribLocation = this.gl.getAttribLocation(this.program, 'vertColor');
        this.gl.vertexAttribPointer(colorAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(colorAttribLocation);
    }

    protected setMatrix(matrix: squareMatrix3): void {
        this.gl.useProgram(this.program);
        const matrixUniformLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
        this.gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
    }

    protected clear(): void{
        if(this.fragmentShader) this.gl.deleteShader(this.fragmentShader);
        if(this.vertexShader) this.gl.deleteShader(this.vertexShader);
        if(this.program) this.gl.deleteProgram(this.program);
        if(this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
        if(this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);
    }

    abstract init(): void
    abstract draw(): void
}
