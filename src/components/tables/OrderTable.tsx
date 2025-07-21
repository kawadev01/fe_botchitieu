import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import { useSearchParams } from 'next/navigation'
import { useMultiModal } from "@/hooks/useMultiModal";
import orderServices from '@/services/orderServices';
import { getSiteSystem } from "@/utils/storage";
import { information } from '@/utils/info.const';
import DatePicker from '@/components/form/date-picker';
import { formatDateTimeVN } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";
import { useCallback, useMemo } from "react";

const TableSkeleton = ({ isFullOrder, pageSize }: { isFullOrder: boolean, pageSize: number }) => {
    const skeletonCols = isFullOrder ? 9 : 6;
    return (
        <>
            {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                    {Array.from({ length: skeletonCols }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="px-5 py-5">
                            <div className="h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
};

const TableEmpty = ({ colSpan }: { colSpan: number }) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-inbox mb-4 text-gray-400 dark:text-gray-500"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Không có dữ liệu</h3>
                    <p className="mt-1 text-sm">Hiện tại chưa có đơn hàng nào trong mục này.</p>
                </div>
            </TableCell>
        </TableRow>
    );
};

interface OrderStatus {
    id: string;
    status: string;
}

interface Filters {
    username?: string;
    phone_number?: string;
    address?: string;
    full_name?: string;
    product_id?: string;
    from_date?: string;
    to_date?: string;
    status?: string;
    type_order?: string;
    page: number;
    pageSize: number;
}

interface OrderStatusCount {
    allSuccess: number;
    allPending: number;
    allConfirm: number;
    allShipped: number;
    allDeny: number;
}

export interface Order {
    _id: string;
    product_id: string;
    product_name: string;
    color: string;
    size: string;
    username: string;
    full_name: string;
    phone_number: string;
    address: string;
    ip: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    status: string;
    giftcode: string;
    note: string;
}

export default function OrderTable() {
    const [data, setData] = useState<Order[]>([]);
    const [countData, setCountData] = useState<OrderStatusCount>({
        allSuccess: 0,
        allPending: 0,
        allConfirm: 0,
        allShipped: 0,
        allDeny: 0,
    });
    const { closeModal } = useMultiModal();
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>({
        from_date: "",
        to_date: "",
        username: "",
        phone_number: "",
        address: "",
        full_name: "",
        product_id: "",
        status: "",
        type_order: "",
        page: 1,
        pageSize: 50
    });
    const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [totalItems, setTotalItems] = useState(1)
    const totalPages = Math.ceil(totalItems / filters.pageSize);

    const searchParams = useSearchParams();
    const [typeRegister, setTypeRegister] = useState(searchParams.get('type_register'));

    useEffect(() => {
        const currentType = searchParams.get('type_register');
        if (currentType !== typeRegister) {
            setTypeRegister(currentType);
            setFilters(prev => ({
                username: "",
                phone_number: "",
                address: "",
                full_name: "",
                product_id: "",
                from_date: "",
                to_date: "",
                status: "",
                type_order: "",
                page: 1,
                pageSize: prev.pageSize
            }));
        }
    }, [searchParams, typeRegister]);


    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setSelectedOrders([]);
        setSelectAll(false);

        const { username, phone_number, address, full_name, product_id, from_date, to_date, status, page, pageSize } = filters;
        const searchPayload = {
            ...(username && { username }),
            ...(phone_number && { phone_number }),
            ...(address && { address }),
            ...(full_name && { full_name }),
            ...(product_id && { product_id }),
            ...(from_date && { from_date }),
            ...(to_date && { to_date }),
            ...(status && { status }),
            page,
            pageSize,
        };

        try {
            const params = {
                ...searchPayload,
                site: getSiteSystem(),
                type_order: typeRegister,
            };

            const orders = await orderServices.getAll(params);
            setData(orders.data);
            setTotalItems(orders.total);
            setCountData(orders.statusCount)
        } catch (err) {
            console.error("Lỗi tải danh sách đơn hàng:", err);
            setData([]);
            toast.error('Tải danh sách đơn hàng thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [filters, typeRegister]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    const deleteOrder = useCallback(async (id: string) => {
        try {
            await orderServices.delete(id);
            toast.success("Xóa đơn hàng thành công.");
            fetchOrders();
        } catch (err) {
            toast.error('Xóa Order thất bại.');
        }
    }, [fetchOrders]);

    const changleStatusMultipleOrders = useCallback(async (status: string, ids: string[]) => {
        if (ids.length === 0) {
            toast.warn("Vui lòng chọn ít nhất một đơn hàng.");
            return;
        }
        try {
            await orderServices.changleOrderList(status, ids);
            toast.success("Thay đổi trạng thái đơn hàng thành công.");
            fetchOrders();
        } catch (err) {
            toast.error('Thay đổi trạng thái đơn hàng thất bại.');
        }
    }, [fetchOrders]);

    const deleteMultipleOrders = useCallback(async (ids: string[]) => {
        if (ids.length === 0) {
            toast.warn("Vui lòng chọn ít nhất một đơn hàng.");
            return;
        }
        try {
            await orderServices.deleteList(ids);
            toast.success("Xóa các đơn hàng đã chọn thành công.");
            fetchOrders();
        } catch (err) {
            toast.error('Xóa đơn hàng thất bại.');
        }
    }, [fetchOrders]);


    const handleExportExcel = useCallback(async () => {
        try {
            const { username, phone_number, address, full_name, product_id, from_date, to_date, status, pageSize } = filters;

            const params = {
                ...(username && { username }),
                ...(phone_number && { phone_number }),
                ...(address && { address }),
                ...(full_name && { full_name }),
                ...(product_id && { product_id }),
                ...(from_date && { from_date }),
                ...(to_date && { to_date }),
                ...(status && { status }),
                pageSize: totalItems > 0 ? totalItems : 1000,
                site: getSiteSystem(),
            };

            const blob = await orderServices.getExport(params);

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_export_${new Date().toISOString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Xuất file Excel thành công!");

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Xuất Excel thất bại';
            toast.error(msg);
        }
    }, [filters, totalItems]);


    const updateOrderStatus = useCallback(async (orderStatus: OrderStatus) => {
        try {
            const res = await orderServices.updateStatusById(orderStatus);

            if (res.status_code == 200) {
                closeModal();
                fetchOrders();
                setShowMenu(null);
                toast.success("Cập nhật trạng thái đơn hàng thành công.");
            } else {
                toast.error(res.message)
            }
        } catch (err) {
            toast.error('Thao tác thất bại.');
        } finally {
            setLoading(false);
        }
    }, [closeModal, fetchOrders]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu === null) return;

            const currentRef = menuRefs.current[showMenu];
            if (currentRef && !currentRef.contains(event.target as Node)) {
                setShowMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelectedOrders(isChecked ? data.map((o) => o._id) : []);
    };

    const handleSelectOrder = (isChecked: boolean, orderId: string) => {
        if (isChecked) {
            setSelectedOrders((prev) => [...prev, orderId]);
        } else {
            setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
        }
    };
    
    useEffect(() => {
        if (selectedOrders.length > 0 && selectedOrders.length === data.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedOrders, data]);

    const isFilterable = useMemo(() => typeRegister !== "donate" && typeRegister !== "giftcode", [typeRegister]);

    return (
        <>
            <div className="flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm ">
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4  py-0 px-4">
                    <div>
                        {isFilterable && (
                            <OrderStatusTabs filters={filters} setFilters={setFilters} countData={countData} />
                        )}
                    </div>
                    <div className="flex justify-center items-center">
                        <OrderActions
                            isFilterable={isFilterable}
                            selectedOrders={selectedOrders}
                            onDelete={deleteMultipleOrders}
                            onChangeStatus={changleStatusMultipleOrders}
                            onExport={handleExportExcel}
                        />
                    </div>
                </div>
                
                <div className="p-4">
                    <OrderFilters
                        filters={filters}
                        setFilters={setFilters}
                        onSearch={fetchOrders}
                        isFilterable={isFilterable}
                    />
                </div>


                <div className="overflow-x-auto">
                    <div className="min-w-full align-middle">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                <TableRow>
                                    {isFilterable ? (
                                        <>
                                            <TableCell className="w-12 px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            {["STT", "Sản phẩm", "Tài khoản", "Thông tin người nhận", "Thời gian", "IP", "Trạng Thái", "Hành Động"].map((header, idx) => (
                                                <TableCell
                                                    key={idx}
                                                    isHeader
                                                    className={`px-5 py-3 font-medium text-gray-600 dark:text-gray-300 ${header === "Hành Động" ? "text-center" : "text-left"} text-xs uppercase tracking-wider`}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {["STT", "Sản phẩm", "Tài khoản", "TG Đăng Ký", "IP"].map((header, idx) => (
                                                <TableCell
                                                    key={idx}
                                                    isHeader
                                                    className={`px-5 py-3 font-medium text-gray-600 dark:text-gray-300 ${header === "Hành Động" ? "text-center" : "text-left"} text-xs uppercase tracking-wider`}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}

                                            {typeRegister == "giftcode" && (
                                                <TableCell
                                                    key={50}
                                                    isHeader
                                                    className={`px-5 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider`}
                                                >
                                                    Mã Code
                                                </TableCell>
                                            )}

                                            {typeRegister == "donate" && (
                                                <TableCell
                                                    key={50}
                                                    isHeader
                                                    className={`px-5 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider`}
                                                >
                                                    Ghi Chú
                                                </TableCell>
                                            )}
                                        </>
                                    )}

                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading ? (
                                    <TableSkeleton isFullOrder={isFilterable} pageSize={filters.pageSize} />
                                ) : data.length > 0 ? (
                                    data.map((order, index) => (
                                        <TableRow key={order._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors duration-150">
                                            {isFilterable && (
                                                <TableCell className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                                                        checked={selectedOrders.includes(order._id)}
                                                        onChange={(e) => handleSelectOrder(e.target.checked, order._id)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className="px-5 py-4 sm:px-6 text-left">{index + 1 + (filters.page - 1) * filters.pageSize}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-gray-300 text-left text-sm">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">Mã: {order.product_id}</span> <br />
                                                {order.product_name} <br />
                                                {order.color && (<span>Màu: <span className="text-red-500">{order.color} </span><br /></span>)}
                                                {order.size && (<span>Size: <span className="text-red-500">{order.size} </span><br /></span>)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400 text-left text-sm">{order.username}</TableCell>
                                            
                                            {isFilterable && (
                                                <>
                                                    <TableCell className="px-4 py-3 text-left text-sm dark:text-gray-400">
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">{order.full_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">{order.phone_number}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">{order.address}</p>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        <p><span className="font-medium text-gray-800 dark:text-gray-300">Đăng ký:</span> {formatDateTimeVN(order.createdAt)}</p>
                                                        <p><span className="font-medium text-gray-800 dark:text-gray-300">Cập nhật:</span> {formatDateTimeVN(order.updatedAt)}</p>
                                                    </TableCell>
                                                </>
                                            )}
                                            {!isFilterable ? (
                                                <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400 text-left text-sm">{formatDateTimeVN(order.createdAt)}</TableCell>
                                            ) : null}

                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{order.ip}</TableCell>

                                            {isFilterable && (
                                                <TableCell className="relative px-4 py-3 text-center text-sm dark:text-gray-400">
                                                    {(() => {
                                                        const statusKey = order.status;
                                                        const statusLabel = (information.order_status as Record<string, string>)[statusKey] || statusKey;
                                                        const statusColorMap: Record<string, string> = {
                                                            pending: "bg-yellow-100 text-yellow-800 border-yellow-400/50 hover:bg-yellow-200/80 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400/20",
                                                            confirm: "bg-blue-100 text-blue-800 border-blue-400/50 hover:bg-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-400/20",
                                                            deny: "bg-red-100 text-red-800 border-red-400/50 hover:bg-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-400/20",
                                                            success: "bg-green-100 text-green-800 border-green-400/50 hover:bg-green-200/80 dark:bg-green-500/10 dark:text-green-400 dark:border-green-400/20",
                                                            shipped: "bg-purple-100 text-purple-800 border-purple-400/50 hover:bg-purple-200/80 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-400/20",
                                                            refund: "bg-orange-100 text-orange-800 border-orange-400/50 hover:bg-orange-200/80 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-400/20",
                                                        };
                                                        const colorClass = statusColorMap[statusKey] || "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";

                                                        return (
                                                            <div className="relative inline-block text-left">
                                                                <button
                                                                    onClick={() => setShowMenu(showMenu === order._id ? null : order._id)}
                                                                    className={`inline-block w-[100px] rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${colorClass}`}
                                                                >
                                                                    {statusLabel}
                                                                </button>
                                                                {/* Nếu trạng thái là 'success' hoặc 'deny' thì không hiển thị menu đổi trạng thái */}
                                                                {(order.status !== "success" && order.status !== "deny" && showMenu === order._id) && (
                                                                    <div
                                                                        ref={(el) => { menuRefs.current[order._id] = el; }}
                                                                        className="absolute left-1/2 z-10 mt-2 w-40 -translate-x-1/2 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-white/10 ring-opacity-5 focus:outline-none"
                                                                    >
                                                                        <div className="py-1">
                                                                            {(() => {
                                                                                // Nếu trạng thái là 'confirm' thì chỉ hiển thị menu 'deny' và 'success'
                                                                                let statusOptions: [string, string][];
                                                                                if (order.status === "confirm") {
                                                                                    statusOptions = Object.entries(information.order_status)
                                                                                        .filter(([key]) => key === "deny" || key === "success");
                                                                                } else {
                                                                                    statusOptions = Object.entries(information.order_status)
                                                                                        .filter(([key]) => key !== order.status);
                                                                                }
                                                                                return statusOptions.map(([key, label]) => (
                                                                                    <button
                                                                                        key={key}
                                                                                        onClick={() =>
                                                                                            updateOrderStatus({
                                                                                                status: key,
                                                                                                id: order._id,
                                                                                            })
                                                                                        }
                                                                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                                    >
                                                                                        {label}
                                                                                    </button>
                                                                                ));
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </TableCell>
                                            )}

                                            {typeRegister == "giftcode" && (
                                                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                                                    {order.giftcode}
                                                </TableCell>
                                            )}

                                            {typeRegister == "donate" && (
                                                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                                                    {order.note}
                                                </TableCell>
                                            )}

                                            {isFilterable && (
                                                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                                                    <div className="flex justify-center items-center">
                                                        {/* Nút xóa */}
                                                        <button
                                                            onClick={() => deleteOrder(order._id)}
                                                            type="button"
                                                            className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium rounded-lg text-sm px-3 py-1.5 text-center transition-colors duration-200"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            )}

                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={isFilterable ? 9 : 6} />
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                            <select
                                name="pageSize"
                                value={filters.pageSize}
                                onChange={(e) => {
                                    const newPageSize = Number(e.target.value);
                                    setFilters((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
                                }}
                                className="h-10 w-30 appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
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
        </>
    );
}


const OrderStatusTabs = ({ filters, setFilters, countData }: { filters: Filters, setFilters: React.Dispatch<React.SetStateAction<Filters>>, countData: OrderStatusCount }) => (
    <div className="flex justify-center items-center my-3">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {Object.entries(information.order_status).map(([key, label]) => {
                const isActive = filters.status === key;
                const count = {
                    success: countData.allSuccess,
                    pending: countData.allPending,
                    confirm: countData.allConfirm,
                    shipped: countData.allShipped,
                    deny: countData.allDeny
                }[key] ?? 0;

                return (
                    <button
                        key={key}
                        onClick={() => setFilters((prev) => ({ ...prev, status: key, page: 1 }))}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                        ${isActive
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        {label}
                        <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {count}
                        </span>
                    </button>
                )
            })}
        </nav>
    </div>
);

const OrderActions = ({
    isFilterable,
    selectedOrders,
    onDelete,
    onChangeStatus,
    onExport,
}: {
    isFilterable: boolean;
    selectedOrders: string[];
    onDelete: (ids: string[]) => void;
    onChangeStatus: (status: string, ids: string[]) => void;
    onExport: () => void;
}) => {
    const [bulkStatus, setBulkStatus] = useState('');

    if (!isFilterable) return null;

    const handleApplyStatusChange = () => {
        if (!bulkStatus) {
            toast.warn("Vui lòng chọn một trạng thái để cập nhật.");
            return;
        }
        onChangeStatus(bulkStatus, selectedOrders);
    };

    return (
        <div className="w-full flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Đã chọn: <span className="text-blue-600 dark:text-blue-400">{selectedOrders.length}</span>
                </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
                <div className="flex items-center gap-2">
                    <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
                        disabled={selectedOrders.length === 0}
                    >
                        <option value="">-- Chọn trạng thái --</option>
                        {Object.entries(information.order_status)
                            .filter(([key]) => key !== "pending") // Bỏ trạng thái pending
                            .map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                    </select>
                    <button
                        onClick={handleApplyStatusChange}
                        type="button"
                        className="h-10 px-4 py-2.5 inline-flex items-center justify-center rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedOrders.length === 0 || !bulkStatus}
                    >
                        Áp dụng
                    </button>
                </div>

                <button
                    onClick={() => onDelete(selectedOrders)}
                    type="button"
                    className="h-10 px-4 py-2.5 inline-flex items-center justify-center rounded-lg text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 focus:ring-4 focus:ring-red-300/50 dark:focus:ring-red-800/50 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedOrders.length === 0}
                >
                    Xóa
                </button>

                <button
                    type="button"
                    onClick={onExport}
                    className="h-10 px-4 py-2.5 inline-flex items-center justify-center rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none transition-colors duration-200"
                >
                    Export Excel
                </button>
            </div>
        </div>
    );
};

const OrderFilters = ({
    filters,
    setFilters,
    onSearch,
    isFilterable,
}: {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    onSearch: () => void;
    isFilterable: boolean;
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: 'from_date' | 'to_date', value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div className="w-full">
                    <label htmlFor="username" className="sr-only">Tên Tài khoản</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={filters.username}
                        onChange={handleInputChange}
                        className="h-10 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 transition-colors duration-200"
                        placeholder="Tài khoản"
                    />
                </div>
                {isFilterable && (
                    <>
                        <div className="w-full">
                            <label htmlFor="phone_number" className="sr-only">Số điện thoại</label>
                            <input
                                id="phone_number"
                                name="phone_number"
                                type="text"
                                value={filters.phone_number}
                                onChange={handleInputChange}
                                className="h-10 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 transition-colors duration-200"
                                placeholder="Số điện thoại"
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="address" className="sr-only">Địa Chỉ</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={filters.address}
                                onChange={handleInputChange}
                                className="h-10 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 transition-colors duration-200"
                                placeholder="Địa chỉ"
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="full_name" className="sr-only">Tên đầy đủ</label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                value={filters.full_name}
                                onChange={handleInputChange}
                                className="h-10 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 transition-colors duration-200"
                                placeholder="Tên đầy đủ"
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="product_id" className="sr-only">ID sản phẩm</label>
                            <input
                                id="product_id"
                                name="product_id"
                                type="text"
                                value={filters.product_id}
                                onChange={handleInputChange}
                                className="h-10 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 transition-colors duration-200"
                                placeholder="ID sản phẩm"
                            />
                        </div>

                        <div className="w-full">
                            <DatePicker
                                id="from-date-picker"
                                label="Ngày bắt đầu"
                                value={filters.from_date}
                                onChange={(_, dateStr) => handleDateChange('from_date', dateStr)}
                                placeholder="Chọn ngày bắt đầu"
                            />
                        </div>

                        <div className="w-full">
                            <DatePicker
                                id="to-date-picker"
                                label="Ngày kết thúc"
                                value={filters.to_date}
                                onChange={(_, dateStr) => handleDateChange('to_date', dateStr)}
                                placeholder="Chọn ngày kết thúc"
                            />
                        </div>
                    </>
                )}
                 <div className="flex items-end justify-center">
                    <button
                        onClick={(e) => { e.preventDefault(); onSearch(); }}
                        type="submit"
                        className="h-10 w-full inline-flex items-center justify-center p-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg border border-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                        <span>Tìm kiếm</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
