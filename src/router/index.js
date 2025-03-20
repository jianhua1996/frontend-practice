import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes = [
	{
		path: '/',
		alias: '/home',
		name: 'Home',
		component: HomeView,
		meta: {
			title: '首页'
		}
	},
	{
		path: '/file-slice',
		name: 'FileSlice',
		component: () => import('../views/FileSlice.vue'),
		meta: {
			title: '文件切片'
		}
	},
	{
		path: '/throttle-and-debounce',
		name: 'ThrottleAndDebounce',
		component: () => import('../views/ThrottleAndDebounce.vue'),
		meta: {
			title: '节流与防抖'
		}
	}
]
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router
