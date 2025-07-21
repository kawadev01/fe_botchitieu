import axios from 'axios';
import Cookies from 'js-cookie';

// Cấu hình các môi trường và API URL tương ứng.
const apiUrls: { [key: string]: string } = {
  f168: 'https://api-quatangv2-f168.attcloud.work/api',
  new88: 'https://api-quatangv2-new88.attcloud.work/api',
  shbet: 'https://api-quatangv2-shbet.attcloud.work/api',
};

// Map từ hostname của trang admin sang key của hệ thống
export const siteMapping: { [key: string]: string } = {
  'f168msb.attcloud.org': 'f168',
  'new88msb.attcloud.org': 'new88',
  'shbetmsb.attcloud.org': 'shbet',
  // Thêm 'localhost' để phát triển ở local
  'localhost': 'new88' // Mặc định là new88 khi chạy local, bạn có thể đổi
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
  
  const token = Cookies.get("token");
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
      Cookies.remove("token");
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