/**
 * 只负责切片，从文件的起始位置到结束位置，切出一块数据，并返回。
 * @param {Blob} file
 * @param {number} start
 * @param {number} end
 * @returns {{name: string, size: number, start: number, end: number, data: Blob}}
 */
export function createChunk(file, start, end) {
	const chunk = file.slice(start, end)
	return {
		name: file.name,
		size: chunk.size,
		start: start,
		end: end,
		data: chunk
	}
}

/**
 * 切割文件，将文件切割成指定大小的块，并返回块列表。
 * 切割文件采用多线程，每个线程负责切割一部分文件。
 * @param {Blob} file
 * @param {number} chunkSize
 * @param {{threadNum?: number}} options
 * @returns {Promise<Array<{name: string, size: number, start: number, end: number, data: Blob}>>}
 */
export function cutFile(file, options = {}) {
	return new Promise((resolve, reject) => {
		if (!file || !(file instanceof Blob)) {
			return reject(new Error('Invalid file parameter'))
		}

		let { chunkSize, threadNum, onProgress } = options
		if (typeof chunkSize !== 'number') {
			chunkSize = 1024 * 1024 // 默认块大小为 1MB
		}
		if (typeof threadNum !== 'number') {
			threadNum = navigator.hardwareConcurrency || 4 // 总线程数
		}
		if (onProgress && typeof onProgress !== 'function') throw new Error('onProgress must be a function')

		const chunkCount = Math.ceil(file.size / chunkSize) // 文件大小除以块大小，向上取整，得到块数，也就是任务数

		onProgress?.({
			status: 'cutStart',
			data: {
				name: file.name,
				size: file.size,
				chunkSize,
				chunkCount,
				threadNum
			},
			msg: `分片开始，文件名为${file.name}，文件大小为${file.size}，块大小为${chunkSize}，块数为${chunkCount}，线程数为${threadNum}`
		})

		const minTaskOfThread = Math.floor(chunkCount / threadNum) // 每个线程至少要执行的任务数
		let restTaskOfThread = chunkCount % threadNum // 任务余数

		const chunkTasks = [] // 任务列表
		let currentStartTaskIndex = 0
		let dispatchedAll = false

		for (let i = 0; i < threadNum; i++) {
			if (dispatchedAll) break
			let tasksPerThread = minTaskOfThread
			if (restTaskOfThread > 0) {
				tasksPerThread += 1
				restTaskOfThread -= 1
			}
			const startTaskIndex = currentStartTaskIndex
			let endTaskIndex = startTaskIndex + tasksPerThread
			currentStartTaskIndex = endTaskIndex

			if (endTaskIndex >= chunkCount) {
				endTaskIndex = chunkCount
				dispatchedAll = true
			}

			const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })

			onProgress?.({
				status: 'threadStart',
				data: {
					threadIndex: i,
					startTaskIndex,
					endTaskIndex,
					tasksPerThread
				},
				msg: `创建线程${i}，负责任务${startTaskIndex}到${endTaskIndex}`
			})

			// file, startTaskIndex, endTaskIndex, chunkSize
			worker.postMessage({
				file,
				startTaskIndex,
				endTaskIndex,
				chunkSize
			})

			worker.onmessage = e => {
				onProgress?.({
					status: 'threadEnd',
					data: {
						threadIndex: i,
						startTaskIndex,
						endTaskIndex,
						tasksPerThread
					},
					msg: `线程${i}完成，负责任务${startTaskIndex}到${endTaskIndex}`
				})

				for (let j = 0; j < e.data.length; j++) {
					chunkTasks[startTaskIndex + j] = e.data[j]
				}

				if (chunkTasks.length === chunkCount) {
					resolve(chunkTasks)
				}

				worker.terminate()
			}

			worker.onerror = err => {
				reject(new Error(`Worker error: ${err.message}`))
				worker.terminate()
			}
		}
	})
}
