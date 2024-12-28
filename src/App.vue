<template>
	<div class="main-wrapper">
		<div class="sidebar">
			<div
				v-for="(item, index) in items"
				:key="item.name"
			>
				<router-link :to="item.path">{{ item.name }}</router-link>
			</div>
		</div>
		<div class="content">
			<router-view></router-view>
		</div>
	</div>
</template>
<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { routes } from './router'

const items = ref(routes)
</script>
<style scoped lang="scss">
.main-wrapper {
	display: flex;
	height: 100vh;
	padding: 10px;
	.sidebar {
		width: 200px;
		border-right: 1px solid #ccc;
	}
	.content {
		flex: 1;
	}
}
</style>
