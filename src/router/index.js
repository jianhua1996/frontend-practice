import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes = [
	{
		path: '/',
		alias: '/home',
		name: 'Home',
		component: HomeView
	},
	{
		path: '/file-slice',
		name: 'FileSlice',
		component: () => import('../views/FileSlice.vue')
	},
	{
		path: '/throttle-and-debounce',
		name: 'ThrottleAndDebounce',
		component: () => import('../views/ThrottleAndDebounce.vue')
	}
]
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router
