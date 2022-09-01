let vert = `
attribute vec3 position;
attribute vec2 texcoord;

varying vec3 vPosition;
varying vec2 vTexcoord;
	
void main() {
	vPosition = position;
	vTexcoord = texcoord * vec2(1.0, -1.0) + vec2(0.0, 1.0);
	gl_Position = vec4(position, 1.0);
}
`



shader('#canvas1', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform vec2 mouse;
uniform float time;

varying vec2 vTexcoord;

float random(float f) {
	return sin(f * 123.45) * 487.63;
}

float smoothRandom(float f) {
	return mix(random(floor(f)), random(floor(f + 1.0)), fract(f));
}

void main() {
	vec2 uv1 = vTexcoord;
	uv1.x = fract(uv1.x + smoothRandom(floor(vTexcoord.y * 20.0) + (mouse.x + mouse.y) * 0.005 + time * 0.001));

	gl_FragColor = texture2D(texture1, uv1);
}
`, { image: './image1.jpg' })



shader('#canvas2', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2; 
uniform vec2 mouse;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

void main() {
	float id = random(floor(vTexcoord * 10.0));
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	uv1.x -= id * (mousehover);
	uv2.x += id * (1.0 - mousehover);
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image2.jpg', './image1.jpg' ], listenMouseHover: true })



shader('#canvas3', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform vec2 mouse;
uniform float time;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

vec2 scale(inout vec2 pos, float s) {
	pos -= vec2(0.5, 0.5);
	pos = mat2(s, 0.0, 0.0, s) * pos;
	pos += vec2(0.5, 0.5);
	return pos;
}

void main() {
	float id = random((vTexcoord * 10.0));
	vec2 uv1 = vTexcoord;
	scale(uv1, 1.0 - mousehover * 0.5 * id);
	
	gl_FragColor = texture2D(texture1, uv1);
}
`, { image: './image2.jpg', listenMouseHover: true })



shader('#canvas4', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 mouse;
uniform float time;
uniform float mousehover;
uniform float aspect;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

void main() {
	float id = random(floor((vTexcoord * vec2(10.0, 10.0 * aspect))));

	gl_FragColor = mix(texture2D(texture1, vTexcoord), texture2D(texture2, vTexcoord), clamp(mousehover * 4.0 + id * 2.0 - 2.0, 0.0, 1.0));
}
`, { image: [ './image2.jpg', './image1.jpg' ], listenMouseHover: true }).then(s => s.setUniform('aspect', 1 / 1))



shader('#canvas5', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2; 
uniform vec2 mouse;
uniform float time;
uniform float mousehover;

varying vec2 vTexcoord;

vec2 rotate(inout vec2 pos, float dir) {
	pos -= vec2(0.5, 0.5);
	pos = mat2(cos(dir), -sin(dir), sin(dir), cos(dir)) * pos;
	pos += vec2(0.5, 0.5);
	return pos;
}

void main() {
	float id = sin(length(vTexcoord - vec2(0.5)) * 10.0);
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	rotate(uv1, mousehover * id * (1.0 - length(uv1 - vec2(0.5))) * 3.0);
	rotate(uv2, -(1.0 - mousehover) * id * (1.0 - length(uv2 - vec2(0.5, 0.5))) * 3.0);
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image1.jpg', './image2.jpg' ], listenMouseHover: true })



shader('#canvas6', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform vec2 mouse;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

void main() {
	vec2 uv1 = vTexcoord;
	vec2 t = vec2(vTexcoord.x, vTexcoord.y + vTexcoord.x * 0.5) * 6.0;
	t = floor(t) + ((fract(t.y) > fract(t.x))? 0.5: 0.0);

	uv1 += vec2(cos(random(t) * 6.283), sin(random(t) * 6.283)) * mousehover * 0.5;
	
	gl_FragColor = texture2D(texture1, uv1);
}
`, { image: './image1.jpg', listenMouseHover: true })



shader('#canvas7', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform vec2 mouse;
uniform float time;
uniform float mousehover;

varying vec2 vTexcoord;

vec2 rotate(inout vec2 pos, float dir) {
	pos = mat2(cos(dir), -sin(dir), sin(dir), cos(dir)) * pos;
	return pos;
}

float box(vec3 ray, float s) {
	vec3 a = abs(ray) - vec3(s);
	return length(max(a, 0.0));
}

float scene(vec3 ray) {
	float d = 100.0;
	rotate(ray.xz, mouse.x * mousehover - 0.5);
	rotate(ray.yz, -mouse.y * mousehover - 0.5);
	d = min(d, box(ray, 3.0));
	return d;
}

vec3 normal(vec3 pos) {
	vec2 a = vec2(0.0001, 0);
	return normalize(vec3(
	scene(pos + a.xyy) - scene(pos - a.xyy),
	scene(pos + a.yxy) - scene(pos - a.yxy),
	scene(pos + a.yyx) - scene(pos - a.yyx)
	));
}

vec3 material(vec3 n, vec3 l, vec3 d) {
	return vec3(mix(mix(dot(n, l), 1.0, 0.5), (1.0 - abs(dot(n, d))) / 2.0 + 0.5, 0.8));
}

void main() {
	vec3 light = normalize(vec3(-3.0, 5.0, -1.0));
	vec3 pos = vec3(0, 0, -10.0);
	vec3 dir = normalize(vec3(vTexcoord.x - 0.5, vTexcoord.y - 0.5, 0.8));

	vec4 col = vec4(1.0);
	float l = 0.0;
	for(int i = 0; i < 128; i++) {
		if(l > 100.0) break;
		vec3 ray = pos + dir * l;
		float dist = scene(ray);
		if(dist < 0.05) {
			col = vec4(material(normal(ray), light, dir), 1.0);
			col = texture2D(texture1, vTexcoord + col.xy - vec2(0.5));
			break;
		}
		l += dist;
	}

	gl_FragColor = col;
}
`, { image: './image2.jpg', listenMouseHover: true })



shader('#canvas8', vert, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform vec2 mouse;
uniform float mousehover;
uniform float time;

varying vec2 vTexcoord;

void main() {
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	float displace = texture2D(texture3, vTexcoord).r;
	// uv1.y -= mousehover * displace;
	// uv2.y += (1.0 - mousehover) * displace;

	uv1 -= vec2(cos(displace * 6.283), sin(displace * 6.283)) * mousehover * 0.2;
	uv2 += vec2(cos(displace * 6.283), sin(displace * 6.283)) * (1.0 - mousehover) * 0.2;
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover) ;
}
`, { image: [ './noise.png', './image2.jpg', './image1.jpg' ], listenMouseHover: true })