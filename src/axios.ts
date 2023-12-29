import axios from "axios";

const axiosClient  = axios.create({
	baseURL: 'http://106.14.107.95:42069',
	proxy: {
		host: '127.0.0.1',
		port: 7890,
	}
})

export default axiosClient