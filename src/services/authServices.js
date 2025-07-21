import { toast } from "react-toastify";
import baseApi from '../lib/baseApi';

// Chuẩn hóa xử lý controller: trả về object chuẩn gồm status_code, message, data
const authServices = {
  login: async (credentials) => {
    try {
      const res = await baseApi.post("/auth/login", credentials);

      // Xử lý dữ liệu trả về từ API theo cấu trúc mới
      const { success, message, data } = res.data;

      if (success) {
        // Nếu thành công, trả về dữ liệu đã được chuẩn hóa
        return {
          success: true, // Sử dụng HTTP status code
          message: message || "Đăng nhập thành công!",
          data: data,
        };
      } else {
        // Nếu API trả về success: false, hiển thị lỗi và trả về cấu trúc lỗi
        const errorMessage = message || "Đã xảy ra lỗi không xác định.";
        toast.error(errorMessage);
        return {
          success: false,
          message: errorMessage,
          data: null,
        };
      }
    } catch (error) {
      // Lấy message lỗi từ response hoặc fallback
      const message =
        error?.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      toast.error(message);

      // Trả về object lỗi chuẩn hóa
      return {
        success: false,
        message,
        data: null,
      };
    }
  },
};

export default authServices;