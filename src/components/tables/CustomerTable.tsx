import React, { useState, useEffect, useMemo } from "react";
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
import customerServices from '@/services/customerServices';
import { useAuth } from "@/context/AuthContext";
import { getSiteSystem } from "@/utils/storage";
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";
import DatePicker from '@/components/form/date-picker';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const initialForm = {
    site: getSiteSystem(),
    username: ''
};

interface Filters {
    username: string;
    pageSize: number;
    page: number;
    from_date?: string;
    to_date?: string;
}

interface Customer {
    username: string;
    phone_number: string;
    updatedAt: string;
    status: boolean;
    site: string;
    point: number;
    type_point: number;
    balance: number;
    note: string;
}

interface History {
    username: string;
    site: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    note: string;
}

export default function Customer() {
    const [data, setData] = useState<Customer[]>([]);
    const [dataPoint, setDataPoint] = useState<Customer[]>([]);
    const [totalPoinTake, setTotalPoinTake] = useState(0);
    const [totalPoinUsed, setTotalPoinUsed] = useState(0);
    const [totalPointCurrent, setTotalPointCurrent] = useState(0);
    const [dataHistories, setDataHistories] = useState<History[]>([]);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        username: '',
        page: 1,
        pageSize: 50,
    });

    const [pointfilters, setPointFilters] = React.useState<Filters>({
        username: '',
        pageSize: 1000,
        page: 1,
        from_date: '',
        to_date: ''
    });

    const [totalItemPoints, setTotalItemPoints] = useState(0);
    const [totalItems, setTotalItems] = useState(1)
    const totalPages = Math.ceil(totalItems / filters.pageSize);
    const totalPointPages = Math.ceil(totalItemPoints / filters.pageSize);

    const startIndex = (currentPage - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const pagedData = data.slice(startIndex, endIndex);

    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen, modalType]);

    const handleSearch = async () => {
        const { username, page, pageSize } = filters;
        const params = {
            ...(username && { username }),
            page,
            pageSize,
            site: getSiteSystem()
        };

        await fetchCustomers(params);
    }

    const handleSearchPoint = async (username: string) => {
        const params: { username?: string } = { username };

        if (pointfilters.username) params.username = username;
        await fetchCustomerHistoryPoint(params);
    }

    const updateCustomerStatus = async (username: string, site: string) => {
        try {
            await customerServices.updateStatus(username, site);

            fetchCustomers();
        } catch (err) {
            setError('Cập nhật trang thái thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const findHistoryCustomer = async (username: string, site: string) => {
        try {
            const res = await customerServices.findHistories(username, site);
            setDataHistories(res.data);
            fetchCustomers();
        } catch (err) {
            setError('Cập nhật trang thái thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const customers = await customerServices.getAll(params);
            setData(customers.data);
            setTotalItems(customers.total);
        } catch (err) {
            toast.error("Danh sách người dùng bị lỗi !");
        }
    };

    const fetchCustomerHistoryPoint = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                limit: 10,
                site: getSiteSystem(),
                ...searchParams
            };

            const customerPoints = await customerServices.getAllCustomerPoint(params);
            setDataPoint(customerPoints.data);

            setTotalPointCurrent(customerPoints.totalPointCurrent);
            setTotalPoinUsed(customerPoints.totalPoinUsed);
            setTotalPoinTake(customerPoints.totalPoinTake);
            setTotalItemPoints(customerPoints.total);
        } catch (err) {
            toast.error("Danh sách người dùng bị lỗi !");
        }
    };

    const handleCloseModal = () => {
        closeModal();
        setPointFilters(
            (prev) => ({
                ...prev,
                ["from_date"]: "",
                ["to_date"]: "",
            })
        );
    };

    const filteredData = useMemo(() => {
        if (!pointfilters.from_date && !pointfilters.to_date) return dataPoint;

        const filtered = dataPoint.filter(point => {
            const updatedAt = dayjs(point.updatedAt);
            const from = pointfilters.from_date ? dayjs(pointfilters.from_date).startOf('day') : null;
            const to = pointfilters.to_date ? dayjs(pointfilters.to_date).endOf('day') : null;

            if (from && to) return updatedAt.isBetween(from, to, null, '[]');
            if (from) return updatedAt.isAfter(from) || updatedAt.isSame(from, 'day');
            if (to) return updatedAt.isBefore(to) || updatedAt.isSame(to, 'day');

            return true;
        });

        return filtered;
    }, [dataPoint, pointfilters.from_date, pointfilters.to_date]);

    useEffect(() => {
        handleSearch();
    }, [filters, filters.page, filters.pageSize]);

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
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Tên tài khoản", "Số điện thoại", "Ngày cập nhật", "Trang thái", "Số điểm", "Hành Động",].map((header, idx) => (
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
                                {pagedData.map((customer, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{customer.username}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{customer.phone_number}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{formatDateTimeVN(customer.updatedAt)}</TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-center">
                                            {customer.status ? "Hoạt động" : "Tạm ngừng"}
                                            <br />
                                            <button
                                                onClick={() => updateCustomerStatus(customer.username, customer.site)}
                                                type="button"
                                                className="focus:outline-none text-white bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                                            >
                                                Update
                                            </button>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{customer.point}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        handleSearchPoint(customer.username);
                                                        openModal("find_history_point");
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Xem lịch điểm (Gem)
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        findHistoryCustomer(customer.username, customer.site);
                                                        openModal("find_history");
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Xem lịch sử chung
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
                                    const newPageSize = e.target.value;
                                    setFilters((prev) => ({ ...prev, pageSize: Number(newPageSize), page: 1 }));
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
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[1000px] m-4">
                <div className="no-scrollbar relative w-full max-w-[1000px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {modalType === "find_history" ? "Lịch sử nhận thưởng" : "Lịch sử biến động điểm của khách hàng:"}
                        </h4>
                    </div>

                    <form className="flex flex-col">
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            {modalType === "find_history" && (
                                dataHistories.map((history, index) => (
                                    <div key={index} className="py-5 border-b-3 border-black">
                                        Khách hàng: {history.username} <br />
                                        Kiểu quà tặng: <span className="text-red-500">{history.type}</span> <br />
                                        Ngày tạo: {formatDateTimeVN(history.createdAt)} <br />
                                        Ngày cập nhật: {formatDateTimeVN(history.updatedAt)} <br />
                                        Ghi chú: <span className="text-red-500">{history.note}</span>
                                    </div>
                                ))
                            )}

                            {modalType === "find_history_point" && (
                                <>
                                    <div className="flex justify-end gap-5">
                                        <div className="w-[28.6%]">
                                            <DatePicker
                                                id="date-picker"
                                                label="Ngày bắt đầu"
                                                value={pointfilters.from_date}
                                                onChange={(selectedDates, dateStr01) => {
                                                    setPointFilters({ ...pointfilters, from_date: dateStr01 });
                                                }}
                                                placeholder="Chọn ngày bắt đầu"
                                            />
                                        </div>

                                        <div className="w-[28.6%]">
                                            <DatePicker
                                                id="date-picker"
                                                label="Ngày kết thúc"
                                                value={pointfilters.to_date}
                                                onChange={(selectedDates, dateStr02) => {
                                                    setPointFilters({ ...pointfilters, to_date: dateStr02 });
                                                }}
                                                placeholder="Chọn ngày kết thúc"
                                            />
                                        </div>
                                    </div>
                                    <Table>
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                            <TableRow>
                                                {["STT", "Tên tài khoản", "Số điểm", "Trang thái", "Ghi chú", "Thời gian", "Số dư sau đó",].map((header, idx) => (
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
                                            {filteredData.map((point, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">{index + 1}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">{point.username}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">{point.point}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        {point.type_point == 1 ?
                                                            (
                                                                <span className="text-green-500">Cộng điểm</span>
                                                            )
                                                            :
                                                            (
                                                                <span className="text-red-500">Trừ điểm</span>
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-red-500 max-w-[200px]">{point.note}</TableCell>
                                                    <TableCell>{formatDateTimeVN(point.updatedAt)}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">{point.balance}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </div>

                        {modalType === "find_history_point" && (
                            <div className="flex justify-between mt-10">
                                <div className="text-blue-500">Tổng điểm đã nhận: {totalPoinTake}</div>
                                <div className="text-red-500">Tổng điểm đã sử dụng: {totalPoinUsed}</div>
                                <div className="text-blue-500">Tổng điểm còn lại: {totalPointCurrent}</div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Đóng
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
