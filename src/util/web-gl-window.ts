export class WebGlWindow {
  public canvas: HTMLCanvasElement;
  public gl: WebGLRenderingContext;

  constructor(id: string){
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl") as WebGL2RenderingContext;
    if(!this.gl) alert("No webgl support");
  }
}