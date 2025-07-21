import React, { useState, useEffect, useCallback } from "react";
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
import userServices from '@/services/userServices';
import { getSiteSystem } from "@/utils/storage";
import { information } from '@/utils/info.const';
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";

// Initial form state for adding/editing users
const initialForm = {
    username: '',
    password: '',
    oldPassword: '',
    role: 'user', // Default role for new user
    status: true,
    site: getSiteSystem(),
};

// User data type based on API response
type UserType = {
    _id: string;
    username: string;
    site: string;
    role: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
};

export default function UserTable() {
    const [data, setData] = useState<UserType[]>([]);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);

    // State for search input to avoid re-fetching on every keystroke
    const [usernameInput, setUsernameInput] = useState('');

    // Filters state aligned with API query params
    const [filters, setFilters] = useState({
        username: '',
        role: '',
        status: '',
        page: 1,
        limit: 10,
    });

    // Pagination state from API metadata
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Reset error message when modal opens
    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen]);

    // Fetch users data from API based on filters
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                page: filters.page,
                limit: filters.limit,
                site: getSiteSystem(),
            };
            if (filters.username) params.username = filters.username;
            if (filters.role) params.role = filters.role;
            if (filters.status !== '') params.status = filters.status;

            const res = await userServices.getUser(params);

            if (res.success && res.data) {
                setData(res.data.data);
                setTotalItems(res.data.meta.total);
                setTotalPages(res.data.meta.totalPages);
            } else {
                toast.error(res.message || "Lấy danh sách người dùng thất bại.");
                setData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (err) {
            toast.error("Lấy danh sách người dùng bị lỗi!");
            console.error("Fetch users error:", err);
            setData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Re-fetch users when filters change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle create or change password
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (modalType === "add") {
                const { username, password, site, role, status } = form;
                const payload = { username, password, site, role, status };
                res = await userServices.postUser(payload);
                if (res.success) {
                    toast.success("Tạo người dùng thành công!");
                    closeModal();
                    fetchUsers();
                } else {
                    setError(res.message || 'Tạo người dùng thất bại.');
                }
            } else if (modalType?.trim() === "changePass") {
                const { oldPassword, password } = form;
                res = await userServices.changePasswordUser({ oldPassword, password }, editUserId);
                if (res.success) {
                    toast.success("Đổi mật khẩu thành công!");
                    closeModal();
                } else {
                    setError(res.message || 'Đổi mật khẩu thất bại.');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    // Generic function to update user details (role, status)
    const handleUpdateUser = async (userId: string, updateData: { role?: string; status?: boolean }) => {
        try {
            const res = await userServices.updateUser(userId, updateData);
            if (res.success) {
                toast.success("Cập nhật người dùng thành công!");
                setData(prevData =>
                    prevData.map(user => (user._id === userId ? res.data : user))
                );
            } else {
                toast.error(res.message || "Cập nhật thất bại.");
            }
        } catch (err) {
            toast.error("Cập nhật người dùng thất bại.");
            console.error("Update user error:", err);
            fetchUsers();
        }
    };

    // Delete a user
    const deleteUser = async (id: string) => {
        setLoading(true);
        try {
            const res = await userServices.deleteUser(id);
            if (res.success) {
                toast.success("Xóa người dùng thành công.");
                fetchUsers();
            } else {
                toast.error(res.message || 'Xóa người dùng thất bại.');
            }
        } catch (err) {
            toast.error('Xóa người dùng thất bại.');
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, username: usernameInput, page: 1 }));
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                {/* Filters and Actions */}
                <div className="m-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm theo username..."
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                        </div>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                            className="h-11 appearance-none rounded-lg border border-gray-300 px-4"
                        >
                            <option value="">Tất cả vai trò</option>
                            {Object.entries(information.role).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="h-11 appearance-none rounded-lg border border-gray-300 px-4"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Hoạt động</option>
                            <option value="false">Tạm ngừng</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="p-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    <button
                        onClick={() => openModal("add")}
                        type="button"
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Thêm User
                    </button>
                </div>

                {/* Table */}
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Tên tài khoản", "Hệ thống", "Vai trò", "Trạng thái", "Ngày tạo", "Ngày cập nhật", "Hành Động"].map((header, idx) => (
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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10">Đang tải dữ liệu...</TableCell>
                                    </TableRow>
                                ) : data.length > 0 ? (
                                    data.map((user, index) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="px-5 py-4 sm:px-6 text-start">{(filters.page - 1) * filters.limit + index + 1}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.username}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.site}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <select
                                                    name="role"
                                                    className={`h-11 w-auto appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400`}
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUser(user._id, { role: e.target.value })}
                                                >
                                                    {Object.entries(information.role).map(([key, label]) => (
                                                        <option key={key} value={key}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                                                <p>{user.status ? "Hoạt động" : "Tạm ngừng"}</p>
                                                <button
                                                    onClick={() => handleUpdateUser(user._id, { status: !user.status })}
                                                    type="button"
                                                    className={`focus:outline-none text-white font-medium rounded-lg text-sm px-4 py-2 mt-2 ${user.status ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-700 hover:bg-green-800'}`}
                                                >
                                                    {user.status ? "Vô hiệu hóa" : "Kích hoạt"}
                                                </button>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTimeVN(user.createdAt)}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDateTimeVN(user.updatedAt)}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditUserId(user._id);
                                                            openModal("changePass");
                                                        }}
                                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                    >
                                                        Đổi mật khẩu
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        type="button"
                                                        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10">Không tìm thấy dữ liệu.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between p-5">
                            <select
                                name="limit"
                                value={filters.limit}
                                onChange={(e) => {
                                    setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                                }}
                                className="h-10 w-30 appearance-none rounded-lg border border-gray-300 px-4 py-1"
                            >
                                <option value="10">10 / trang</option>
                                <option value="20">20 / trang</option>
                                <option value="50">50 / trang</option>
                                <option value="100">100 / trang</option>
                            </select>

                            <Pagination
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={(page: number) =>
                                    setFilters((prev) => ({ ...prev, page }))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {modalType === "add" ? "Tạo người dùng mới" : "Đổi mật khẩu"}
                        </h4>
                    </div>

                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-auto max-h-[450px] overflow-y-auto px-2 pb-3">
                            {modalType === "add" && (
                                <>
                                    <Label>Tên tài khoản</Label>
                                    <Input
                                        type="text"
                                        placeholder="Tên tài khoản"
                                        value={form.username}
                                        name="username"
                                        onChange={handleChange}
                                        required
                                    />
                                    <br />
                                    <Label>Vai trò</Label>
                                    <select
                                        name="role"
                                        className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                                        value={form.role}
                                        onChange={handleChange}
                                    >
                                        {Object.entries(information.role).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <br />
                                </>
                            )}

                            {modalType === "changePass" && (
                                <>
                                    <Label>Mật khẩu cũ</Label>
                                    <Input
                                        type="password"
                                        placeholder="Mật khẩu cũ"
                                        value={form.oldPassword}
                                        name="oldPassword"
                                        onChange={handleChange}
                                        required
                                    />
                                    <br />
                                </>
                            )}

                            <Label>{modalType === "add" ? "Mật khẩu" : "Mật khẩu mới"}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={modalType === "add" ? "Mật khẩu" : "Mật khẩu mới"}
                                    value={form.password}
                                    name="password"
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute z-30 cursor-pointer right-4 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                                </span>
                            </div>
                            <br />

                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={handleCloseModal}>
                                Đóng
                            </Button>
                            <Button size="sm" type="submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Lưu thông tin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
