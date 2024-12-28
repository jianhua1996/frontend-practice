import axios from 'axios'

const instance = axios.create({
	baseURL: '/api'
})

instance.interceptors.request.use(config => {
	// debugger
	return config
})

instance.interceptors.response.use(response => {
	// debugger
	// 成功的请求拆包返回数据
	if (response.status === 200) {
		return response.data
	}
	return response
})

export default instance
