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
import ipWhitelistServices from '@/services/ipWhitelistServices';
import { useAuth } from "@/context/AuthContext";
import { getSiteSystem } from "@/utils/storage";

const initialForm = {
    ip: '',
    note: '',
    site: getSiteSystem(),
    createdBy: '',
    updatedBy: ''
};

interface IpItem {
    _id: string;
    ip: string;
    createdBy: string;
    note?: string;
}

export default function IpWhiteList() {
    const [userWhitelistIp, setUserWhitelistIp] = useState<IpItem[]>([]);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const { user } = useAuth();
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [data, setData] = useState<IpItem[]>([]);
    const [filters, setFilters] = useState({
        ip: '',
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
            form.createdBy = user?.username ?? "Admin";

            if (modalType === "add") {
                res = await ipWhitelistServices.postIpWhitelist(form);
                if (res.status_code == 200) {
                    closeModal();
                    fetchIpWhiteList();
                } else {
                    toast.error(res.data.message)
                }
            } else if (modalType === "update") {
                form.updatedBy = user?.username ?? "Admin";
                res = await ipWhitelistServices.changeIpWhitelist(form, editId);

                if (res.status_code == 200) {
                    closeModal();
                    fetchIpWhiteList();
                } else {
                    toast.error(res.data.message)
                }
            }

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const deleteIP = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await ipWhitelistServices.deleteIpWhitelist(id);
            fetchIpWhiteList();
        } catch (err) {
            setError('Xóa người dùng thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const fetchIpWhiteList = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const IpWhiteListData = await ipWhitelistServices.getIpWhitelist(params);
            setUserWhitelistIp(IpWhiteListData.data);
        } catch (err) {
            console.log("Danh sách IP bị lỗi !");
        }
    };

    
    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    useEffect(() => {
        fetchIpWhiteList();
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
                        Thêm IP WhiteList
                    </button>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Địa chỉ IP", "Người tạo", "Ghi chú", "Hành Động"].map((header, idx) => (
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
                                {userWhitelistIp.map((ip, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{ip.ip}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{ip.createdBy}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{ip.note}</TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditId(ip._id);
                                                        openModal("update");
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Sửa thông tin
                                                </button>
                                                <button
                                                    onClick={() => deleteIP(ip._id)}
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
                            {modalType === "add" ? "Tạo Whitelist IP" : "Thay đổi thông tin Whitelist IP"}
                        </h4>
                    </div>

                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <Label>IP</Label>
                            <Input
                                type="text"
                                placeholder="Nhập IP (1.1.1.1)"
                                value={form.ip}
                                name="ip"
                                onChange={handleChange}
                            />
                            <br />

                            <Label>Ghi Chú</Label>
                            <div className="relative">
                                <textarea name="note"
                                    id="note"
                                    rows={4}
                                    onChange={handleChange}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Chú thích ở đây ...">
                                </textarea>
                            </div>
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
