import vertexShaderSource from "../shaders/vertex-shader-2d.vert?raw";
import fragmentShaderSource from "../shaders/fragment-shader-2d.frag?raw";
import { BufferInfo } from "../types/buffer-info";
import { BaseModel } from "../models/base-model";
import { ModelType } from "../types/enum/model-state";

export class WebGlWindow {
    public canvas: HTMLCanvasElement;
    public gl: WebGLRenderingContext;
    protected vertexShader: WebGLShader;
    protected fragmentShader: WebGLShader;
    protected program: WebGLProgram;
    protected positionAttribLocation: number;
    protected colorAttribLocation: number;
    protected positionBuffer: WebGLBuffer;
    protected colorBuffer: WebGLBuffer;
    protected uniformSetters: UniformSetters;

    constructor(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl") as WebGL2RenderingContext;
        if (!this.gl) alert("No webgl support");

        // Create the shader program
        this.vertexShader = this.createShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        this.fragmentShader = this.createShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        this.program = this.createProgram(this.vertexShader, this.fragmentShader);

        this.positionAttribLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.colorAttribLocation = this.gl.getAttribLocation(this.program, "vertColor");

        this.uniformSetters = this.createUniformSetters(this.gl, this.program);
        console.log(this.uniformSetters);
        
        this.positionBuffer = this.gl.createBuffer() as WebGLBuffer;
        this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
    }

    public draw(baseShapes: BaseModel[]): void {
        this.gl.useProgram(this.program);
        this.resizeCanvasToDisplaySize(this.canvas);
        this.setUniforms(this.uniformSetters, {u_resolution: [this.canvas.width, this.canvas.height]});
        console.log(this.canvas.width, this.canvas.height);
        
        
        baseShapes.forEach((baseShape: BaseModel) => {
            this.gl.useProgram(this.program);
            this.setUniforms(this.uniformSetters, baseShape.uniforms);
            this.setPosition(baseShape.positionBuffer);
            this.setColor(baseShape.colorBuffer);

            switch (baseShape.type) {
                case ModelType.LINE:
                    this.gl.drawArrays(this.gl.LINES, 0, baseShape.positionBuffer.len);
                    break;

                case ModelType.SQUARE:
                    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
                    break;

                case ModelType.RECTANGLE:
                    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
                    break;

                case ModelType.POLYGON:
                    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
                    break;
            
                case ModelType.NULL:
                    throw Error("Tried to draw null type model")
            }
        });
    }

    protected createShader(source: string, type: number): WebGLShader {
        const shader = this.gl.createShader(type) as WebGLShader;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!success) {
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
        if (!success) {
            const err: string = `Shader compilation failed: ${this.gl.getProgramInfoLog(program)}`;

            console.log(err);
            this.gl.deleteProgram(program);
            throw err;
        }

        return program;
    }
    protected setPosition(buffer: BufferInfo): void {
        this.gl.enableVertexAttribArray(this.positionAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.positionAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
    }

    protected setColor(buffer: BufferInfo): void {
        this.gl.enableVertexAttribArray(this.colorAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.colorAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
    }

    protected setUniforms(setters: UniformSetters, ...values: { [key: string]: any }[]) {
        for (const uniforms of values) {
            Object.keys(uniforms).forEach(function (name) {
                const setter = setters[name];
                console.log(name, uniforms[name]);
                if (setter) {
                    setter(uniforms[name]);
                }
            });
        }
    }

    protected createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
        function createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo) {
            const location = gl.getUniformLocation(program, uniformInfo.name);
            const type = uniformInfo.type;
            const isArray = uniformInfo.size > 1 && uniformInfo.name.substring(-3) === "[0]";
            if (type === gl.FLOAT && isArray) {
                return function (v: Iterable<number>) {
                    gl.uniform1fv(location, v);
                };
            }
            if (type === gl.FLOAT) {
                return function (v: number) {
                    gl.uniform1f(location, v);
                };
            }
            if (type === gl.FLOAT_VEC2) {
                return function (v: Iterable<number>) {
                    gl.uniform2fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC3) {
                return function (v: Iterable<number>) {
                    gl.uniform3fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC4) {
                return function (v: Iterable<number>) {
                    gl.uniform4fv(location, v);
                };
            }
            if (type === gl.INT && isArray) {
                return function (v: Iterable<number>) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.INT) {
                return function (v: number) {
                    gl.uniform1i(location, v);
                };
            }
            if (type === gl.INT_VEC2) {
                return function (v: Iterable<number>) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.INT_VEC3) {
                return function (v: Iterable<number>) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.INT_VEC4) {
                return function (v: Iterable<number>) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.BOOL) {
                return function (v: Iterable<number>) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC2) {
                return function (v: Iterable<number>) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC3) {
                return function (v: Iterable<number>) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC4) {
                return function (v: Iterable<number>) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.FLOAT_MAT2) {
                return function (v: Iterable<number>) {
                    gl.uniformMatrix2fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT3) {
                return function (v: Iterable<number>) {
                    gl.uniformMatrix3fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT4) {
                return function (v: Iterable<number>) {
                    gl.uniformMatrix4fv(location, false, v);
                };
            }
            throw "unknown type: 0x" + type.toString(16);
        }

        const uniformSetters: UniformSetters = {};
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            let name = uniformInfo.name;
            if (name.substring(-3) === "[0]") {
                name = name.substring(0, name.length - 3);
            }
            const setter = createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }
        return uniformSetters;
    }

    protected resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
        // Lookup the size the browser is displaying the canvas in CSS pixels.
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

        if (needResize) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        return needResize;
    }
}
