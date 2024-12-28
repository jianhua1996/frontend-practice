import request from './request'

export function getHomeData() {
	return request({
		url: '/home/list',
		method: 'get'
	})
}
