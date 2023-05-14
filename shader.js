let Shader = {
	loadImage(gl, src) {
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
	},
	vertDefault:
`
attribute vec3 position;
attribute vec2 texcoord;

varying vec3 vPosition;
varying vec2 vTexcoord;
	
void main() {
	vPosition = position;
	vTexcoord = position.xy * vec2(0.5, -0.5) + vec2(0.5, 0.5);
	gl_Position = vec4(position, 1.0);
}
`,
	fragDefault:
`
precision highp float;

void main() {
	gl_FragColor = vec4(1.0);
}
`,
	async create(id, vert, frag, data) {
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

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0 ]), gl.STATIC_DRAW)
		let a = gl.getAttribLocation(program, 'position')
		gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(a)

		let mousehover = false
		let transition = 0
		let mousehoverUniform = gl.getUniformLocation(program, 'mousehover')
		let timeUniform = gl.getUniformLocation(program, 'time')

		canvas.addEventListener('mouseenter', () => mousehover = true)
		canvas.addEventListener('mouseleave', () =>  mousehover = false)
		canvas.addEventListener('touchstart', () => mousehover = true)
		addEventListener('touchend', () => mousehover = false)

		let url = data?.image
		let images = []
		if(Array.isArray(url)) for(let u of url) images.push(await(this.loadImage(gl, u)))
		else if(url) images.push(await this.loadImage(gl, url))

		for(let i = 0; i < images.length; i++) {
			gl.activeTexture(gl.TEXTURE0 + i)
			gl.bindTexture(gl.TEXTURE_2D, images[i])
			gl.uniform1i(gl.getUniformLocation(program, `texture${i}`), i)
		}

		let lastTime = 0
		function draw(time) {
			requestAnimationFrame(draw)
			transition = Math.min(Math.max(transition + (((mousehover)? 1 : 0) - transition) * (time - lastTime) * 0.005, 0), 1)
			gl.uniform1f(timeUniform, time / 1000)
			gl.uniform1f(mousehoverUniform, transition)
			gl.clear(gl.COLOR_BUFFER_BIT)
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
			lastTime = time
		}
		if(!data?.dontAutoPlay) draw(0)

		return { canvas: canvas, gl: gl, program: program, play: draw }
	}
}