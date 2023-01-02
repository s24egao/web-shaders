function attribute(gl, program, name, data, size) {
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
	let a = gl.getAttribLocation(program, name)
	gl.vertexAttribPointer(a, size, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(a)
}

function loadImage(gl, src) {
	return new Promise(res => {
		let img = new Image()
		img.onload = () => {
			let texture = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, texture)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
			res(texture)
		}
		img.src = src
	})
}

function lerp(a, b, f) {
	return a + (b - a) * f
}

let vertDefault = 
`
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

let fragDefault =
`
precision highp float;

void main() {
	gl_FragColor = vec4(1.0);
}
`

async function shader(id, vert, frag, data) {
	let canvas = document.querySelector(id)
	let gl = canvas.getContext('webgl')
	
	let vertexShader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(vertexShader, vert)
	gl.compileShader(vertexShader)
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(vertexShader))
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
	gl.shaderSource(fragmentShader, frag)
	gl.compileShader(fragmentShader)
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(fragmentShader))

	let program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	gl.useProgram(program)

	attribute(gl, program, 'position', [ 
		-1, -1, 0,
		-1, 1, 0,
		1, -1, 0,
		1, 1, 0 ], 3)

	attribute(gl, program, 'texcoord', [ 
		0, 0,
		0, 1,
		1, 0,
		1, 1, ], 2)

	let ismousehover = false
	let transition = 0
	let mousehover = gl.getUniformLocation(program, 'mousehover')
	canvas.addEventListener('mouseenter', () => ismousehover = true)
	canvas.addEventListener('mouseleave', () =>  ismousehover = false)
	canvas.addEventListener('touchstart', () => ismousehover = true)
	addEventListener('touchend', () => ismousehover = false)

	let time = gl.getUniformLocation(program, 'time')
	let t = 0
	gl.uniform1f(time, 0)
	setInterval(() => {
		t += 0.016
		transition = lerp(transition, (ismousehover)? 1 : 0, 0.1)
		gl.uniform1f(time, t)
		gl.uniform1f(mousehover, transition)
	}, 16)

	let url = data?.image
	let images = []
	if(Array.isArray(url)) for(let u of url) images.push(await(loadImage(gl, u)))
	else if(url) images.push(await loadImage(gl, url))

	for(let i = 0; i < Math.min(images.length, 4); i++) {
		gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3][i])
		gl.bindTexture(gl.TEXTURE_2D, images[i])
		gl.uniform1i(gl.getUniformLocation(program, `texture${i}`), i)
	}

	function draw() {
		requestAnimationFrame(draw)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}
	if(!data?.dontAutoPlay) draw()

	return {
		canvas: canvas,
		gl: gl,
		program: program,
		play: draw
	}
}