import { toast } from "react-toastify";
import baseApi from "../lib/baseApi";

const handleError = (error, message = "Đã xảy ra lỗi") => {
    const errorMessage = error.response?.data?.message || message;
    console.error(message, error);
    toast.error(errorMessage);
    // Trả về một cấu trúc lỗi để phía component có thể bắt và xử lý
    return { success: false, message: errorMessage, data: null };
};

const userServices = {
    getUser: async (params = {}) => {
        try {
            const res = await baseApi.get("/users", { params });
            // Cập nhật theo cấu trúc response mới từ API_DOCUMENTATION.md
            if (res.data.success) {
                return res.data; // res.data đã chứa { success, data: { data, meta }, message }
            } else {
                toast.error(res.data.message || "Lấy danh sách người dùng thất bại.");
                return { success: false, data: { data: [], meta: {} } };
            }
        } catch (error) {
            return handleError(error, "Lỗi khi lấy danh sách người dùng");
        }
    },

    getByIdUser: async (id) => {
        try {
            const res = await baseApi.get(`/users/${id}`);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi lấy thông tin người dùng");
        }
    },

    postUser: async (credentials) => {
        try {
            const res = await baseApi.post("/users", credentials);
            return res.data; // API trả về { success, data, message }
        } catch (error) {
            return handleError(error, "Lỗi khi tạo người dùng");
        }
    },

    // Hàm chung để cập nhật thông tin người dùng (role, status, etc.)
    updateUser: async (id, updateData) => {
        try {
            const res = await baseApi.patch(`/users/${id}`, updateData);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi cập nhật người dùng");
        }
    },
    
    // Lưu ý: API doc không có endpoint đổi mật khẩu. Hàm này là giả định.
    // Nếu cần, bạn cần định nghĩa endpoint trong backend.
    changePasswordUser: async (form, id) => {
        try {
            let credentials = {
                oldPassword: form.oldPassword,
                newPassword: form.password
            };
            // Giả sử endpoint là `/users/{id}/change-password`
            const res = await baseApi.patch(`/users/${id}/change-password`, credentials);
            toast.success("Đổi mật khẩu thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi đổi mật khẩu người dùng");
        }
    },

    deleteUser: async (id) => {
        try {
            const res = await baseApi.delete(`/users/${id}`);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi xóa người dùng");
        }
    },
};

export default userServices;