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
import Switch from "../form/switch/Switch";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import userServices from '@/services/userServices';
import { getSiteSystem } from "@/utils/storage";
import { information } from '@/utils/info.const';
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";
import { 
    UserStatus, 
    UserRole, 
    User, 
    getStatusLabel, 
    isActiveStatus, 
    toggleStatus 
} from "@/types/user";

// Initial form state for adding/editing users
const initialForm = {
    username: '',
    password: '',
    oldPassword: '',
    role: 'user', // Default role for new user
    status: UserStatus.ACTIVE, // Default status for new user
    site: getSiteSystem(),
};

// User data type based on API response (use the imported User type)
type UserType = User;

// Enhanced Skeleton loader component
const TableSkeleton = () => (
    <>
        {[...Array(8)].map((_, index) => (
            <TableRow key={index} className="animate-pulse">
                <TableCell className="px-6 py-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-shimmer"></div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-24"></div>
                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-28"></div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex justify-center">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer w-16"></div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-20"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-20"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-shimmer w-16"></div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-20"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-shimmer w-16"></div>
                    </div>
                </TableCell>
            </TableRow>
        ))}
    </>
);

// Enhanced Status Badge Component
const StatusBadge = ({ status, isLoading = false }: { status: string; isLoading?: boolean }) => {
    const isActive = isActiveStatus(status);
    return (
        <div className="flex items-center justify-center">
            <span className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                ${isActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                    : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }
                ${isLoading ? 'opacity-50' : ''}
            `}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-emerald-500' : 'bg-red-500'} ${isLoading ? 'animate-pulse' : ''}`}></div>
                {getStatusLabel(status)}
            </span>
        </div>
    );
};

