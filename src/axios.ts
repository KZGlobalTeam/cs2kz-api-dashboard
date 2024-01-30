import axios from "axios";

const axiosClient  = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	// proxy: {
	// 	host: '127.0.0.1',
	// 	port: 7890,
	// }
  withCredentials: true
})

export default axiosClient