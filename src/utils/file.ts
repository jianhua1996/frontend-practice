interface Chunk {
	name: string
	size: number
	start: number
	end: number
	data: Blob
}

export function createChunk(file: File, start: number, end: number): Chunk {
	if (!file || !(file instanceof File)) {
		throw new Error('file parameter must be a File instance')
	}
	if (start < 0 || end > file.size || start >= end) {
		throw new RangeError('start or end parameter out of range')
	}
	const chunk = file.slice(start, end)
	return {
		name: file.name,
		size: chunk.size,
		start: start,
		end: end,
		data: chunk
	}
}

interface CutFileOptions {
	chunkSize?: number
	threadNum?: number
	onProgress?: Function
}
export function cutFile(file: File, options: CutFileOptions = {}) {
	return new Promise((resolve, reject) => {
		if (!file || !(file instanceof File)) {
			throw new Error('file parameter must be a File instance')
		}

		let { chunkSize = 1024 * 1024, threadNum = navigator.hardwareConcurrency || 4, onProgress } = options

		// 参数校验增强
		if (chunkSize <= 0) {
			throw new Error('chunkSize must be a positive number')
		}
		if (threadNum <= 0) {
			threadNum = Math.max(1, navigator.hardwareConcurrency || 4)
		}

		if (onProgress && typeof onProgress !== 'function') throw new Error('onProgress must be a function')

		const chunkCount = Math.ceil(file.size / chunkSize) // 文件大小除以块大小，向上取整，得到块数，也就是任务数

		const minTaskOfThread = Math.floor(chunkCount / threadNum) // 任务数除以线程数，向下取整，得到每个线程至少要执行的任务数
		let restTaskOfThread = chunkCount % threadNum // 任务数除以线程数，取余，得到剩余的任务数

		const chunkTasks = [] // 准备一个数组，用来存储所有结束的任务
		let currentStartTaskIndex = 0 // 当前线程开始执行的任务索引
		let dispatchedAll = false // 是否已经分发完所有任务
		let completedTasks = 0
		const workers = []

		onProgress?.({
			type: 'start',
			fileName: file.name,
			fileSize: file.size,
			chunkSize: chunkSize,
			chunkCount,
			threadNum
		})

		for (let i = 0; i < threadNum; i++) {
			if (dispatchedAll) break // 如果已经分发完所有任务，则跳出循环，避免创建空的线程任务

			let tasksPerThread = minTaskOfThread

			if (restTaskOfThread > 0) {
				// 如果剩余的任务数大于0，则当前线程任务数加1，剩余的任务数减1
				tasksPerThread++
				restTaskOfThread--
			}

			// 计算当前线程的开始和结束索引
			const startTaskIndex = currentStartTaskIndex
			let endTaskIndex = startTaskIndex + tasksPerThread
			currentStartTaskIndex = endTaskIndex

			// 如果当前线程的结束索引大于等于总任务数，则将结束索引设置为总任务数，并标记分发完所有任务
			if (endTaskIndex >= chunkCount) {
				endTaskIndex = chunkCount
				dispatchedAll = true
			}

			// 创建一个线程，并传递参数
			const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
			workers.push(worker)

			// 传递参数给线程
			worker.postMessage({
				file,
				startTaskIndex,
				endTaskIndex,
				chunkSize
			})

			worker.onmessage = e => {
				for (let j = 0; j < e.data.length; j++) {
					chunkTasks[startTaskIndex + j] = e.data[j]
				}

				completedTasks += e.data.length
				onProgress?.({
					type: 'progress',
					current: completedTasks,
					total: chunkCount
				})

				if (chunkTasks.length === chunkCount) {
					resolve(chunkTasks)
					onProgress?.({
						type: 'complete',
						current: completedTasks,
						total: chunkCount
					})
				}

				worker.terminate()
			}

			worker.onerror = err => {
				reject(new Error(`Worker error: ${err.message}`))
				workers.forEach(worker => worker.terminate())
				workers.length = 0
			}
		}
	})
}
