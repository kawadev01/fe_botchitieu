
import { toast } from "react-toastify";
import baseApi from "../lib/baseApi";

const handleError = (error, message = "Đã xảy ra lỗi") => {
    console.error(message, error);
    toast.error(message);
    throw error;
};

const templateMessageServices = {
    getAll: async (params = {}) => {
        try {
            const res = await baseApi.get(`/messages/all/${params.site}`);
            const { items, total, page, pageSize, totalPages } = res.data.data;

            return {
                data: items,
                total,
                page: page,
                pageSize,
                totalPages
            };

        } catch (error) {
            return handleError(error, "Lỗi khi lấy danh sách đánh giá");
        }
    },

    getById: async (id) => {
        try {
            const res = await baseApi.get(`/messages/${id}`);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi lấy thông tin tin nhắn phản hồi");
        }
    },

    postMessage: async (credentials) => {
        try {
            const res = await baseApi.post("/messages", credentials);
            toast.success("Tạo tin nhắn phản hồi thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi tạo tin nhắn phản hồi");
        }
    },

    update: async (credentials, id) => {
        try {
            const res = await baseApi.patch(`/messages/${id}`, credentials);
            toast.success("Đổi thông tin thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi đổi thông tin");
        }
    },

    delete: async (id) => {
        try {
            const res = await baseApi.delete(`/messages/${id}`);
            toast.success("Xóa tin nhắn phản hồi thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi xóa tin nhắn phản hồi");
        }
    },
};

export default templateMessageServices;