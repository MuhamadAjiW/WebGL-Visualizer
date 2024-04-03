// import vertexShaderSource from "../shaders/vertex-shader-2d.vert?raw";
// import fragmentShaderSource from "../shaders/fragment-shader-2d.frag?raw";
// import { BufferInfo } from "../src/types/buffer-info";
// import { BaseModel } from '../src/models/base-model';
// import { ModelType } from "../src/types/enum/model-state";
// import { Coordinates } from "../src/types/coordinates";
// import { ExportData } from '../src/types/export-data';
// import { Config } from '../src/config';
// import { MarkerModel } from "../src/models/marker-model";
// import { lerp } from "../src/util/math-util";

// export class WebGlWindow {    
//     public canvas: HTMLCanvasElement;
//     public gl: WebGLRenderingContext;
    
//     private vertexShader: WebGLShader;
//     private fragmentShader: WebGLShader;
//     private program: WebGLProgram;
//     private positionAttribLocation: number;
//     private colorAttribLocation: number;
//     private positionBuffer: WebGLBuffer;
//     private colorBuffer: WebGLBuffer;
//     private uniformSetters: UniformSetters;
    
//     private modelBuffer: Map<string, BaseModel> = new Map<string, BaseModel>();
//     private modelMapKey: number = 0;

//     private markerBuffer: Map<string, MarkerModel> = new Map<string, MarkerModel>();
//     private markerMapKey: number = 0;

//     private lerpCode: number = 0;

    
//     constructor(id: string) {
//         this.canvas = document.getElementById(id) as HTMLCanvasElement;
//         this.canvas.width = window.innerWidth;
//         this.canvas.height = window.innerHeight * 85 / 100;
        
//         this.gl = this.canvas.getContext("webgl") as WebGL2RenderingContext;
//         if (!this.gl) alert("No webgl support");

//         // Create the shader program
//         this.vertexShader = this.createShader(vertexShaderSource, this.gl.VERTEX_SHADER);
//         this.fragmentShader = this.createShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
//         this.program = this.createProgram(this.vertexShader, this.fragmentShader);

//         this.positionAttribLocation = this.gl.getAttribLocation(this.program, "a_position");
//         this.colorAttribLocation = this.gl.getAttribLocation(this.program, "a_color");

//         this.uniformSetters = this.createUniformSetters(this.gl, this.program);
        
//         this.positionBuffer = this.gl.createBuffer() as WebGLBuffer;
//         this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
//     }

//     public unsetModel(modelKey: string){
//         this.modelBuffer.delete(modelKey);
//         this.draw();
//     }

//     public setModel(modelKey: string, modelData: BaseModel){
//         this.modelBuffer.set(modelKey, modelData);
//         this.draw()
//     }

//     public setMarker(markerKey: string, markerData: MarkerModel){
//         this.markerBuffer.set(markerKey, markerData);
//         this.draw()
//     }

//     public getModel(modelKey: string) : BaseModel | undefined{
//         return this.modelBuffer.get(modelKey);
//     }

//     public getMarker(markerKey: string) : MarkerModel | undefined{
//         return this.markerBuffer.get(markerKey);
//     }

//     public async addModel(model: BaseModel, start: Coordinates, modelKey: string="", replacedModelKey: string="", isMarker: boolean=false): Promise<string> {
//         const buffer = isMarker? this.markerBuffer : this.modelBuffer;
        
//         this.lerpCode++;

//         let lerpModel = new BaseModel()
//         lerpModel.colorBuffer = model.colorBuffer
//         lerpModel.type = model.type
//         lerpModel.uniforms = model.uniforms

//         let lerpModelData: number[] = []
//         for (let index = 0; index < model.positionBuffer.len; index++) {
//             lerpModelData = lerpModelData.concat(start.getComponents())
//         }

//         lerpModel.positionBuffer = new BufferInfo(
//             model.positionBuffer.len,
//             lerpModelData
//         )
            
//         let lerpKey = this.lerpCode + "_lerp";
        
//         const key: string = modelKey === ""? (isMarker? "Marker" + this.markerMapKey++ : "Model" + this.modelMapKey++) : modelKey;
//         this.animateModel(lerpKey, lerpModel, model, key, replacedModelKey, isMarker);

//         await new Promise(resolve => {
//             const checkBuffer = () => {
//                 if (buffer.get(key) !== undefined) resolve(key);
//                 else setTimeout(checkBuffer, 100);
//             };
//             checkBuffer();
//         });
    
//         return key;
//     }

