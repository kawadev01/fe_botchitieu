import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import { useMultiModal } from "@/hooks/useMultiModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import templateMessageServices from '@/services/templateMessageServices';
import productServices from '@/services/productServices';
import { information } from '@/utils/info.const';
import TextArea from "../form/input/TextArea";
import { getSiteSystem } from "@/utils/storage";
import { useAuth } from "@/context/AuthContext";
import { formatDateTimeVN } from "@/utils/formatDateTime";

const initialForm = {
    product_id: '',
    title: '',
    content: '',
    note: '',
    type_message: '',
    site: getSiteSystem(),
    created_by: ''
};

interface MessageItem {
    _id: string;
    title: string;
    product_id: string;
    content: string;
    note: string;
    type_message: string;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    product_id: string;
    name: string;
}

export default function TemplateMessagesTable() {
    const [data, setData] = useState<MessageItem[]>([]);
    const { user } = useAuth();
    const [dataProducts, setProducsData] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editMessageId, setEditMessageId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        username: '',
    });

    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen, modalType]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (modalType === "add") {
                form.created_by = user?.username ?? "Admin";
                res = await templateMessageServices.postMessage(form);
                if (res.status_code == 200) {
                    closeModal();
                    fetchMessages();
                } else {
                    alert(res.message)
                }
            } else if (modalType === "update") {
                form.created_by = user?.username ?? "Admin";
                res = await templateMessageServices.update(form, editMessageId);

                if (res.status_code == 200) {
                    closeModal();
                    fetchMessages();
                } else {
                    alert(res.message)
                }
            }

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const deleteMessage = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await templateMessageServices.delete(id);
            fetchMessages();
        } catch (err) {
            setError('Xóa bình luận thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchMessages = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const review = await templateMessageServices.getAll(params);
            setData(review.data);
            setCurrentPage(review.page);
            setItemsPerPage(review.total);
        } catch (err) {
            console.log("Danh sách lỗi !");
        }
    };

    const fetchProducts = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const products = await productServices.getAll(params);
            setProducsData(products.data);
        } catch (err) {
            console.log("Danh sách lỗi !");
        }
    };

    const fetchMessageId = async (id: string) => {
        try {
            const templateMessage = await templateMessageServices.getById(id);
            setForm(prev => ({
                ...prev,
                ...templateMessage.data,
                updated_by: user?.username ?? "ADMIN",
            }));

            setTimeout(() => openModal("update"), 200);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu Message", err);
        }
    }

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    useEffect(() => {
        if (editMessageId) {
            fetchMessageId(editMessageId);
        }
    }, [editMessageId]);

    useEffect(() => {
        fetchMessages();
        fetchProducts();
    }, []);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="m-5 flex justify-end">
                    <button
                        onClick={() => openModal("add")}
                        type="button"
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                        Thêm phản hồi
                    </button>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Tiêu đề", "ID Sản phẩm", "Nội dung", "Ghi chú", "Kiểu thư", "Ngày tạo", "Ngày cập nhật", "Hành Động"].map((header, idx) => (
                                        <TableCell
                                            key={idx}
                                            isHeader
                                            className={`px-5 py-3 font-medium text-gray-500 ${header === "Hành Động" ? "text-center" : "text-start"} text-theme-xs dark:text-gray-400`}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {data.map((message, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{message.title}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{message.product_id}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{message.content}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{message.note}</TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400 text-center text-white">
                                            {message.type_message == "allow" ? (<div className="bg-green-600">Báo thành công</div>) : (<div className="bg-red-500">Báo từ chối</div>)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTimeVN(message.createdAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDateTimeVN(message.updatedAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditMessageId(message._id);
                                                        fetchMessageId(message._id);
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => deleteMessage(message._id)}
                                                    type="button"
                                                    className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {modalType === "add" ? "Tạo tin nhắn khách" : "Sửa tin nhắn khách"}
                        </h4>
                    </div>

                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <>
                                <Label>Tên tài khoản</Label>
                                <select
                                    name="product_id"
                                    className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                                    value={form.product_id}
                                    onChange={(e) => handleChange(e)}
                                >
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {dataProducts.map((product, index) => (
                                        <option
                                            key={index}
                                            value={product.product_id}
                                            selected={form.product_id === product.product_id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <br />
                                <br />

                                <Label>Tiêu đề</Label>
                                <Input
                                    type="text"
                                    placeholder="Tiêu đề"
                                    value={form.title}
                                    name="title"
                                    onChange={handleChange}
                                />
                                <br />
                                <Label>Nội dung</Label>
                                <textarea name="content"
                                    rows={4}
                                    onChange={handleChange}
                                    value={form.content || ""}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nội dung ở đây ...">
                                </textarea>
                                <br />
                                <Label>Ghi chú</Label>
                                <textarea name="note"
                                    rows={4}
                                    onChange={handleChange}
                                    value={form.note || ""}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nội dung ở đây ...">
                                </textarea>
                                <br />
                                <Label>Loại thư</Label>
                                <select
                                    name="type_message"
                                    className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                                    value={form.type_message}
                                    onChange={(e) => handleChange(e)}
                                >
                                    <option value="">-- Chọn sản phẩm --</option>

                                    {Object.entries(information.type_message).map(([key, label]) => (
                                        <option key={key} value={key} selected={form.type_message === key}>{label}</option>
                                    ))}
                                </select>
                            </>

                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Đóng
                            </Button>
                            <Button size="sm" type="submit">
                                {loading ? 'Đang xử lý...' : 'Lưu thông tin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
