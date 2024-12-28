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
export function cutFile(file, chunkSize = 1024 * 1024 * 2, options = {}) {
	return new Promise((resolve, reject) => {
		let { threadNum = 4 } = options
		const chunkCount = Math.ceil(file.size / chunkSize) // 文件大小除以块大小，向上取整，得到块数，也就是任务数
		if (!threadNum || threadNum > navigator.hardwareConcurrency) {
			threadNum = navigator.hardwareConcurrency // 总线程数
		}
		console.log(
			`切割文件：${file.name}，总大小：${file.size}，块大小：${chunkSize}，线程数：${threadNum}，块数：${chunkCount}`
		)
		const chunkCountPerThread = Math.ceil(chunkCount / threadNum) // 总任务数除以线程数，向上取整，得到每个线程负责的任务数
		const chunkTasks = [] // 任务列表
		let dispatchedAll = false // 是否全部任务都已分配完毕

		// 循环创建线程，每个线程负责切割自己负责任务数的块
		for (let i = 0; i < threadNum; i++) {
			if (dispatchedAll) break // 如果分配完毕，则退出循环
			const startTaskIndex = i * chunkCountPerThread // 当前线程负责的任务开始任务索引
			let endTaskIndex = startTaskIndex + chunkCountPerThread // 当前线程负责的任务结束任务索引
			if (endTaskIndex >= chunkCount) {
				// 如果超出任务总数，则分配剩余任务给最后一个线程
				endTaskIndex = chunkCount
				dispatchedAll = true
			}

			const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
			console.log(`线程${i}开始分配任务：${startTaskIndex}-${endTaskIndex}`)

			worker.postMessage({
				file,
				startTaskIndex,
				endTaskIndex,
				chunkSize
			})

			worker.onmessage = e => {
				for (let j = 0; j < e.data.length; j++) {
					console.log(`线程${i}完成任务${startTaskIndex + j}`)
					chunkTasks[startTaskIndex + j] = e.data[j] // 将切割好的块添加到任务列表中
				}
				// 如果任务列表中所有任务都已完成，则返回结果
				if (chunkTasks.length === chunkCount) {
					resolve(chunkTasks)
				}
				// 当前线程完成任务，释放资源
				worker.terminate()
			}
		}
	})
}