//     public async updateModel(targetModel: BaseModel, modelKey: string="", isMarker: boolean=false): Promise<string> {
//         const buffer = isMarker? this.markerBuffer : this.modelBuffer;

//         const originModel = buffer.get(modelKey);
//         if(originModel == null) return "";
//         if(targetModel.positionBuffer.len != originModel.positionBuffer.len) throw Error("Target and origin model does not have the same vertex count");
        
//         this.lerpCode++;

//         let lerpModel = originModel;
//         let lerpKey = this.lerpCode + "_lerp";

//         const key: string = isMarker? "Marker" + this.markerMapKey++ : "Model" + this.modelMapKey++;
//         this.animateModel(lerpKey, lerpModel, targetModel, key, modelKey, isMarker);

//         await new Promise(resolve => {
//             const checkBuffer = () => {
//                 if (buffer.get(key) !== undefined) resolve(key);
//                 else setTimeout(checkBuffer, 100);
//             };
//             checkBuffer();
//         });
    
//         return key;
//     }

//     public async removeModel(modelKey: string="", isMarker=false) : Promise<void> {
//         let buffer = isMarker? this.markerBuffer : this.modelBuffer;
//         let model = buffer.get(modelKey);
//         if(model == null) return;

//         this.lerpCode++;

//         let lerpModel = new BaseModel()
//         lerpModel.colorBuffer = model.colorBuffer
//         lerpModel.type = model.type
//         lerpModel.uniforms = model.uniforms

//         let start = new Coordinates(
//             model.positionBuffer.data[0],
//             model.positionBuffer.data[1],
//             model.positionBuffer.data[2],
//             model.positionBuffer.data[3]
//         )

//         let lerpModelData: number[] = []
//         for (let index = 0; index < model.positionBuffer.len; index++) {
//             lerpModelData = lerpModelData.concat(start.getComponents())
//         }

//         lerpModel.positionBuffer = new BufferInfo(
//             model.positionBuffer.len,
//             lerpModelData
//         )

//         let lerpKey = this.lerpCode + "_lerp";
//         this.animateModel(lerpKey, model, lerpModel, modelKey, modelKey, isMarker);

//         await new Promise<void>(resolve => {
//             const checkBuffer = () => {
//                 if (buffer.get(modelKey) == undefined) resolve();
//                 else setTimeout(checkBuffer, 100);
//             };
//             checkBuffer();
//         });
//     }

//     public async clear() : Promise<void> {
//         this.clearMarker();
//         this.modelBuffer.forEach((_, key) => {
//             this.removeModel(key);
//         })

//         await new Promise<void>(resolve => {
//             const checkBuffer = () => {
//                 if (this.modelBuffer.size == 0) resolve();
//                 else setTimeout(checkBuffer, 100);
//             };
//             checkBuffer();
//         });
//     }

//     public async clearMarker(){
//         this.markerBuffer.forEach((_, key) => {
//             this.removeModel(key, true);
//         })

//         await new Promise<void>(resolve => {
//             const checkBuffer = () => {
//                 if (this.markerBuffer.size == 0) resolve();
//                 else setTimeout(checkBuffer, 100);
//             };
//             checkBuffer();
//         });
//     }

//     public detectMarker(x: number, y: number) : string {
//         let keys: Array<string> = []
//         this.markerBuffer.forEach((value, key) => {
//             try{
//                 if(value.isInside(x, y)) keys.push(key);
//             } catch(any){}
//         })

//         return keys[0]? keys[0] : "";
//     }

//     public save(){
//         const serialized : ExportData = {
//             modelMapKey: this.modelMapKey,
//             modelBuffer: Array.from(this.modelBuffer.entries())
//         }
//         const jsonStr = JSON.stringify(serialized);
//         const blob = new Blob([jsonStr], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);

//         const temp = document.createElement('a');
//         temp.href = url;
//         temp.download = "export";
//         document.body.appendChild(temp);
//         temp.click();
//         document.body.removeChild(temp);
//         URL.revokeObjectURL(url);
//     }

//     public async load(jsonStr: string){
//         await this.clear()
        
//         const parsed = JSON.parse(jsonStr) as ExportData;
        
//         const buffer = new Map<string, BaseModel>(parsed.modelBuffer);
//         this.modelMapKey = parsed.modelMapKey

//         buffer.forEach((val, key) => {
//             let model = val;
//             model.colorBuffer.data = new Float32Array(Object.values(val.colorBuffer.data))
//             model.positionBuffer.data = new Float32Array(Object.values(val.positionBuffer.data))
            
