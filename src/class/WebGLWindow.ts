export class WebGLWindow{
  public canvas: HTMLCanvasElement;
  public gl: WebGLRenderingContext;

  constructor(id: string){
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    if(!this.gl) alert("No webgl support");
  }
}