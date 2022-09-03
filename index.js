shader('#canvas1', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float time;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

vec4 glitch(vec2 pos, float amount, sampler2D texture) {
	pos.x += (random(vec2(floor(time * 5.0), 0.0)) - 0.5) * amount;
	amount = 1.0 - amount * 0.5;

	pos.x += step(amount, random(vec2(floor(pos.y * 20.0), floor(time * 10.0)))) * 0.1;
	pos.x += step(amount, random(vec2(floor(pos.y * 5.0), floor(time * 10.0)))) * 0.2;
	pos.x += step(amount, random(vec2(floor(pos.y * 50.0), floor(time * 10.0)))) * 0.3;
	pos.x += step(amount, random(floor(pos * 10.0) + vec2(floor(time * 10.0)))) * 0.1;

	vec4 color = texture2D(texture, pos);
	color.r = texture2D(texture, pos + vec2(random(vec2(floor(time * 10.0), 0.0)) - 0.5, 0.0) * ((amount < 0.9)? 1.0 - amount : 0.0)).r;

	return(color);
}

void main() {
	vec4 color1 = glitch(vTexcoord, mousehover, texture1);
	vec4 color2 = glitch(vTexcoord, 1.0 - mousehover, texture2);

	gl_FragColor = mix(color1, color2, step(0.5, mousehover));
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas2', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2; 
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
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas3', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

vec2 rotate(inout vec2 pos, float dir) {
	pos -= vec2(0.5, 0.5);
	pos = mat2(cos(dir), -sin(dir), sin(dir), cos(dir)) * pos;
	pos += vec2(0.5, 0.5);
	return pos;
}

void main() {
	float id = random((vTexcoord * 10.0));
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	rotate(uv1, (mousehover) * 3.1415 * id);
	rotate(uv2, -(1.0 - mousehover) * 3.1415 * id);
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas4', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

void main() {
	float id = random(floor((vTexcoord * vec2(10.0, 10.0))));

	gl_FragColor = mix(texture2D(texture1, vTexcoord), texture2D(texture2, vTexcoord), clamp(mousehover * 4.0 + id * 2.0 - 2.0, 0.0, 1.0));
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas5', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2; 
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
	rotate(uv1, mousehover * id * (1.0 - length(uv1 - vec2(0.5))) * 6.283);
	rotate(uv2, -(1.0 - mousehover) * id * (1.0 - length(uv2 - vec2(0.5, 0.5))) * 6.283);
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas6', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float mousehover;

varying vec2 vTexcoord;

float random(vec2 v) {
	return fract(sin(dot(v, vec2(123.45, 87.63))) * 487.63);
}

void main() {
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	vec2 t = vec2(vTexcoord.x, vTexcoord.y + vTexcoord.x * 0.5) * 6.0;
	t = floor(t) + ((fract(t.y) > fract(t.x))? 0.5: 0.0);

	uv1 += vec2(cos(random(t) * 6.283), sin(random(t) * 6.283)) * mousehover * 0.5;
	uv2 -= vec2(cos(random(t) * 6.283), sin(random(t) * 6.283)) * (1.0 - mousehover) * 0.5;
	
	gl_FragColor = texture2D(texture1, uv1);
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas7', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
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
	vec2 uv2 = vTexcoord;
	scale(uv1, 1.0 + (mousehover) * id * 0.9);
	scale(uv2, 1.0 - (1.0 - mousehover) * id * 0.9);
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover);
}
`, { image: [ './image1.jpg', './image2.jpg' ] })



shader('#canvas8', vertDefault, 
`
precision highp float;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform float mousehover;

varying vec2 vTexcoord;

void main() {
	vec2 uv1 = vTexcoord;
	vec2 uv2 = vTexcoord;
	float displace = texture2D(texture3, vTexcoord).r;

	uv1 -= vec2(cos(displace * 6.283), sin(displace * 6.283)) * mousehover * 0.3;
	uv2 += vec2(cos(displace * 6.283), sin(displace * 6.283)) * (1.0 - mousehover) * 0.3;
	
	gl_FragColor = mix(texture2D(texture1, uv1), texture2D(texture2, uv2), mousehover) ;
}
`, { image: [ './noise.png', './image2.jpg', './image1.jpg' ] })