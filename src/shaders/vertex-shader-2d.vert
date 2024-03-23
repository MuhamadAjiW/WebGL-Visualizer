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