import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  // baseURL: 'https://your-deployed-api.example.com', // production
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
