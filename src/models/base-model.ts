import { BufferInfo } from "../types/buffer-info";
import { squareMatrix3 } from "../types/matrix-type";
import vertexShaderSource from "../shaders/vertex-shader-2d.vert?raw";
import fragmentShaderSource from "../shaders/fragment-shader-2d.frag?raw";

export abstract class BaseModel {
    protected gl: WebGLRenderingContext;
    protected vertexShader: WebGLShader;
    protected fragmentShader: WebGLShader;
    protected program: WebGLProgram;
    protected uniformSetters: UniformSetters;
    protected positionBuffer: WebGLBuffer;
    protected colorBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext) {
        // a_position is 4 dimensional, x, y, z, p
        this.gl = gl;
        this.vertexShader = this.createShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        this.fragmentShader = this.createShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        this.program = this.createProgram(this.vertexShader, this.fragmentShader);

        this.uniformSetters = this.createUniformSetters(this.gl, this.program);
        // this.attribSetters = createAttributeSetters(this.gl, this.program);

        this.positionBuffer = this.gl.createBuffer() as WebGLBuffer;
        this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
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
    protected setUniforms(setters: UniformSetters, ...values: { [key: string]: any }[]) {
        for (const uniforms of values) {
            Object.keys(uniforms).forEach(function (name) {
                const setter = setters[name];
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

    protected createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
        function createAttribSetter(attribLocation: number) {
            return function (b: Attrib) {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(
                    attribLocation,
                    b.numComponents,
                    b.type || gl.FLOAT,
                    b.normalize || false,
                    b.stride || 0,
                    b.offset || 0
                );
            };
        }
        const attribSetters: AttribSetters = {};

        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let ii = 0; ii < numAttribs; ++ii) {
            const attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            const attribLocation = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = createAttribSetter(attribLocation);
        }

        return attribSetters;
    }

    protected setAttributes(setters: AttribSetters, attribs: Attribs) {
        Object.keys(attribs).forEach(function (name) {
            const setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
        });
    }

    protected setPosition(buffer: BufferInfo): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);

        var positionAttribLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.gl.vertexAttribPointer(positionAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionAttribLocation);
    }

    protected setColor(buffer: BufferInfo): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);

        var colorAttribLocation = this.gl.getAttribLocation(this.program, "vertColor");
        this.gl.vertexAttribPointer(colorAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(colorAttribLocation);
    }

    protected setMatrix(matrix: squareMatrix3): void {
        this.gl.useProgram(this.program);
        // const matrixUniformLocation = this.gl.getUniformLocation(this.program, "u_matrix");
        this.setUniforms(this.uniformSetters, { u_matrix: matrix });
        // this.gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
    }

    protected clear(): void {
        if (this.fragmentShader) this.gl.deleteShader(this.fragmentShader);
        if (this.vertexShader) this.gl.deleteShader(this.vertexShader);
        if (this.program) this.gl.deleteProgram(this.program);
        if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
        if (this.colorBuffer) this.gl.deleteBuffer(this.colorBuffer);
    }

    abstract init(): void;
    abstract draw(): void;
}
