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
import Label from "../form/Label";
import sessionPointServices from '@/services/sessionPointServices';
import { useAuth } from "@/context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getSiteSystem } from "@/utils/storage";
import { formatDateTimeVN, toVietnamDate } from "@/utils/formatDateTime";
import Switch from "../form/switch/Switch";

interface SessionPoint {
    _id: string;
    start_timestamp: number;
    end_timestamp: number;
    status: boolean,
    created_by: string;
    updated_by: string;
}

interface FormState {
    site: string | null;
    start_timestamp: number;
    end_timestamp: number;
    status: boolean,
    created_by: string;
    updated_by: string;
}

const initialForm: FormState = {
    site: getSiteSystem(),
    start_timestamp: 0,
    end_timestamp: 0,
    status: true,
    created_by: '',
    updated_by: '',
};

export default function SesstionsPointTable() {
    const [data, setData] = useState<SessionPoint[]>([]);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [form, setForm] = useState<FormState>(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editSessionId, setEditSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen, modalType]);

    const handleSave = async () => {
        setError('');
        setLoading(true);

        try {
            let res;
            if (modalType === "add") {
                form.created_by = user?.username || "Admin";
                res = await sessionPointServices.postSession(form);
                if (res.status_code === 200) {

                    closeModal();
                    fetchSesstionsPoint();
                } else {
                    toast.error(res.message);
                }
            } else if (modalType === "update" && editSessionId) {
                form.updated_by = user?.username || "Admin";
                res = await sessionPointServices.updateSession(form, editSessionId);
                if (res.status_code === 200) {
                    closeModal();
                    fetchSesstionsPoint();
                } else {
                    toast.error(res.message);
                }
            }
        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const deleteSesstionPoint = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await sessionPointServices.delete(id);
            fetchSesstionsPoint();
        } catch (err) {
            setError('Xóa bình luận thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: Date | null, name: keyof FormState) => {
        const timestamp = date ? date.getTime() : 0;
        setForm(prev => ({
            ...prev,
            [name]: timestamp
        }));
    };

    const fetchSesstionsPoint = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const sesstionsPoint = await sessionPointServices.getAll(params);
            setData(sesstionsPoint.data);
            setCurrentPage(sesstionsPoint.page);
        } catch (err) {
            console.log("Danh sách lỗi !");
        }
    };

    const fetchSesstionId = async (id: string) => {
        try {
            const sessionPoint = await sessionPointServices.getById(id);

            setForm(prev => ({
                ...prev,
                ...sessionPoint.data
            }));

            setTimeout(() => openModal("update"), 200);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu review", err);
        }
    };

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    useEffect(() => {
        if (editSessionId) {
            fetchSesstionId(editSessionId);
        }
    }, [editSessionId]);

    useEffect(() => {
        fetchSesstionsPoint();
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
                        Thêm Mốc Sự Kiện
                    </button>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Thời gian bắt đầu", "Thời gian kết thúc", "Người tạo", "Người chỉnh sửa", "Trạng thái", "Hành Động"].map((header, idx) => (
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
                                {data.map((sesstionsPoint, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"> {formatDateTimeVN(sesstionsPoint.start_timestamp)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTimeVN(sesstionsPoint.end_timestamp)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{sesstionsPoint.created_by}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{sesstionsPoint.updated_by}</TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400 text-center text-white">
                                            {sesstionsPoint.status ? (<div className="bg-green-600"> Đang diễn ra</div>) : (<div className="bg-red-500">Tạm dừng</div>)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditSessionId(sesstionsPoint._id);
                                                        fetchSesstionId(sesstionsPoint._id);
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => deleteSesstionPoint(sesstionsPoint._id)}
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
                            {modalType === "add" ? "Tạo giai đoạn sự kiện" : "Sửa giai đoạn sự kiện"}
                        </h4>
                    </div>

                    <form className="flex flex-col" onSubmit={e => e.preventDefault()}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto pt-5 px-2 pb-3">
                            <>
                                {/* Thời gian bắt đầu */}
                                <Label>Thời gian bắt đầu :</Label>
                                <DatePicker
                                    selected={form.start_timestamp ? toVietnamDate(new Date(form.start_timestamp)) : null}
                                    onChange={(date) => handleDateChange(date, "start_timestamp")}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="border p-2 rounded w-full lg:min-w-[600px]"
                                    placeholderText="Chọn thời gian bắt đầu"
                                />
                                <br /><br />

                                {/* Thời gian kết thúc */}
                                <Label>Thời gian kết thúc :</Label>
                                <DatePicker
                                    selected={form.end_timestamp ? toVietnamDate(new Date(form.end_timestamp)) : null}
                                    onChange={(date) => handleDateChange(date, "end_timestamp")}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="border p-2 rounded w-full lg:min-w-[600px]"
                                    placeholderText="Chọn thời gian kết thúc"
                                />
                                <br /><br />
                                <Label className="text-red-500">Trạng thái :</Label>

                                <Switch
                                    label="status"
                                    name="status"
                                    checked={form.status}
                                    onChange={(checked, name) => {
                                        setForm({
                                            ...form,
                                            status: checked
                                        });
                                    }}
                                />
                            </>

                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Đóng
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Lưu thông tin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}