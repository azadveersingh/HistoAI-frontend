import axios from "axios";

const axiosWithAuth = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axiosWithAuth;