//             let startCoords = new Coordinates(
//                 model.positionBuffer.data[0],
//                 model.positionBuffer.data[1],
//                 model.positionBuffer.data[2],
//                 model.positionBuffer.data[3]
//             )
    
//             this.addModel(model, startCoords, key);
//         })
    
//         this.draw();
//     }

//     private animateModel(lerpKey: string, lerpModel: BaseModel, targetModel: BaseModel, modelKey: string, replacedModelKey: string="", isMarker: boolean=false){
//         lerpModel.positionBuffer.data.forEach((value, index) => {
//             lerpModel.positionBuffer.data[index] =
//                 lerp(value, targetModel.positionBuffer.data[index], Config.LERP_MODIFIER);
//         })
//         lerpModel.colorBuffer.data.forEach((value, index) => {
//             lerpModel.colorBuffer.data[index] =
//                 lerp(value, targetModel.colorBuffer.data[index], Config.LERP_MODIFIER);
//         })
//         lerpModel.uniforms["u_matrix"].forEach((value, index) => {
//             lerpModel.uniforms["u_matrix"][index] =
//                 lerp(value, targetModel.uniforms["u_matrix"][index], Config.LERP_MODIFIER);
//         });

//         const buffer: Map<string, BaseModel> = isMarker? this.markerBuffer : this.modelBuffer; 

//         buffer.set(lerpKey, lerpModel);
//         this.draw();
//         buffer.delete(lerpKey);

//         if(lerpModel.positionBuffer.data.every((value, index) => 
//             Math.abs(value - targetModel.positionBuffer.data[index]) < Config.LERP_TOLERANCE)
//             &&
//             lerpModel.colorBuffer.data.every((value, index) => 
//             Math.abs(value - targetModel.colorBuffer.data[index]) < Config.LERP_TOLERANCE)
//             // &&
//             // lerpModel.uniforms["u_matrix"].every((value, index) => 
//             // Math.abs(value - targetModel.uniforms["u_matrix"][index]) < Config.LERP_TOLERANCE)
//         ){
//             buffer.set(modelKey, targetModel);
//             if(replacedModelKey !== "") buffer.delete(replacedModelKey);
//             this.draw();
//             return;
//         };

//         requestAnimationFrame(() => {
//             this.animateModel(lerpKey, lerpModel, targetModel, modelKey, replacedModelKey, isMarker)
//         })
//     }

//     private draw(): void {
//         this.gl.useProgram(this.program);
//         this.resizeCanvasToDisplaySize(this.canvas);
//         this.setUniforms(this.uniformSetters, {u_resolution: [this.canvas.width, this.canvas.height]});
        
//         this.modelBuffer.forEach((baseShape: BaseModel) => {
//             this.gl.useProgram(this.program);
//             this.setUniforms(this.uniformSetters, baseShape.uniforms);
//             this.setPosition(baseShape.positionBuffer);
//             this.setColor(baseShape.colorBuffer);

//             switch (baseShape.type) {
//                 case ModelType.LINE:
//                     this.gl.drawArrays(this.gl.LINES, 0, baseShape.positionBuffer.len);
//                     break;

//                 case ModelType.SQUARE:
//                     this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
//                     break;

//                 case ModelType.RECTANGLE:
//                     this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
//                     break;

//                 case ModelType.POLYGON:
//                     this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
//                     break;
            
//                 default:
//                     throw Error("Tried to draw null type model")
//             }
//         });

//         this.markerBuffer.forEach((baseShape: BaseModel) => {
//             this.gl.useProgram(this.program);
//             this.setUniforms(this.uniformSetters, baseShape.uniforms);
//             this.setPosition(baseShape.positionBuffer);
//             this.setColor(baseShape.colorBuffer);

//             switch (baseShape.type) {
//                 case ModelType.SQUARE:
//                     this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, baseShape.positionBuffer.len);
//                     break;
            
//                 default:
//                     throw Error("Tried to draw non square marker")
//             }
//         });
//     }  

//     private createShader(source: string, type: number): WebGLShader {
//         const shader = this.gl.createShader(type) as WebGLShader;
//         this.gl.shaderSource(shader, source);
//         this.gl.compileShader(shader);

//         let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
//         if (!success) {
//             const err: string = `Shader compilation failed: ${this.gl.getShaderInfoLog(shader)}`;

//             console.error(err);
//             this.gl.deleteShader(shader);
//             throw err;
//         }
//         return shader;
//     }

//     private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
//         const program = this.gl.createProgram() as WebGLProgram;

//         this.gl.attachShader(program, vertexShader);
//         this.gl.attachShader(program, fragmentShader);
//         this.gl.linkProgram(program);

