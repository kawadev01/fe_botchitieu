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
import userServices from '@/services/userServices';
import { getSiteSystem } from "@/utils/storage";
import { information } from '@/utils/info.const';
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";

const initialForm = {
    username: '',
    password: '',
    oldPassword: '',
    status: true,
    site: getSiteSystem(),
    createdBy: '',
    updatedBy: ''
};

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
    const [currentPage, setCurrentPage] = useState(1);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        username: '',
        page: 1,
        pageSize: 50,
    });
    const [totalItems, setTotalItems] = useState(1)
    const totalPages = Math.ceil(totalItems / filters.pageSize);

    const startIndex = (currentPage - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const pagedData = data.slice(startIndex, endIndex);

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
                res = await userServices.postUser(form);
                if (res.status_code == 200) {
                    closeModal();
                    fetchUsers();
                } else {
                    setError(res.message)
                }
            } else if (modalType?.trim() === "changePass") {
                res = await userServices.changePasswordUser(form, editUserId);

                if (res.status_code == 200) {
                    closeModal();
                    fetchUsers();
                } else {
                    setError(res.message)
                }
            }

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const updateUserStatus = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await userServices.changeUserStatus(id);

            fetchUsers();
        } catch (err) {
            setError('Cập nhật trang thái thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (id: string, role: string) => {
        setError('');
        setLoading(true);

        try {
            await userServices.changeUserRole(id, role);

            fetchUsers();
        } catch (err) {
            setError('Cập nhật trang thái thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            const res = await userServices.deleteUser(id);
            toast.success(res.message);
            fetchUsers();
        } catch (err) {
            setError('Xóa người dùng thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSearch = async () => {
        const { username, page, pageSize } = filters;

        const params = {
            ...(username && { username }),
            page,
            pageSize,
            site: getSiteSystem()
        };

        await fetchUsers(params);
    }

    const fetchUsers = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const usersData = await userServices.getUser(params);
            setData(usersData.users);
            setTotalItems(usersData.total);
        } catch (err) {
            console.log("Danh sách người dùng bị lỗi !");
        }
    };

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    useEffect(() => {
        handleSearch();
    }, [filters.page, filters.pageSize, filters.username]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="m-5 flex justify-between">
                    <div className="flex items-center max-w-sm">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                                </svg>
                            </div>
                            <input
                                value={filters.username}
                                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                                type="text" id="simple-search"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search username..." required />
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); handleSearch(); }}
                            type="submit" className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                            <span className="sr-only">Search</span>
                        </button>
                    </div>

                    <button
                        onClick={() => openModal("add")}
                        type="button"
                        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                        Thêm User
                    </button>
                </div>

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
                                {pagedData.map((user, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{(currentPage - 1) * totalItems + index + 1}</TableCell>
                                        {/* <TableCell>34</TableCell> */}
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.username}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.site}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                            <select
                                                name="role"
                                                className={`h-11 w-auto appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400`}
                                                value={user.role}
                                                onChange={(e) => updateRole(user._id, e.target.value)}
                                            >
                                                <option value="">-- Phân quyền --</option>
                                                {Object.entries(information.role).map(([key, label]) => (
                                                    <option key={key} value={key}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                                            {user.status ? "Hoạt động" : "Tạm ngừng"} <br />
                                            <button
                                                onClick={() => updateUserStatus(user._id)}
                                                type="button"
                                                className="focus:outline-none text-white bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                                            >
                                                Update
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
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Đổi mật khẩu
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user._id)}
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
                        <div className="flex items-center justify-between p-5">
                            <select
                                name="pageSize"
                                value={filters.pageSize}
                                onChange={(e) => {
                                    const newPageSize = Number(e.target.value);
                                    setFilters((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
                                }}
                                className="h-10 w-30 appearance-none rounded-lg border border-gray-300 px-4 py-1"
                            >
                                <option value="10">10 / page</option>
                                <option value="20">20 / page</option>
                                <option value="50">50 / page</option>
                                <option value="100">100 / page</option>
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
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            {modalType === "add" && (
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
                                </>
                            )}

                            {modalType === "changePass" && (
                                <>
                                    <Label>Mật khẩu cũ</Label>
                                    <Input
                                        type="text"
                                        placeholder="Mật khẩu cũ"
                                        value={form.oldPassword}
                                        name="oldPassword"
                                        onChange={handleChange}
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
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute z-30 cursor-pointer right-4 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />}
                                </span>
                            </div>
                            <br />


                            {/* {modalType === "add" && (
                                <>
                                    <Label>
                                        System <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <div className="relative">
                                        <select
                                            name="site"
                                            className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                                            value={form.site ?? ""}
                                            onChange={(e) => handleChange(e)}
                                        >
                                            <option value="">-- Chọn hệ thống --</option>
                                            {Object.entries(information.system).map(([key, label]) => (
                                                <option key={key} value={label}>
                                                    {label}
                                                </option>
                                            ))}

                                        </select>
                                    </div>
                                </>
                            )} */}

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
