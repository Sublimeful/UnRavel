varying vec2 vUv;
uniform float u_aspect;
uniform vec2 u_redCirclePos;
uniform vec2 u_blueCirclePos;
uniform vec2 u_tealCirclePos;

void main() {
  vec3 fragColor = vec3(4.0/255.0, 0, 57.0/255.0);

  // Red Circle
  vec2 redCirclePos = vec2(u_redCirclePos.x * u_aspect, u_redCirclePos.y);
  float redCircleDist = distance(redCirclePos, vec2(vUv.x * u_aspect, vUv.y)) / 0.15;
  if (redCircleDist < 1.0) {
    fragColor = vec3(226.0/255.0, 78.0/255.0, 59.0/255.0);
  }

  // Blue Circle
  vec2 blueCirclePos = vec2(u_blueCirclePos.x * u_aspect, u_blueCirclePos.y);
  float blueCircleDist = distance(blueCirclePos, vec2(vUv.x * u_aspect, vUv.y)) / 0.25;
  if (blueCircleDist < 1.0) {
    fragColor = vec3(71.0/255.0, 84.0/255.0, 229.0/255.0);
  }

  // Teal Circle
  vec2 tealCirclePos = vec2(u_tealCirclePos.x * u_aspect, u_tealCirclePos.y);
  float tealCircleDist = distance(tealCirclePos, vec2(vUv.x * u_aspect, vUv.y)) / 0.30;
  if (tealCircleDist < 1.0) {
    fragColor = vec3(77.0/255.0, 219.0/255.0, 219.0/255.0);
  }

  gl_FragColor = vec4(fragColor, 1.0); 
}
