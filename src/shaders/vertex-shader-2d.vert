attribute vec4 a_position;
attribute vec4 vertColor;
varying vec4 fragColor;
uniform mat3 u_matrix;
uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position.xy / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Multiply the position by the matrix. scale to 2D first because matrix is 3D
    vec2 position = (u_matrix * vec3(clipSpace.xy, 1)).xy;
    gl_Position = vec4(position, 0, 1);
    fragColor = vertColor;
}