async function shader(id, vert, frag, data) {
	function attribute(name, data, size) {
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
		let a = gl.getAttribLocation(program, name)
		gl.vertexAttribPointer(a, size, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(a)
	}

	function loadImage(src) {
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

	attribute('position', [ 
		-1, -1, 0,
		-1, 1, 0,
		1, -1, 0,
		1, 1, 0 ], 3)

	attribute('texcoord', [ 
		0, 0,
		0, 1,
		1, 0,
		1, 1, ], 2)

	let mouse = gl.getUniformLocation(program, 'mouse')
	gl.uniform2f(mouse, 0, 0)
	canvas.addEventListener('mousemove', e => {
		gl.uniform2f(mouse, e.offsetX / canvas.clientWidth, 1 - e.offsetY / canvas.clientHeight)
	})

	let time = gl.getUniformLocation(program, 'time')
	let t = 0
	gl.uniform1f(time, 0)
	setInterval(() => {
		t += 0.02
		gl.uniform1f(time, t)
	}, 20)

	if(data.listenMouseHover) {
		let mouseover = false
		let transition = 0
		let uniform = gl.getUniformLocation(program, 'mousehover')
		canvas.addEventListener('mouseenter', () => {
			mouseover = true
		})
		canvas.addEventListener('mouseleave', () => {
			mouseover = false
		})
		setInterval(() => {
			if(mouseover) transition = lerp(transition, 1, 0.1)
			else transition = lerp(transition, 0, 0.1)
			gl.uniform1f(uniform, transition)
		}, 20)
	}

	let url = data.image
	let images = []
	if(Array.isArray(url)) for(let u of url) images.push(await(loadImage(u)))
	else if(url) images.push(await loadImage(url))

	for(let i = 0; i < images.length; i++) {
		gl.activeTexture(gl.TEXTURE0 + i)
		gl.bindTexture(gl.TEXTURE_2D, images[i])
		gl.uniform1i(gl.getUniformLocation(program, `texture${i}`), i)
	}

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
		requestAnimationFrame(draw)
	}
	draw()

	return {
		canvas: canvas,
		gl: gl,
		program: program,
		setUniform: (name, value) => {
			let uniform = gl.getUniformLocation(program, name)
			gl.uniform1f(uniform, value)
		}
	}
}