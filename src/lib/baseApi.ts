import axios from 'axios';
import Cookies from 'js-cookie';

// Cấu hình các môi trường và API URL tương ứng.
const apiUrls: { [key: string]: string } = {
  mb66: 'http://localhost:9000/api/v1'
};

// Map từ hostname của trang admin sang key của hệ thống
export const siteMapping: { [key: string]: string } = {
  'localhost': 'mb66' // Mặc định là new88 khi chạy local, bạn có thể đổi
};


const baseApi = axios.create({
  baseURL: '', // baseURL sẽ được set tự động trong interceptor
  headers: {
    'Content-Type': 'application/json',
  },
});

baseApi.interceptors.request.use((config) => {
  // Chỉ thực thi ở phía client
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const siteKey = siteMapping[hostname] || '';

    if (apiUrls[siteKey]) {
      config.baseURL = apiUrls[siteKey];
      // Gán 'site' vào data của request nếu là phương thức POST, PUT, PATCH
      if (config.data && ['post', 'put', 'patch'].includes(config.method || '')) {
        config.data.site = siteKey;
      }
    }
  }
  
  const token = Cookies.get("mb66botchitieu_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      Cookies.remove("mb66botchitieu_token");
      // Chuyển hướng người dùng về trang đăng nhập
      // Đảm bảo rằng bạn đang ở môi trường client-side trước khi dùng window
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default baseApi;