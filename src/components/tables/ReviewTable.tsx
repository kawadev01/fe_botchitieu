import React, { useState, useEffect } from "react";
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
import reviewServices from '@/services/reviewServices';
import TextArea from "../form/input/TextArea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { getSiteSystem } from "@/utils/storage";
import { formatDateTimeVN } from "@/utils/formatDateTime";

const initialForm = {
    username: '',
    display_name: '',
    avatar: '',
    content: '',
    location: 0,
    status: true,
    site: getSiteSystem(),
    created_by: '',
    updated_by: ''
};

interface Review {
    _id: string;
    username: string;
    content: string;
    status: boolean;
    location: number;
    createdAt: string;
    updatedAt: string;
}

export default function ReviewTable() {
    const [data, setData] = useState<Review[]>([]);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editReviewId, setEditReviewId] = useState<string | null>(null);
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
            form.created_by = user?.username ?? "Admin";
            form.site = getSiteSystem();

            if (modalType === "add") {
                res = await reviewServices.postReview(form);
                if (res.status_code == 200) {
                    closeModal();
                    fetchReviews();
                } else {
                    toast.error(res.message);
                }
            } else if (modalType === "update") {
                form.updated_by = user?.username ?? "Admin";
                res = await reviewServices.updateReview(form, editReviewId);

                if (res.status_code == 200) {
                    closeModal();
                    fetchReviews();
                } else {
                    toast.error(res.message)
                }
            }

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await reviewServices.delete(id);
            fetchReviews();
        } catch (err) {
            setError('Xóa bình luận thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;
        const checked = 'checked' in target ? (target as HTMLInputElement).checked : undefined;
        let newValue: string | boolean | number = value;

        if (name === 'status') {
            newValue = type === 'checkbox' ? !!checked : value === 'true';
        } else if (name === 'location') {
            newValue = parseInt(value);
        }

        setForm((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const fetchReviews = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const review = await reviewServices.getAll(params);
            setData(review.data);
            setCurrentPage(review.page);
            setItemsPerPage(review.total);
        } catch (err) {
            console.log("Danh sách lỗi !");
        }
    };

    const fetchReviewId = async (id: string) => {
        try {
            const reviews = await reviewServices.getById(id);

            setForm(prev => ({
                ...prev,
                ...reviews.data,
                updated_by: user?.username
            }));

            setTimeout(() => openModal("update"), 200);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Lỗi lấy dữ liệu review";
            toast.error(message);
        }
    }

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    useEffect(() => {
        if (editReviewId) {
            fetchReviewId(editReviewId);
        }
    }, [editReviewId]);

    useEffect(() => {
        fetchReviews();
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
                        Thêm bình luận
                    </button>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Tên tài khoản", "Nội dung", "Trạng thái", "Vị trí", "Ngày tạo", "Ngày cập nhật", "Hành Động"].map((header, idx) => (
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
                                {data.map((review, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{review.username}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{review.content}</TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400 text-center text-white">
                                            {review.status ? (<div className="bg-green-600"> Hiển thị</div>) : (<div className="bg-red-500">Tạm ẩn</div>)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{review.location}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTimeVN(review.createdAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDateTimeVN(review.updatedAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditReviewId(review._id);
                                                        fetchReviewId(review._id);
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => deleteReview(review._id)}
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
                            {modalType === "add" ? "Tạo bình luận mới" : "Sửa đổi bình luận"}
                        </h4>
                    </div>

                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <>
                                <Label>Tên tài khoản</Label>
                                <Input
                                    type="text"
                                    placeholder="Tên tài khoản"
                                    value={form.username}
                                    name="username"
                                    onChange={handleChange}
                                />
                                <br />
                                <Label>Tên hiển thị</Label>
                                <Input
                                    type="text"
                                    placeholder="Tên hiển thị"
                                    value={form.display_name}
                                    name="display_name"
                                    onChange={handleChange}
                                />
                                <br />

                                <Label>Link Avatar</Label>
                                <Input
                                    type="text"
                                    placeholder="Link Avatar"
                                    value={form.avatar}
                                    name="avatar"
                                    onChange={handleChange}
                                />
                                <br />
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={form.status}
                                        onChange={handleChange}
                                        className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ẩn/Hiện</span>
                                </label>
                                <br />

                                <Label>Nội dung</Label>
                                <textarea name="content"
                                    rows={4}
                                    value={form.content || ""}
                                    onChange={handleChange}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Nội dung ở đây ...">
                                </textarea>
                                <br />
                                <Label>Vị trí</Label>
                                <Input
                                    type="number"
                                    placeholder="Chọn vị trí ưu tiên"
                                    value={form.location}
                                    name="location"
                                    onChange={handleChange}
                                />
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
