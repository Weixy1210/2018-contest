var block = {
	// 记录各棋子位置
	positionMatrix: [[{x: 200, y: 200}, {x: 1600, y: 200}, {x: 3000, y: 200}, {x: 4400, y: 200}],
					[{x: 200, y: 1600}, {x: 1600, y: 1600}, {x: 3000, y: 1600}, {x: 4400, y: 1600}],
					[{x: 200, y: 3000}, {x: 1600, y: 3000}, {x: 3000, y: 3000}, {x: 4400, y: 3000}],
					[{x: 200, y: 4400}, {x: 1600, y: 4400}, {x: 3000, y: 4400}, {x: 4400, y: 4400}],],
	// 记录棋子配色
	colorRule: [{val: 2, color1: "rgb(241,229,215)", color2: "rgb(120,107,95)"},
				{val: 4, color1: "rgb(242,224,195)", color2: "rgb(120,107,95)"},
				{val: 8, color1: "rgb(255,173,109)", color2: "rgb(250,246,241)"},
				{val: 16, color1: "rgb(255,149,92)", color2: "rgb(250,246,241)"},    // 自配填充色
				{val: 32, color1: "rgb(255,113,80)", color2: "rgb(250,246,241)"},
				{val: 64, color1: "rgb(254,80,68)", color2: "rgb(250,246,241)"},
				{val: 128, color1: "rgb(246,207,106)", color2: "rgb(250,246,241)"},
				{val: 256, color1: "rgb(247,205,90)", color2: "rgb(250,246,241)"},   // 自配填充色
				{val: 512, color1: "rgb(248,203,74)", color2: "rgb(250,246,241)"},   // 自配填充色
				{val: 1024, color1: "rgb(248,201,60)", color2: "rgb(250,246,241)"},  // 自配填充色
				{val: 2048, color1: "rgb(249,193,46)", color2: "rgb(250,246,241)"}],
	// 记录棋子数字，0代表没有棋子
	numberMatrix: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
	// 记录棋子空位
	blankRest: 16,
	// 是否监听移动指令
	eventListenerLock: true,
	// 记录移动需求
	movements: [],
	// 记录游戏输赢状态，0进行中，1赢了，2输了
	gameResult: 0,
	// 查找配色
	findColor: function (number) {
		switch (number) {
			case 2:
				return this.colorRule[0]
			case 4:
				return this.colorRule[1]
			case 8:
				return this.colorRule[2]
			case 16:
				return this.colorRule[3]
			case 32:
				return this.colorRule[4]
			case 64:
				return this.colorRule[5]
			case 128:
				return this.colorRule[6]
			case 256:
				return this.colorRule[7]
			case 512:
				return this.colorRule[8]
			case 1024:
				return this.colorRule[9]
			case 2048:
				return this.colorRule[10]
		}
	},
	// 绘制棋子，context为画布，target为棋子左上角位置，color为棋子颜色，text为棋子内容（可选）
	drawRoundRect: function (context, target, color, text) {
		let pi = 3.1415
		let radius = 120
		// 绘制圆角矩形
		context.beginPath()
		context.arc(target.x+radius, target.y+radius, radius, pi, pi*3/2, false)
		context.lineTo(target.x+1200-radius, target.y)
		context.arc(target.x+1200-radius, target.y+radius, radius, pi*3/2, pi*2, false)
		context.lineTo(target.x+1200, target.y+1200-radius)
		context.arc(target.x+1200-radius, target.y+1200-radius, radius, 0, pi/2, false)
		context.lineTo(target.x+radius, target.y+1200)
		context.arc(target.x+radius, target.y+1200-radius, radius, pi/2, pi, false)
		context.lineTo(target.x, target.y+radius)
		context.closePath()
		context.fillStyle = color
		// 2048光晕		
		if (text) {
			if (text.val === 2048) {
				context.shadowBlur = 300
				context.shadowColor = "rgb(249,193,46)"
			}	  
		}
		context.fill()
		// 棋子数字绘制
		if (text) { this.drawText(context, target, text) }
	},
	// 绘制棋子数字
	drawText: function (context, target, text) {
		context.shadowBlur = 0
		// 字体颜色
		context.fillStyle = text.color
		// 调整字体大小
		if (text.val < 100) {
			context.font="bolder 750px Arial"
		} else if (text.val < 1000) {
			context.font="bolder 600px Arial"
		} else {
			context.font="bolder 400px Arial"
		}
		// 使文字轴线为中央
		context.textAlign="center"
		context.textBaseline="middle"
		// 绘制  
		context.fillText(text.val, target.x+600, target.y+600)
	},
	// 生成新的棋子
	randomPiece: function (context) {
		if (this.blankRest <= 0) {  // 没有空余位置，输了
			this.showResult(2)
		} else {
			do {  // 随机找到一个空余位置
				var i = Math.round(Math.random()*3), j = Math.round(Math.random()*3)
			} while(this.numberMatrix[i][j] !== 0)
			// 随机确定2或4数值
			let num = Math.random()-0.5>0 ? 2 : 4
			// 添加棋子
			this.numberMatrix[i][j] = num
			this.drawRoundRect(context, this.positionMatrix[i][j], this.findColor(num).color1, {color: this.findColor(num).color2, val: num})
			// 减少一个空位
			this.blankRest--
			// 开启按键监听
			this.eventListenerLock = true
			// 如果已经没有空位，判断有没有输
			if (this.blankRest === 0) { this.judgeLose() }
		}
	},
	// 绘制游戏背景
	drawBackGround: function (context) {
		for (let i in this.positionMatrix) {
			for (let j in this.positionMatrix[i]) {
				this.drawRoundRect(context, this.positionMatrix[i][j], "rgb(212, 192, 174)")
			}
		}
	},
	// 初始化数据，开始一局新的游戏
	init: function (context) {
		this.numberMatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
		this.eventListenerLock = true
		this.blankRest = 16
		this.showResult(0)
		// 清空画布
		context.clearRect(0, 0, 5800, 5800)
		// 随机放置两个棋子
		this.randomPiece(context)
		this.randomPiece(context)
	},
	// 记录移动操作
	findMove: function (line, i, j, flowWay) {  // line记录移动后的数字序列，i、j表示棋子位置，flowWay表示移动方向
		let prevVal = now = this.numberMatrix[i][j]  // 当前棋子数值
		let prev = line.pop()                        // 前一个棋子的数值
		let moveList = []                            // 放置棋子移动信息
		while (prev === now) {                       // 当前与前一个可以相加
			now = prev + now
			// 判断是否赢了
			if (now === 2048) { this.gameResult = 1 }
			// 记录数字变化以及移动步数
			moveList.push({
				step: flowWay-line.length,
				val: now
			})
			// 再取出前一位比较
			prev = line.pop()
		}
		// 放回拿出在外的数字
		if (prev) { line.push(prev) }
		line.push(now)
		// 判断是否有最终移动
		if (flowWay-line.length+1 > 0) {
			// 判断最终移动是否重复
			if (!moveList[moveList.length-1]) {
				moveList.push({
					step: flowWay-line.length+1,
					val: now
				})
			}
			// 添加该棋子全部移动信息
			this.movements.push({
				xStart: i,         // 棋子位置
				yStart: j,         // 棋子位置
				prevVal: prevVal,  // 棋子初始数值
				move: moveList     // 棋子移动信息
			})
		}
	},
	upFind: function (change) {  // change=true 移动棋子、更改numberMatrix矩阵；change=false 只判断是否移动、不更改
		this.movements = []  // 清空已有的移动信息
		let restChange = 0   // 记录空余位置的数量变化
		for (let j = 0; j < 4; j++) {
			let tmpNewLine = []  // 放置移动后的数字序列
			let countPrev = 0    // 记录移动前的棋子数量
			for (let i = 0; i < 4; i++) {
				if (this.numberMatrix[i][j] !== 0) {
					countPrev++
					this.findMove(tmpNewLine, i, j, i)
				}
			}
			// 计算空余位置数量变化
			restChange += countPrev - tmpNewLine.length
			// 需要修改棋子数字信息
			if (change) {
				for (let k = 0; k < 4; k++) {
					if (tmpNewLine[k] !== undefined) {
						this.numberMatrix[k][j] = tmpNewLine[k]
					} else {
						this.numberMatrix[k][j] = 0
					}
				}
			}
		}
		return restChange
	},
	downFind: function (change) {  // change=true 移动棋子、更改numberMatrix矩阵；change=false 只判断是否移动、不更改
		this.movements = []  // 清空已有的移动信息
		let restChange = 0   // 记录空余位置的数量变化
		for (let j = 0; j < 4; j++) {
			let tmpNewLine = []  // 放置移动后的数字情况
			let countPrev = 0    // 记录移动前的棋子数量
			for (let i = 3; i >= 0; i--) {
				if (this.numberMatrix[i][j] !== 0) {
					countPrev++
					this.findMove(tmpNewLine, i, j, 3-i, change)
				}
			}
			// 计算空余位置数量变化
			restChange += countPrev - tmpNewLine.length
			// 需要修改棋子数字信息
			if (change) {  
				for (let k = 3; k >= 0; k--) {
					if (tmpNewLine[3-k] !== undefined) {
						this.numberMatrix[k][j] = tmpNewLine[3-k]
					} else {
						this.numberMatrix[k][j] = 0
					}
				}
			}
		}
		return restChange
	},
	leftFind: function (change) {  // change=true 移动棋子、更改numberMatrix矩阵；change=false 只判断是否移动、不更改
		this.movements = []  // 清空已有的移动信息
		let restChange = 0   // 记录空余位置的数量变化
		for (let i = 0; i < 4; i++) {
			let tmpNewLine = []  // 放置移动后的数字情况
			let countPrev = 0    // 记录移动前的棋子数量
			for (let j = 0; j < 4; j++) {
				if (this.numberMatrix[i][j] !== 0) {
					countPrev++
					this.findMove(tmpNewLine, i, j, j, change)
				}
			}
			// 计算空余位置数量变化
			restChange += countPrev - tmpNewLine.length  
			// 需要修改棋子数字信息
			if (change) {  
				for (let k = 0; k < 4; k++) {
					if (tmpNewLine[k] !== undefined) {
						this.numberMatrix[i][k] = tmpNewLine[k]
					} else {
						this.numberMatrix[i][k] = 0
					}
				}
			}
		}
		return restChange
	},
	rightFind: function (change) {  // change=true 移动棋子、更改numberMatrix矩阵；change=false 只判断是否移动、不更改
		this.movements = []  // 清空已有的移动信息
		let restChange = 0   // 记录空余位置的数量变化
		for (let i = 0; i < 4; i++) {
			let tmpNewLine = []  // 放置移动后的数字情况
			let countPrev = 0    // 记录移动前的棋子数量
			for (let j = 3; j >= 0; j--) {
				if (this.numberMatrix[i][j] !== 0) {
					countPrev++
					this.findMove(tmpNewLine, i, j, 3-j, change)
				}
			}
			// 计算空余位置数量变化
			restChange += countPrev - tmpNewLine.length 
			// 需要修改棋子数字信息 
			if (change) {  
				for (let k = 3; k >= 0; k--) {
					if (tmpNewLine[3-k] !== undefined) {
						this.numberMatrix[i][k] = tmpNewLine[3-k]
					} else {
						this.numberMatrix[i][k] = 0
					}
				}
			}
		}
		return restChange
	},
	// 向上移动棋子
	moveUp: function (context) {
		// 判断移动对象并修改空余位置数量
		this.blankRest += this.upFind(true)
		// 移动
		let len = this.movements.length
		if (len !== 0) {
			let control = this.movements.map(function (val, index) {
				let step = 0  // 移动幅度
				let num = val.prevVal  // 棋子数值
				let xStart = block.positionMatrix[val.xStart][val.yStart].x  // 棋子初始位置
				let yStart = block.positionMatrix[val.xStart][val.yStart].y  // 棋子初始位置
				let yEnd = []  // 棋子数值变化的节点列表
				for (let k in val.move) {
					yEnd[k] = {
						y: block.positionMatrix[val.xStart-val.move[k].step][val.yStart].y,  // 变化节点的位置
						num: val.move[k].val  // 变化后的数值
					}
				}
				// 循环主体
				return requestAnimationFrame (function fn() {
					context.clearRect(xStart, yStart-step, 1200, 1200)  // 清除旧位置的图像
					step += 1000
					let p = 0  // 指示yEnd的序号
					while (yStart - step <= yEnd[p].y) {  // 到达甚至超过转换节点 
						num = yEnd[p].num  // 更新数值
						p++
						if (p >= yEnd.length) { break }
					}
					if (p >= yEnd.length) {  // 已经是最后一个转换节点
						block.drawRoundRect(context, {
							x: xStart,
							y: yEnd[p-1].y  // 定位到结束位置
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						// 结束循环
						cancelAnimationFrame(control[index])
						control[index] = undefined
						// 判断循环是否都结束了
						let result = true
						for (let t in control) {
							if (control[t] !== undefined) {
								result = false
								break
							}
						}
						// 循环全部结束，即棋子移动动画完成
						if (result) {
							block.movements = []  // 清空移动信息
							// 判断输赢
							if (block.gameResult === 1) {
								block.showResult(1)
							} else {
								setTimeout(function () {
									block.randomPiece(context)  // 新增一个棋子
								}, 100)
							}
						}
					} else {
						block.drawRoundRect(context, {
							x: xStart,
							y: yStart - step
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						control[index] = requestAnimationFrame (fn)  // 循环
					}
				})
			})
		} else { this.eventListenerLock = true }
	},
	// 向下移动棋子
	moveDown: function (context) {
		// 判断移动对象并修改空余位置数量
		this.blankRest += this.downFind(true)
		// 移动
		let len = this.movements.length
		if (len !== 0) {
			let control = this.movements.map(function (val, index) {
				let step = 0
				let num = val.prevVal
				let xStart = block.positionMatrix[val.xStart][val.yStart].x
				let yStart = block.positionMatrix[val.xStart][val.yStart].y
				let yEnd = []  // 棋子数值变化的节点列表
				for (let k in val.move) {
					yEnd[k] = {
						y: block.positionMatrix[val.xStart+val.move[k].step][val.yStart].y,
						num: val.move[k].val
					}
				}
				// 循环主体
				return requestAnimationFrame (function fn() {
					context.clearRect(xStart, yStart+step, 1200, 1200)
					step += 1000
					let p = 0  // 指示yEnd的序号
					while (yStart + step >= yEnd[p].y) {  // 到达甚至超过转换节点 
						num = yEnd[p].num  // 更新数值
						p++
						if (p >= yEnd.length) { break }
					}
					if (p >= yEnd.length) {  // 已经是最后一个转换节点
						block.drawRoundRect(context, {
							x: xStart,
							y: yEnd[p-1].y  // 定位到结束位置
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						// 结束循环
						cancelAnimationFrame(control[index])
						control[index] = undefined
						// 判断循环是否都结束了
						let result = true
						for (let t in control) {
							if (control[t] !== undefined) {
								result = false
								break
							}
						}
						// 循环全部结束，即棋子移动动画完成
						if (result) {
							block.movements = []  // 清空移动信息
							// 判断输赢
							if (block.gameResult === 1) {
								block.showResult(1)
							} else {
								setTimeout(function () {
									block.randomPiece(context)  // 新增一个棋子
								}, 100)
							}
						}
					} else {
						block.drawRoundRect(context, {
							x: xStart,
							y: yStart + step
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						control[index] = requestAnimationFrame (fn)  // 循环
					}
				})
			})
		} else { this.eventListenerLock = true }
	},
	// 向左移动棋子
	moveLeft: function (context) {
		// 判断移动对象并修改空余位置数量
		this.blankRest += this.leftFind(true)
		// 移动
		let len = this.movements.length
		if (len !== 0) {
			let control = this.movements.map(function (val, index) {
				let step = 0
				let num = val.prevVal
				let xStart = block.positionMatrix[val.xStart][val.yStart].x
				let yStart = block.positionMatrix[val.xStart][val.yStart].y
				let xEnd = []  // 棋子数值变化的节点列表
				for (let k in val.move) {
					xEnd[k] = {
						x: block.positionMatrix[val.xStart][val.yStart-val.move[k].step].x,
						num: val.move[k].val
					}
				}
				// 循环主体
				return requestAnimationFrame (function fn() {
					context.clearRect(xStart-step, yStart, 1200, 1200)
					step += 1000
					let p = 0  // 指示yEnd的序号
					while (xStart - step <= xEnd[p].x) {  // 到达甚至超过转换节点 
						num = xEnd[p].num  // 更新数值
						p++
						if (p >= xEnd.length) { break }
					}
					if (p >= xEnd.length) {  // 已经是最后一个转换节点
						block.drawRoundRect(context, {
							x: xEnd[p-1].x,  // 定位到结束位置
							y: yStart
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						// 结束循环
						cancelAnimationFrame(control[index])
						control[index] = undefined
						// 判断循环是否都结束了
						let result = true
						for (let t in control) {
							if (control[t] !== undefined) {
								result = false
								break
							}
						}
						// 循环全部结束，即棋子移动动画完成
						if (result) {
							block.movements = []  // 清空移动信息
							// 判断输赢
							if (block.gameResult === 1) {
								block.showResult(1)
							} else {
								setTimeout(function () {
									block.randomPiece(context)  // 新增一个棋子
								}, 100)
							}
						}
					} else {
						block.drawRoundRect(context, {
							x: xStart - step,
							y: yStart
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						control[index] = requestAnimationFrame (fn)  // 循环
					}
				})
			})
		} else { this.eventListenerLock = true }
	},
	// 向右移动棋子
	moveRight: function (context) {
		// 判断移动对象并修改空余位置数量
		this.blankRest += this.rightFind(true)
		// 移动（可以考虑改用requestAnimationFrame）
		let len = this.movements.length
		if (len !== 0) {
			let control = this.movements.map(function (val, index) {
				let step = 0
				let num = val.prevVal
				let xStart = block.positionMatrix[val.xStart][val.yStart].x
				let yStart = block.positionMatrix[val.xStart][val.yStart].y
				let xEnd = []  // 棋子数值变化的节点列表
				for (let k in val.move) {
					xEnd[k] = {
						x: block.positionMatrix[val.xStart][val.yStart+val.move[k].step].x,
						num: val.move[k].val
					}
				}
				// 循环主体
				return requestAnimationFrame (function fn() {
					context.clearRect(xStart+step, yStart, 1200, 1200)
					step += 1000
					let p = 0  // 指示yEnd的序号
					while (xStart + step >= xEnd[p].x) {  // 到达甚至超过转换节点 
						num = xEnd[p].num  // 更新数值
						p++
						if (p >= xEnd.length) { break }
					}
					if (p >= xEnd.length) {  // 已经是最后一个转换节点
						block.drawRoundRect(context, {
							x: xEnd[p-1].x,  // 定位到结束位置
							y: yStart
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						// 结束循环
						cancelAnimationFrame(control[index])
						control[index] = undefined
						// 判断循环是否都结束了
						let result = true
						for (let t in control) {
							if (control[t] !== undefined) {
								result = false
								break
							}
						}
						// 循环全部结束，即棋子移动动画完成
						if (result) {
							block.movements = []  // 清空移动信息
							// 判断输赢
							if (block.gameResult === 1) {
								block.showResult(1)
							} else {
								setTimeout(function () {
									block.randomPiece(context)  // 新增一个棋子
								}, 100)
							}
						}
					} else {
						block.drawRoundRect(context, {
							x: xStart + step,
							y: yStart
						}, block.findColor(num).color1, { color: block.findColor(num).color2, val: num })
						control[index] = requestAnimationFrame (fn)  // 循环
					}
				})
			})
		} else { this.eventListenerLock = true }
	},
	// 判断游戏是否输了
	judgeLose: function (result) {
		// 判断是否没有移动的可能了
		if (this.upFind(false) === 0 && this.downFind(false) === 0 && this.leftFind(false) === 0 && this.rightFind(false) === 0) {
			this.showResult(2)
		}		
	},
	// 显示游戏结果
	showResult: function (result) {
		switch (result) {
			case 0:  // 游戏中
				this.gameResult = 0
				break
			case 1:  // 赢了
				this.gameResult = 1
				document.getElementById("win").style.display = "inline"
				this.eventListenerLock = false
				break
			case 2:  // 输了
				this.gameResult = 2
				document.getElementById("lose").style.display = "inline"
				this.eventListenerLock = false
				break
		}
	}
}
window.onload = function () {
	let startBtn = document.getElementById("start")
	startBtn.style.display = "inline"
	let btn = document.getElementsByTagName("button")
	for (let i in btn) {
		btn[i].onclick = function() {
			console.log("click")
			this.style.display = "none"
			// 开始游戏，获取并绘制背景
			let backGroundContainer = document.getElementById("gameBackGround")
			let backGroundContext = backGroundContainer.getContext("2d")
			block.drawBackGround(backGroundContext)
			// 获取棋子容器并开局
			let moveContainer = document.getElementById("gameMove")
			let moveContext = moveContainer.getContext("2d")
			block.init(moveContext)
			// 监听按键（PC端）
			document.onkeydown = function (event) {
				if (block.eventListenerLock) {
					block.eventListenerLock = false
					switch (event.keyCode) {
						case 37:
							block.moveLeft(moveContext)
							break
						case 38:
							block.moveUp(moveContext)
							break
						case 39:
							block.moveRight(moveContext)
							break
						case 40:
							block.moveDown(moveContext)
							break
					}
				}
			}
			// 监听手指滑动（移动端）
			let wrap = document.getElementById("wrap")
			let startX, startY, endX, endY
			wrap.addEventListener("touchstart", function f(e){
				// 游戏中状态才监听滑动，否则触发按钮点击
				if (block.gameResult === 0) {
					e.preventDefault()  // 阻止事件冒泡
					startX = e.changedTouches[0].pageX
					startY = e.changedTouches[0].pageY
				}
			});
			wrap.addEventListener("touchend", function f(e){
				// 游戏中状态才监听滑动，否则触发按钮点击
				if (block.gameResult === 0) {
					e.preventDefault()  // 阻止事件冒泡
					if (block.eventListenerLock) {
						endX = e.changedTouches[0].pageX
					    endY = e.changedTouches[0].pageY
					    // 排除小范围的手指点击误差
					    let x = Math.abs(endX - startX) < 50 ? 0 : endX - startX
					    let y = Math.abs(endY - startY) < 50 ? 0 : endY - startY
					    // 右滑
					    if ( x > 0 && Math.abs(x) > Math.abs(y)) { 
					    	block.eventListenerLock = false
					    	block.moveRight(moveContext)
					    }
					    // 左滑
					    if ( x < 0 && Math.abs(x) > Math.abs(y)) {
					    	block.eventListenerLock = false
					    	block.moveLeft(moveContext)
					    }
					    // 上滑
					    if ( y < 0 && Math.abs(x) < Math.abs(y)) {
					    	block.eventListenerLock = false
					    	block.moveUp(moveContext)
					    }
					    // 下滑
					    if ( y > 0 && Math.abs(x) < Math.abs(y)) {
					    	block.eventListenerLock = false
					    	block.moveDown(moveContext)
					    }
					}
				}
			})
		}			
	}
}