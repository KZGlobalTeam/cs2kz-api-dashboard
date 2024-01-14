import axios from "axios";
import { apiBaseUrl } from "./types";

const axiosClient  = axios.create({
	baseURL: apiBaseUrl,
	// proxy: {
	// 	host: '127.0.0.1',
	// 	port: 7890,
	// }
  withCredentials: true
})

export default axiosClient