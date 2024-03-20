import { WebGLWindow } from "./class/WebGLWindow";

const glWin = new WebGLWindow("canvas");
glWin.gl.clearColor(0, 0.6, 0.0, 1.0); 
glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
