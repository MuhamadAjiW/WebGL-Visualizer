interface UniformSetters {
    [UniformName: string]:
        | ((v: Iterable<number>) => void)
        | ((v: number) => void);
}
interface AttribSetters {
    [AttribName: string]: (attrib: Attrib) => void;
}
interface Attrib {
    buffer: WebGLBuffer;
    numComponents: GLint;
    type?: GLenum;
    normalize?: boolean;
    stride?: GLint;
    offset?: GLintptr;
}

interface Attribs {
    [attribName: string]: {
        buffer: WebGLBuffer;
        numComponents: GLint;
        type?: GLenum;
        normalize?: boolean;
        stride?: GLint;
        offset?: GLintptr;
    };
}
