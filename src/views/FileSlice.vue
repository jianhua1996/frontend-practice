<template>
	<div class="home">
		<input
			type="file"
			@change="handleFileChange"
		/>
		<br />
		<n-log
			:rows="10"
			:log="logContent"
		/>
	</div>
</template>
<script setup lang="ts">
import { cutFile, progressType } from '@/utils/file'

const logContent = ref('')

const handleProgress = (e: progressType) => {
	if (e.type === 'start') {
		logContent.value += `开始执行，总文件大小：${e.file.size}，文件名：${e.file.name}，分片数：${e.sliceInfo.chunkCount}，线程数：${e.sliceInfo.threadNum}\n\n`
	}
	if (e.type === 'progress') {
		logContent.value += `进度： ${((e.current / e.total) * 100).toFixed(2)}%， 当前执行： ${e.current}/${e.total}\n`
	}
	if (e.type === 'complete') {
		logContent.value += `完成\n\n`
	}
}
const handleFileChange = async (e: InputEvent) => {
	const file = (e.target as HTMLInputElement).files[0]
	const chunks = await cutFile(file, { onProgress: handleProgress })

	downloadFile(chunks, { name: file.name, type: file.type })
}

const downloadFile = (chunks, { name, type }) => {
	chunks.sort((a, b) => a.start - b.start)

	const blob = new Blob(
		chunks.map(chunk => chunk.data),
		{ type }
	)
	// console.log(blob)
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = name
	document.body.appendChild(a)
	a.click()

	// 释放 URL 对象
	URL.revokeObjectURL(url)
	document.body.removeChild(a)
}
</script>
