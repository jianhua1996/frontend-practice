import { createChunk } from './file.js'

self.onmessage = function (e) {
	const { file, startTaskIndex, endTaskIndex, chunkSize } = e.data
    // debugger
	const chunks = []
	// 循环当前线程需要处理的任务，从 startTaskIndex 到 endTaskIndex，每一项创建一个 chunk
	for (let i = startTaskIndex; i < endTaskIndex; i++) {
		const startChunkIndex = i * chunkSize // 计算当前 chunk 的起始位置
		let endChunkIndex = startChunkIndex + chunkSize // 计算当前 chunk 的结束位置
		if (endChunkIndex > file.size) {
			// 如果结束位置超过文件大小，则取文件大小为结束位置
			endChunkIndex = file.size
		}

		const chunk = createChunk(file, startChunkIndex, endChunkIndex)
		chunks.push(chunk)
	}
	self.postMessage(chunks)
}
