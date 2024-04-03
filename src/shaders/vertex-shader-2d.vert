attribute vec4 a_position;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat3 u_matrix;
uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0

    vec2 transformedPosition = (u_matrix * vec3((a_position).xy, 1)).xy;
    // vec2 a_postion = (u_matrix * vec3(a_postion.xy, 1)).xy;

    vec2 zeroToOne = transformedPosition / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Multiply the position by the matrix. scale to 2D first because matrix is 3D
    // vec2 position = (u_matrix * vec3(clipSpace.xy, 1)).xy;

    vec2 topLeftPosition = clipSpace * vec2(1, -1);

    gl_Position = vec4(topLeftPosition, 0, 1);
    v_color = a_color;
}