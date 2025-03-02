const throttle = function (fn, interval = 500) {
	// 节流函数： 触发事件后，在n秒内只执行一次操作

	let last = Date.now()
	return function (...args) {
		if (Date.now() - last < interval) {
			return
		}
		last = Date.now()
		fn.call(this, ...args)
	}
}

const debounce = function (fn, delay = 50) {
	// 防抖函数： 触发事件后，把n秒内的操作合并为一次执行

	let timer = null
	return function (...args) {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			fn.call(this, ...args)
		}, delay)
	}
}

export { throttle, debounce }
