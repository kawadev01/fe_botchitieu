import { toast } from "react-toastify";
import baseApi from "../lib/baseApi";

const handleError = (error, message = "Đã xảy ra lỗi") => {
    console.error(message, error);
    toast.error(message);
    throw error;
};

const customerServices = {
    getAll: async (params = {}) => {
        try {
            const res = await baseApi.get("/customers", { params });
            const { items, total, page, pageSize, totalPages } = res.data.data;

            return {
                data: items,
                total,
                page: page,
                pageSize,
                totalPages
            };

        } catch (error) {
            return handleError(error, "Lỗi khi lấy danh sách khách hàng");
        }
    },

    getAllCustomerPoint: async (params = {}) => {
        try {
            const res = await baseApi.get("/customers/history-point", { params });
            const { items, total, page, pageSize, totalPages, totalPoinTake, totalPoinUsed, totalPointCurrent } = res.data.data;

            return {
                data: items,
                total,
                page: page,
                pageSize,
                totalPages,
                totalPoinTake,
                totalPoinUsed,
                totalPointCurrent
            };

        } catch (error) {
            return handleError(error, "Lỗi khi lấy danh sách khách hàng");
        }
    },

    updateStatus: async (username, site) => {
        try {
            const res = await baseApi.patch(`/customers/update-status?username=${username}&site=${site}`);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi đổi mật khẩu người dùng");
        }
    },

    findHistories: async (username, site) => {
        try {
            const res = await baseApi.patch(`/customers/find-histories?username=${username}&site=${site}`);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi đổi mật khẩu người dùng");
        }
    }
};

export default customerServices;