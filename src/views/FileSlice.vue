<template>
	<div class="home">
		<input
			type="file"
			@change="handleFileChange"
		/>
	</div>
</template>
<script setup>
import { cutFile } from '@/utils/file'
const handleFileChange = async e => {
	const file = e.target.files[0]
	const chunks = await cutFile(file)
	console.log(chunks)
}
</script>
