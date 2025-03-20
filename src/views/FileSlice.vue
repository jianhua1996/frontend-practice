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
<script setup>
import { cutFile } from '@/utils/file'

const logContent = ref('')

const handleProgress = e => {
	logContent.value += e.msg + '\n'
}
const handleFileChange = async e => {
	const file = e.target.files[0]
	const chunks = await cutFile(file, { onProgress: handleProgress })
	// console.log(chunks)
	downloadFile(chunks, { name: file.name, type: file.type })
}

const downloadFile = (chunks, { name, type }) => {
	// {
	//     "name": "Downloads_2.zip",
	//     "size": 1048576,
	//     "start": 9437184,
	//     "end": 10485760,
	//     "data": {}  // Blob
	// }
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