//         let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
//         if (!success) {
//             const err: string = `Shader compilation failed: ${this.gl.getProgramInfoLog(program)}`;

//             console.error(err);
//             this.gl.deleteProgram(program);
//             throw err;
//         }

//         return program;
//     }
//     private setPosition(buffer: BufferInfo): void {
//         this.gl.enableVertexAttribArray(this.positionAttribLocation);
//         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
//         this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);
//         this.gl.vertexAttribPointer(this.positionAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
//     }

//     private setColor(buffer: BufferInfo): void {
//         this.gl.enableVertexAttribArray(this.colorAttribLocation);
//         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
//         this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer.data, this.gl.STATIC_DRAW);
//         this.gl.vertexAttribPointer(this.colorAttribLocation, buffer.len, this.gl.FLOAT, false, 0, 0);
//     }

//     private setUniforms(setters: UniformSetters, ...values: { [key: string]: any }[]) {
//         for (const uniforms of values) {
//             Object.keys(uniforms).forEach(function (name) {
//                 const setter = setters[name];
//                 if (setter) {
//                     setter(uniforms[name]);
//                 }
//             });
//         }
//     }

//     private createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
//         function createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo) {
//             const location = gl.getUniformLocation(program, uniformInfo.name);
//             const type = uniformInfo.type;
//             const isArray = uniformInfo.size > 1 && uniformInfo.name.substring(-3) === "[0]";
//             if (type === gl.FLOAT && isArray) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform1fv(location, v);
//                 };
//             }
//             if (type === gl.FLOAT) {
//                 return function (v: number) {
//                     gl.uniform1f(location, v);
//                 };
//             }
//             if (type === gl.FLOAT_VEC2) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform2fv(location, v);
//                 };
//             }
//             if (type === gl.FLOAT_VEC3) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform3fv(location, v);
//                 };
//             }
//             if (type === gl.FLOAT_VEC4) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform4fv(location, v);
//                 };
//             }
//             if (type === gl.INT && isArray) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform1iv(location, v);
//                 };
//             }
//             if (type === gl.INT) {
//                 return function (v: number) {
//                     gl.uniform1i(location, v);
//                 };
//             }
//             if (type === gl.INT_VEC2) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform2iv(location, v);
//                 };
//             }
//             if (type === gl.INT_VEC3) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform3iv(location, v);
//                 };
//             }
//             if (type === gl.INT_VEC4) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform4iv(location, v);
//                 };
//             }
//             if (type === gl.BOOL) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform1iv(location, v);
//                 };
//             }
//             if (type === gl.BOOL_VEC2) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform2iv(location, v);
//                 };
//             }
//             if (type === gl.BOOL_VEC3) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform3iv(location, v);
//                 };
//             }
//             if (type === gl.BOOL_VEC4) {
//                 return function (v: Iterable<number>) {
//                     gl.uniform4iv(location, v);
//                 };
//             }
//             if (type === gl.FLOAT_MAT2) {
//                 return function (v: Iterable<number>) {
//                     gl.uniformMatrix2fv(location, false, v);
//                 };
//             }
//             if (type === gl.FLOAT_MAT3) {
//                 return function (v: Iterable<number>) {
//                     gl.uniformMatrix3fv(location, false, v);
//                 };
//             }
//             if (type === gl.FLOAT_MAT4) {
//                 return function (v: Iterable<number>) {
//                     gl.uniformMatrix4fv(location, false, v);
//                 };
//             }
//             throw "unknown type: 0x" + type.toString(16);
//         }

//         const uniformSetters: UniformSetters = {};
//         const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

//         for (let ii = 0; ii < numUniforms; ++ii) {
//             const uniformInfo = gl.getActiveUniform(program, ii);
//             if (!uniformInfo) {
//                 break;
//             }
//             let name = uniformInfo.name;
//             if (name.substring(-3) === "[0]") {
//                 name = name.substring(0, name.length - 3);
//             }
//             const setter = createUniformSetter(program, uniformInfo);
//             uniformSetters[name] = setter;
//         }
//         return uniformSetters;
//     }

//     private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
//         // Lookup the size the browser is displaying the canvas in CSS pixels.
//         const displayWidth = canvas.clientWidth;
//         const displayHeight = canvas.clientHeight;

//         // Check if the canvas is not the same size.
//         const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

//         if (needResize) {
//             // Make the canvas the same size
//             canvas.width = displayWidth;
//             canvas.height = displayHeight;
//         }

//         return needResize;
//     }
// }
