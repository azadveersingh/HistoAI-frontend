import axios from "axios";

const axiosWithAuth = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
};

export default axiosWithAuth;
