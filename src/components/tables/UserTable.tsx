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

// Skeleton loader component
const TableSkeleton = () => (
    <>
        {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
                <TableCell className="px-5 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16 mx-auto"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                </TableCell>
            </TableRow>
        ))}
    </>
);

// Status Badge Component
const StatusBadge = ({ status, onClick, loading }: { status: boolean; onClick: () => void; loading?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {status ? "Hoạt động" : "Tạm ngừng"}
        </span>
        <button
            onClick={onClick}
            disabled={loading}
            type="button"
            className={`text-xs font-medium rounded-md px-3 py-1.5 transition-colors duration-200 ${
                status 
                    ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30' 
                    : 'text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
        >
            {loading ? '...' : (status ? "Vô hiệu hóa" : "Kích hoạt")}
        </button>
    </div>
);

// Action Buttons Component
const ActionButtons = ({ onChangePassword, onDelete, loading }: { 
    onChangePassword: () => void; 
    onDelete: () => void; 
    loading?: boolean;
}) => (
    <div className="flex justify-center gap-2">
        <button
            onClick={onChangePassword}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
        >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7ZM10 11C7.79086 11 6 12.7909 6 15H14C14 12.7909 12.2091 11 10 11Z" clipRule="evenodd"/>
            </svg>
            Đổi MK
        </button>
        <button
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
        >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.707 7.293C8.31648 6.90248 7.68352 6.90248 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68352 13.0975 8.31648 13.0975 8.707 12.7071L10 11.4142L11.293 12.7071C11.6835 13.0975 12.3165 13.0975 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3165 6.90248 11.6835 6.90248 11.293 7.29289L10 8.58579L8.707 7.293Z" clipRule="evenodd"/>
            </svg>
            Xóa
        </button>
    </div>
);

export default function UserTable() {
    const [data, setData] = useState<UserType[]>([]);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);

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
        setUpdateLoading(userId);
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
        } finally {
            setUpdateLoading(null);
        }
    };

    // Delete a user
    const deleteUser = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
        
        setUpdateLoading(id);
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
            setUpdateLoading(null);
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

    const clearFilters = () => {
        setUsernameInput('');
        setFilters({
            username: '',
            role: '',
            status: '',
            page: 1,
            limit: filters.limit,
        });
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
                {/* Header Section với thống kê */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Quản lý người dùng
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tổng cộng {totalItems} người dùng
                            </p>
                        </div>
                        <button
                            onClick={() => openModal("add")}
                            type="button"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5C10.5523 5 11 5.44772 11 6V9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H11V14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14V11H6C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9H9V6C9 5.44772 9.44772 5 10 5Z" clipRule="evenodd"/>
                            </svg>
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Nhập tên tài khoản..."
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.9 14.32C11.66 15.41 9.99 16 8.25 16C3.69 16 0 12.31 0 7.75S3.69 -0.5 8.25 -0.5S16.5 3.19 16.5 7.75C16.5 9.49 15.91 11.16 14.82 12.4L19.78 17.36C20.17 17.75 20.17 18.38 19.78 18.77C19.39 19.16 18.76 19.16 18.37 18.77L12.9 14.32ZM8.25 2C4.93 2 2.25 4.68 2.25 8S4.93 14 8.25 14S14.25 11.32 14.25 8S11.57 2 8.25 2Z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Vai trò
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tất cả vai trò</option>
                                {Object.entries(information.role).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="true">Hoạt động</option>
                                <option value="false">Tạm ngừng</option>
                            </select>
                        </div>
                        
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                Tìm kiếm
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                                <TableRow>
                                    {[
                                        { key: "stt", label: "STT", width: "w-16" },
                                        { key: "username", label: "Tên tài khoản", width: "min-w-32" },
                                        { key: "site", label: "Hệ thống", width: "min-w-20" },
                                        { key: "role", label: "Vai trò", width: "min-w-32" },
                                        { key: "status", label: "Trạng thái", width: "min-w-32" },
                                        { key: "created", label: "Ngày tạo", width: "min-w-28" },
                                        { key: "updated", label: "Cập nhật", width: "min-w-28" },
                                        { key: "actions", label: "Thao tác", width: "min-w-36" }
                                    ].map((header) => (
                                        <TableCell
                                            key={header.key}
                                            isHeader
                                            className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400 ${header.width} ${header.key === "actions" ? "text-center" : ""}`}
                                        >
                                            {header.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="bg-white divide-y divide-gray-100 dark:bg-transparent dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableSkeleton />
                                ) : data.length > 0 ? (
                                    data.map((user, index) => (
                                        <TableRow 
                                            key={user._id}
                                            className="hover:bg-gray-50/50 transition-colors duration-150 dark:hover:bg-white/[0.02]"
                                        >
                                            <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {(filters.page - 1) * filters.limit + index + 1}
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ID: {user._id.slice(-6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                    {user.site}
                                                </span>
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4">
                                                <select
                                                    name="role"
                                                    className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUser(user._id, { role: e.target.value })}
                                                    disabled={updateLoading === user._id}
                                                >
                                                    {Object.entries(information.role).map(([key, label]) => (
                                                        <option key={key} value={key}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4">
                                                <StatusBadge 
                                                    status={user.status}
                                                    loading={updateLoading === user._id}
                                                    onClick={() => handleUpdateUser(user._id, { status: !user.status })}
                                                />
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="text-sm">
                                                    {formatDateTimeVN(user.createdAt)}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="text-sm">
                                                    {formatDateTimeVN(user.updatedAt)}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-6 py-4">
                                                <ActionButtons
                                                    loading={updateLoading === user._id}
                                                    onChangePassword={() => {
                                                        setEditUserId(user._id);
                                                        openModal("changePass");
                                                    }}
                                                    onDelete={() => deleteUser(user._id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                </svg>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                    Không tìm thấy người dùng
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Thử thay đổi bộ lọc hoặc tạo người dùng mới
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && data.length > 0 && (
                    <div className="bg-white px-6 py-4 border-t border-gray-100 dark:bg-transparent dark:border-white/[0.05]">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Hiển thị</span>
                                <select
                                    name="limit"
                                    value={filters.limit}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    trong tổng số {totalItems} kết quả
                                </span>
                            </div>

                            <Pagination
                                currentPage={filters.page}
                                totalPages={totalPages}
                                onPageChange={(page: number) =>
                                    setFilters((prev) => ({ ...prev, page }))
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[600px] m-4">
                <div className="relative w-full max-w-[600px] bg-white rounded-2xl shadow-xl dark:bg-gray-900">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {modalType === "add" ? "Tạo người dùng mới" : "Đổi mật khẩu"}
                        </h3>
                        <button
                            onClick={handleCloseModal}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleSave}>
                        <div className="p-6 space-y-6">
                            {modalType === "add" && (
                                <>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tên tài khoản
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập tên tài khoản"
                                            value={form.username}
                                            name="username"
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Vai trò
                                        </Label>
                                        <select
                                            name="role"
                                            className="mt-1 w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={form.role}
                                            onChange={handleChange}
                                        >
                                            {Object.entries(information.role).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {modalType === "changePass" && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mật khẩu cũ
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Nhập mật khẩu hiện tại"
                                        value={form.oldPassword}
                                        name="oldPassword"
                                        onChange={handleChange}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {modalType === "add" ? "Mật khẩu" : "Mật khẩu mới"}
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={modalType === "add" ? "Nhập mật khẩu" : "Nhập mật khẩu mới"}
                                        value={form.password}
                                        name="password"
                                        onChange={handleChange}
                                        required
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeCloseIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={handleCloseModal}
                                className="px-4 py-2"
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    modalType === "add" ? "Tạo người dùng" : "Cập nhật mật khẩu"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
