import { toast } from "react-toastify";
import baseApi from "../lib/baseApi";

const handleError = (error, message = "Đã xảy ra lỗi") => {
    console.error(message, error);
    toast.error(message);
    throw error;
};

const orderServices = {
    getAll: async (params = {}) => {
        try {
            const res = await baseApi.get("/orders", { params });
            const { items, statusCount, total, page, pageSize, totalPages } = res.data.data;

            return {
                data: items,
                statusCount: statusCount,
                total,
                page: page,
                pageSize,
                totalPages
            };

        } catch (error) {
            return handleError(error, "Lỗi khi lấy danh sách đơn hàng");
        }
    },

    getExport: async (params = {}) => {
        try {
            const res = await baseApi.get("/orders/export", {
                params,
                responseType: 'blob',
            });
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi xuất file Excel");
        }
    },

    updateStatusById: async (credentials) => {
        try {
            const res = await baseApi.patch(`/orders/update-status/`, credentials);
            toast.success("Đổi thông tin thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi đổi thông tin");
        }
    },

    changleOrderList: async (status, ids) => {
        try {
            const res = await baseApi.patch("/orders/update-many-status", {
                status: status,
                ids: ids,
            });
            
            toast.success("Thay đổi trạng thái đơn hàn thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi thay đổi trạng thái đơn hàng");
        }
    },

    deleteList: async (ids) => {
        try {
            const res = await baseApi.post("/orders/delete-many", {
                ids: ids,
            });

            toast.success("Xóa danh sách đơn hàng thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi xóa đơn hàng");
        }
    },

    delete: async (id) => {
        try {
            const res = await baseApi.delete(`/orders/${id}`);
            toast.success("Xóa đơn hàng thành công!");
            return res.data;
        } catch (error) {
            return handleError(error, "Lỗi khi xóa đơn hàng");
        }
    },
};

export default orderServices;