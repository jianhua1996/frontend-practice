<template>
	<button @click="addThrottle">添加节流效果</button>
	<button @click="addDebounce">添加防抖效果</button>
	<button @click="handleMouseMove = originHandler">重置事件</button>
	<div
		class="throttle-and-debounce"
		@mousemove="handleMouseMove"
	>
		<div v-for="(val, key) in mouseInfo">{{ key }}: {{ val }}</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { throttle, debounce } from '@/utils/event'
const mouseInfo = ref({})
const handleMouseMove = ref(() => {})

const originHandler = e => {
	// debugger
	mouseInfo.value = {
		clientX: e.clientX,
		clientY: e.clientY,
		offsetX: e.offsetX,
		offsetY: e.offsetY,
		pageX: e.pageX,
		pageY: e.pageY,
		screenX: e.screenX,
		screenY: e.screenY,
		movementX: e.movementX,
		movementY: e.movementY
	}
}

onMounted(() => {
	handleMouseMove.value = originHandler
})

const addThrottle = () => {
	handleMouseMove.value = throttle(handleMouseMove.value)
}

const addDebounce = () => {
	handleMouseMove.value = debounce(handleMouseMove.value)
}
</script>

<style lang="scss" scoped>
.throttle-and-debounce {
	width: 500px;
	height: 500px;
	border: 1px solid purple;
}
</style>