// Enhanced Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
        }
    };

    return (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${getRoleColor(role)}`}>
            {information.role[role as keyof typeof information.role]}
        </span>
    );
};

// Enhanced Action Buttons Component
const ActionButtons = ({ onChangePassword, onDelete, loading }: { 
    onChangePassword: () => void; 
    onDelete: () => void; 
    loading?: boolean;
}) => (
    <div className="flex justify-center gap-2">
        <button
            onClick={onChangePassword}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            <svg className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/>
            </svg>
            Đổi MK
        </button>
        <button
            onClick={onDelete}
            disabled={loading}
            className="group inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 transform hover:scale-105 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            <svg className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-12 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
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

    // Handle status change specifically
    const handleStatusChange = async (userId: string, newStatus: string) => {
        const user = data.find(u => u._id === userId);
        if (!user) return;

        // Don't make API call if status is the same
        if (user.status === newStatus) return;

        await handleUpdateUser(userId, { status: newStatus });
    };

    // Handle role change specifically  
    const handleRoleChange = async (userId: string, newRole: string) => {
        const user = data.find(u => u._id === userId);
        if (!user) return;

        // Don't make API call if role is the same
        if (user.role === newRole) return;

        await handleUpdateUser(userId, { role: newRole });
    };

    // Generic function to update user details (role, status)
    const handleUpdateUser = async (userId: string, updateData: { role?: string; status?: string }) => {
        setUpdateLoading(userId);
        
        // Get current user data for rollback if needed
        const currentUser = data.find(user => user._id === userId);
        if (!currentUser) return;

        // Optimistic update - update UI immediately
        setData(prevData =>
            prevData.map(user => 
                user._id === userId 
                    ? { ...user, ...updateData } 
                    : user
            )
        );

        try {
            const res = await userServices.updateUser(userId, updateData);
            if (res.success) {
                // Update with server response data
                setData(prevData =>
                    prevData.map(user => (user._id === userId ? res.data : user))
                );
                
                // Show success message based on update type
                const updateType = updateData.status !== undefined ? 'trạng thái' : 'vai trò';
                toast.success(`Cập nhật ${updateType} thành công!`);
            } else {
                // Rollback to original state on failure
                setData(prevData =>
                    prevData.map(user => (user._id === userId ? currentUser : user))
                );
                toast.error(res.message || "Cập nhật thất bại.");
            }
        } catch (err: any) {
            // Rollback to original state on error
            setData(prevData =>
                prevData.map(user => (user._id === userId ? currentUser : user))
            );
            
            const errorMessage = err.response?.data?.message || "Cập nhật người dùng thất bại.";
            toast.error(errorMessage);
            console.error("Update user error:", err);
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
            {/* Enhanced Container */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-2xl shadow-gray-500/10 dark:border-white/[0.08] dark:bg-gray-900/50 dark:shadow-black/20 backdrop-blur-sm">
                {/* Enhanced Header Section */}
                <div className="relative border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 px-8 py-6 dark:border-white/[0.08] dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                                    Quản lý người dùng
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Tổng cộng <span className="font-semibold text-blue-600 dark:text-blue-400">{totalItems}</span> người dùng
                                </p>
                                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal("add")}
                            type="button"
                            className="group inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 border border-transparent rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5C10.5523 5 11 5.44772 11 6V9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H11V14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14V11H6C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9H9V6C9 5.44772 9.44772 5 10 5Z" clipRule="evenodd"/>
                            </svg>
                            Thêm người dùng mới
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Enhanced Filters and Search */}
                <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/30 to-transparent dark:border-white/[0.08] dark:from-gray-800/20">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                                    </svg>
                                    Tìm kiếm
                                </span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Nhập tên tài khoản để tìm kiếm..."
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-12 pr-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Vai trò
                                </span>
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                                className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tất cả vai trò</option>
                                {Object.entries(information.role).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    Trạng thái
                                </span>
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 dark:bg-gray-800/80 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value={UserStatus.ACTIVE}>{getStatusLabel(UserStatus.ACTIVE)}</option>
                                <option value={UserStatus.INACTIVE}>{getStatusLabel(UserStatus.INACTIVE)}</option>
                            </select>
                        </div>
                        
                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleSearch}
                                className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Tìm kiếm
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Table */}
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        <Table>
                            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm">
                                <TableRow>
                                    {[
                                        { key: "stt", label: "STT", width: "w-20" },
                                        { key: "username", label: "Thông tin tài khoản", width: "min-w-48" },
                                        { key: "role", label: "Vai trò", width: "min-w-32" },
                                        { key: "status", label: "Trạng thái", width: "min-w-36" },
                                        { key: "created", label: "Ngày tạo", width: "min-w-32" },
                                        { key: "updated", label: "Cập nhật", width: "min-w-32" },
                                        { key: "actions", label: "Thao tác", width: "min-w-40" }
                                    ].map((header) => (
                                        <TableCell
                                            key={header.key}
                                            isHeader
                                            className={`px-8 py-5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider dark:text-gray-300 ${header.width}`}
                                        >
                                            {header.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="bg-white divide-y divide-gray-100/60 dark:bg-transparent dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableSkeleton />
                                ) : data.length > 0 ? (
                                    data.map((user, index) => (
                                        <TableRow 
                                            key={user._id}
                                            className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-300 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10"
                                        >
                                            <TableCell className="px-8 py-6 text-sm font-bold text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-center">
                                                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {(filters.page - 1) * filters.limit + index + 1}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <span className="text-white font-bold text-lg">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            ID: {user._id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <select
                                                        name="role"
                                                        className="text-sm border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        disabled={updateLoading === user._id}
                                                    >
                                                        {Object.entries(information.role).map(([key, label]) => (
                                                            <option key={key} value={key}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
                                                <div className="flex justify-center items-center gap-3">
                                                    <Switch
                                                        label={getStatusLabel(user.status)}
                                                        checked={isActiveStatus(user.status)}
                                                        disabled={updateLoading === user._id}
                                                        onChange={(checked) => handleStatusChange(user._id, checked ? UserStatus.ACTIVE : UserStatus.INACTIVE)}
                                                        color="blue"
                                                    />
                                                    {updateLoading === user._id && (
                                                        <div className="flex items-center">
                                                            <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">
                                                        {formatDateTimeVN(user.createdAt)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">
                                                        {formatDateTimeVN(user.updatedAt)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="px-8 py-6">
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
                                        <TableCell colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-6">
                                                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center dark:from-gray-800 dark:to-gray-700">
                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                    </svg>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Không tìm thấy người dùng
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                                        Không có người dùng nào phù hợp với tiêu chí tìm kiếm. Hãy thử thay đổi bộ lọc hoặc tạo người dùng mới.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => openModal("add")}
                                                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                                >
                                                    Tạo người dùng đầu tiên
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Enhanced Pagination */}
                {!loading && data.length > 0 && (
                    <div className="bg-gradient-to-r from-white to-gray-50/50 px-8 py-6 border-t border-gray-200/60 dark:from-gray-900/50 dark:to-gray-800/30 dark:border-white/[0.08] backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Hiển thị</span>
                                <select
                                    name="limit"
                                    value={filters.limit}
                                    onChange={(e) => {
                                        setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                                    }}
                                    className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    trong tổng số <span className="font-semibold text-blue-600 dark:text-blue-400">{totalItems}</span> kết quả
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

            {/* Enhanced Modal Form */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
                <div className="relative w-full max-w-[700px] bg-white rounded-3xl shadow-2xl dark:bg-gray-900 backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.08]">
                    {/* Enhanced Modal Header */}
                    <div className="flex items-center justify-between p-8 border-b border-gray-200/60 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {modalType === "add" ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h.01M9 5a2 2 0 00-2 2v.01M9 5a2 2 0 012-2 2 2 0 012 2m-2 4a2 2 0 00-2 2v.01m2-4.01V9a2 2 0 012-2 2 2 0 012 2v.01M9 9.01V9a2 2 0 012-2 2 2 0 012 2v.01" />
                                    )}
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modalType === "add" ? "Tạo người dùng mới" : "Đổi mật khẩu"}
                            </h3>
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Enhanced Modal Body */}
                    <form onSubmit={handleSave}>
                        <div className="p-8 space-y-8">
                            {modalType === "add" && (
                                <>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                            </svg>
                                            Tên tài khoản
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập tên tài khoản"
                                            value={form.username}
                                            name="username"
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            Vai trò
                                        </Label>
                                        <select
                                            name="role"
                                            className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                        </svg>
                                        Mật khẩu cũ
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Nhập mật khẩu hiện tại"
                                        value={form.oldPassword}
                                        name="oldPassword"
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                    </svg>
                                    {modalType === "add" ? "Mật khẩu" : "Mật khẩu mới"}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={modalType === "add" ? "Nhập mật khẩu" : "Nhập mật khẩu mới"}
                                        value={form.password}
                                        name="password"
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 rounded-xl p-4 shadow-lg dark:from-red-900/20 dark:to-red-800/10 dark:border-red-800">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                        </svg>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Modal Footer */}
                        <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-200/60 dark:border-gray-700 bg-gradient-to-r from-gray-50/30 to-transparent dark:from-gray-800/20">
                            <Button 
                                type="button"
                                variant="outline" 
                                onClick={handleCloseModal}
                                className="px-6 py-3 text-sm font-semibold border-2 rounded-xl transition-all duration-200 hover:scale-105"
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200px 100%;
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </>
    );
}
