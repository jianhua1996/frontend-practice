<template>
	<div class="main-wrapper">
		<div class="sidebar">
			<div
				v-for="(item, index) in items"
				:key="item.name"
			>
				<n-button
					type="info"
					size="medium"
					round
					secondary
					:to="item.path"
					class="sidebar-item"
					@click="router.push(item.path)"
					>{{ item.meta?.title || item.name }}</n-button
				>
			</div>
		</div>
		<div class="content">
			<router-view></router-view>
		</div>
	</div>
</template>
<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import { routes } from './router'

const router = useRouter()

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
		div:not(:last-of-type) > .sidebar-item {
			margin-bottom: 8px;
		}
	}
	.content {
		flex: 1;
	}
}
</style>
