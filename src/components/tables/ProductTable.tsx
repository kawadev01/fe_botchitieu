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
import _ from 'lodash';
import productServices from '@/services/productServices';
import { information } from '@/utils/info.const';
import { setNestedValue } from '@/utils/object';
import DatePicker from "react-datepicker";
import Checkbox from "../form/input/Checkbox";
import ContentEditor from "../form/input/ContentEditor";

import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { getSiteSystem } from "@/utils/storage";
import Switch from "../form/switch/Switch";
import { formatDateTimeVN, toVietnamDate } from "@/utils/formatDateTime";
import Pagination from "@/layout/Pagination";

interface ConditionPoint {
    status: boolean;
    point: number;
}

interface ConditionDonate {
    status: boolean;
    point: number;
    money: number;
    current_money: number;
    max_money: number;
    end_timestamp: number;
}

interface TimeCondition {
    status: boolean;
    start_timestamp: number;
    end_timestamp: number;
}

interface Conditions {
    take_after_day: number;
    take_before_product: string;
    stock_auto_update: number;
    total_bet: number;
    total_deposit: number;
    times_deposit: number;
    level_vip: number;
    last_day_deposit: number,
    last_day_bet: number,
    time_condition: TimeCondition;
}

interface FormType {
    site: string | null;
    product_id: string;
    product_tag: string;
    product_type: string;
    name: string;
    image_main: string;
    image_details: string[];
    content: string;
    description: string;
    location: number;
    status: boolean;
    created_by: string;
    type_register: string[];
    condition_point: ConditionPoint;
    condition_donate: ConditionDonate;
    conditions: Conditions;
    details: any[];
    updated_by: string;
    send_message: boolean
}

const initialForm: FormType = {
    site: getSiteSystem(),
    product_id: '',
    product_tag: 'in_stock',
    product_type: 'fashion',
    name: '',
    image_main: '',
    image_details: [],
    content: '',
    description: '',
    location: 0,
    status: true,
    created_by: '',
    type_register: [],
    send_message: true,
    condition_point: {
        status: true,
        point: 0,
    },
    condition_donate: {
        status: true,
        point: 0,
        money: 0,
        current_money: 0,
        max_money: 0,
        end_timestamp: 0,
    },
    conditions: {
        take_after_day: 0,
        take_before_product: '',
        stock_auto_update: 0,
        total_bet: 0,
        total_deposit: 0,
        times_deposit: 0,
        level_vip: 0,
        last_day_deposit: 0,
        last_day_bet: 0,
        time_condition: {
            status: true,
            start_timestamp: 0,
            end_timestamp: 0,
        },
    },
    details: [],
    updated_by: '',
};

interface Product {
    _id: string;
    name: string;
    product_id: string;
    description: string;
    status: boolean;
    location: number;
    createdAt: string;
    updatedAt: string;
}

export default function ProductTable() {
    const [data, setData] = useState<Product[]>([]);
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        page: 1,
        pageSize: 50,
        site: getSiteSystem(),
        product_id: '',
        product_type: '',
        name: '',
        product_tag: '',
        created_by: '',
        status: true
    });

    const [totalItems, setTotalItems] = useState(1)
    const totalPages = Math.ceil(totalItems / filters.pageSize);

    const startIndex = (currentPage - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const pagedData = data.slice(startIndex, endIndex);

    useEffect(() => {
        if (editProductId) {
            fetchDataById(editProductId);
        }
    }, [editProductId]);

    const fetchDataById = async (id: string) => {
        try {
            setLoading(true);
            const res = await productServices.getById(id);
            const data = res.data;
            setForm({ ...initialForm, ...data });
        } catch (err) {
            console.error("Lỗi load data: ", err);
        } finally {
            setLoading(false);
        }
    };

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
                res = await productServices.postProduct(form);

                if (res.status_code != 200) {
                    toast.error(res.message)
                }
            }
            else
                if (modalType === "update") {
                    form.updated_by = user?.username ?? "Admin";
                    res = await productServices.update(form, editProductId);

                    if (res.status_code != 200)
                        toast.error(res.message)
                }

            closeModal();
            fetchProducts();

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.' + err);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        setError('');
        setLoading(true);

        try {
            await productServices.delete(id);
            fetchProducts();
        } catch (err) {
            setError('Xóa bình luận thất bại. Vui lòng kiểm tra thông tin.' + err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        closeModal();
        setForm(initialForm);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;
        const checked = 'checked' in target ? (target as HTMLInputElement).checked : undefined;

        if (name === "type_register") {
            setForm((prev) => {
                const currentArray = prev[name] || [];
                const updatedArray = checked
                    ? [...currentArray, value]
                    : currentArray.filter((v) => v !== value);

                return {
                    ...prev,
                    [name]: updatedArray,
                };
            });
            return;
        }

        if (name === "image_details") {
            const urls = String(value)
                .split('|')
                .map((v) => v.trim())
                .filter((v) => v.length > 0);

            setForm((prev) => ({
                ...prev,
                [name]: urls,
            }));
            return;
        }

        const finalValue = type === 'checkbox' ? checked : value;

        if (name.includes('.')) {
            setForm(prev => {
                const updated = _.cloneDeep(prev);
                _.set(updated, name, autoCastValue(name, finalValue));
                return updated;
            });
        } else {
            setForm(prev => ({
                ...prev,
                [name]: autoCastValue(name, finalValue)
            }));
        }
    };

    const handleDateChange = (date: Date | null, name: string) => {
        const timestamp = date ? date.getTime() : 0;

        setForm(prev => setNestedValue(prev, name, timestamp));
    };

    const handleDetailChange = (index: number, field: string, value: any) => {
        const newDetails = [...form.details];
        newDetails[index][field] = value;
        setForm({ ...form, details: newDetails });
    };

    const addDetailItem = () => {
        const newIndex = form.details.length + 1;
        const randomSuffix = Math.floor(Math.random() * 90 + 10);
        const newDetail = {
            product_detail_id: `D_${form.product_id}_${newIndex}${randomSuffix}`,
            color: '',
            size: '',
            stock: 0,
            status: true
        };

        setForm({
            ...form,
            details: [...form.details, newDetail]
        });
    };

    const removeDetailItem = (index: number) => {
        const newDetails = form.details.filter((_, i) => i !== index);
        setForm({ ...form, details: newDetails });
    };

    const autoCastValue = (name: string, value: any): any => {
        const intFields: string[] = [
            'location',
            'condition_point.point',
            'condition_donate.point',
            'condition_donate.current_money',
            'condition_donate.money',
            'condition_donate.max_money',
            'conditions.take_after_day',
            'conditions.total_bet',
            'conditions.last_day_deposit',
            'conditions.last_day_bet',
            'conditions.total_deposit',
            'conditions.times_deposit',
            'conditions.level_vip',
            'conditions.stock_auto_update',
            'conditions.time_condition.start_timestamp',
            'conditions.time_condition.end_timestamp',
            'condition_donate.end_timestamp'
        ];

        if (intFields.includes(name)) {
            return parseInt(value) || 0;
        }

        return value;
    };

    const handleSearch = async () => {
        const { product_id, name, product_type, product_tag, created_by, status, page, pageSize, site } = filters;
        const params = {
            ...(product_id && { product_id }),
            ...(name && { name }),
            ...(product_type && { product_type }),
            ...(product_tag && { product_tag }),
            ...(created_by && { created_by }),
            ...(typeof status !== 'undefined' ? { status } : { status: false }),
            page,
            pageSize,
            site: getSiteSystem()
        };

        await fetchProducts(params);
    };

    const fetchProducts = async (searchParams = {}) => {
        try {
            const params = {
                page: 1,
                ...(getSiteSystem() && { site: getSiteSystem() }),
                ...searchParams
            };

            const products = await productServices.getAll(params);
            setData(products.data);
            setTotalItems(products.total);
        } catch (err) {
            console.log("Danh sách lỗi !");
        }
    };

    const fetchProductId = async (id: string) => {
        try {
            const product = await productServices.getById(id);
            setForm(prev => ({
                ...prev,
                ...product.data,
                updated_by: product.data.updated_by ?? "ADMIN",
            }));

            setTimeout(() => openModal("update"), 200);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu review", err);
        }
    }

    useEffect(() => {
        if (editProductId) {
            fetchProductId(editProductId);
        }
    }, [editProductId]);

    useEffect(() => {
        handleSearch();
    }, [filters]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="m-5">
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => openModal("add")}
                            type="button"
                            className="h-11 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        >
                            Thêm sản phẩm
                        </button>
                    </div>

                    <div className="m-5 flex justify-between">
                        <div className="w-full pb-10">
                            <div className="flex flex-wrap gap-5 mb-4">
                                <div className="w-[16.6%]">
                                    <label htmlFor="search_product_id" className="sr-only">Mã sản phẩm</label>
                                    <div className="relative w-full">
                                        <input
                                            id="search_product_id"
                                            name="search_product_id"
                                            type="text"
                                            value={filters.product_id}
                                            onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
                                            className="border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-2.5 p-2.5"
                                            placeholder="Mã sản phẩm"
                                        />
                                    </div>
                                </div>

                                <div className="w-[16.6%]">
                                    <label htmlFor="search_name" className="sr-only">Tên sản phẩm</label>
                                    <div className="relative w-full">
                                        <input
                                            id="search_name"
                                            name="search_name"
                                            type="text"
                                            value={filters.name}
                                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                            className="border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-2.5 p-2.5"
                                            placeholder="Tên sản phẩm"
                                        />
                                    </div>
                                </div>

                                {/* Trạng thái sản phẩm */}
                                <div className="w-[16.6%]">
                                    <label htmlFor="product_tag" className="sr-only">Trạng thái sản phẩm</label>
                                    <div className="relative w-full">
                                        <select
                                            id="product_tag"
                                            name="product_tag"
                                            value={filters.product_tag}
                                            onChange={(e) => setFilters({ ...filters, product_tag: e.target.value })}
                                            className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11"
                                        >
                                            <option value="">-- Trạng thái SP --</option>
                                            {Object.entries(information.product_tag).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="w-[16.6%]">
                                    <label htmlFor="product_type" className="sr-only">Kiểu sản phẩm</label>
                                    <div className="relative w-full">
                                        <select
                                            id="product_type"
                                            name="product_type"
                                            value={filters.product_type}
                                            onChange={(e) => setFilters({ ...filters, product_type: e.target.value })}
                                            className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11"
                                        >
                                            <option value="">-- Kiểu sản phẩm --</option>
                                            {Object.entries(information.product_type).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="w-[16.6%]">
                                    <label htmlFor="status" className="sr-only">Trạng thái hiển thị</label>
                                    <div className="relative w-full">
                                        <select
                                            id="status"
                                            name="status"
                                            value={filters.status === true ? 'true' : filters.status === false ? 'false' : ''}
                                            onChange={(e) => {
                                                setFilters({
                                                    ...filters,
                                                    status: e.target.value === 'true',
                                                });
                                            }}
                                            className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11"
                                        >
                                            <option value="">-- Chọn trạng thái --</option>
                                            <option value="true">Hiển Thị Website</option>
                                            <option value="false">Ẩn khỏi Website</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="w-[5%]">
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleSearch(); }}
                                        type="submit"
                                        className="h-auto p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800"
                                    >
                                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                        </svg>
                                        <span className="sr-only">Search</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1102px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    {["STT", "Tên sản phẩm", "Mã sản phẩm", "Nội dung", "Trạng thái", "Vị trí", "Ngày tạo", "Ngày cập nhật", "Hành Động"].map((header, idx) => (
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
                                {pagedData.map((products, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{products.name}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{products.product_id}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{products.description}</TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm dark:text-gray-400 text-center text-white">
                                            {products.status ? (<div className="bg-green-600"> Hiển thị</div>) : (<div className="bg-red-500">Tạm ẩn</div>)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{products.location}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTimeVN(products.createdAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDateTimeVN(products.updatedAt)}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditProductId(products._id);
                                                        fetchProductId(products._id);
                                                    }}
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(products._id)}
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
            <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[1000px] m-4">
                <div className="no-scrollbar relative w-full max-w-[1000px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {modalType === "add" ? "Thêm và thiết lập sản phẩm mới" : "Sửa thông tin sản phẩm"}
                        </h4>
                    </div>

                    <form className="flex flex-col no-scrollbar" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[600px] overflow-y-auto px-2 pb-3">
                            <h2>Thông tin chính: </h2>

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Tên sản phẩm</Label>
                                    <Input
                                        type="text"
                                        placeholder="Tên sản phẩm"
                                        value={form.name || ""}
                                        name="name"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Mã sản phẩm</Label>
                                    <Input
                                        type="text"
                                        placeholder="Product ID"
                                        value={form.product_id || ""}
                                        name="product_id"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Trạng thái sản phẩm: </Label>

                                    <select
                                        name="product_tag"
                                        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 
                                            px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 
                                            focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                                             dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
                                              dark:focus:border-brand-800`}
                                        value={form.product_tag}
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <option value="">-- Chọn trạng thái --</option>
                                        {Object.entries(information.product_tag).map(([key, label]) => (
                                            <option key={key} value={key} selected={form.product_tag === key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-5">
                                    <Label>Loại sản phẩm và sự kiện</Label>
                                    <select
                                        name="product_type"
                                        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 
                                            px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 
                                            focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                                             dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
                                              dark:focus:border-brand-800`}
                                        value={form.product_type}
                                        onChange={(e) => handleChange(e)}
                                    >
                                        <option value="">-- Chọn trạng thái --</option>
                                        {Object.entries(information.product_type).map(([key, label]) => (
                                            <option key={key} value={key} selected={form.product_type === key}>
                                                {label}
                                            </option>
                                        ))}

                                    </select>
                                </div>
                            </div>

                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Ảnh sản phẩm chính</Label>
                                    <Input
                                        type="text"
                                        placeholder="Ảnh sản phẩm chính"
                                        value={form.image_main}
                                        name="image_main"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Danh sách ảnh phụ</Label>
                                    <Input
                                        type="text"
                                        placeholder="Danh sách ảnh phụ"
                                        value={Array.isArray(form.image_details) ? form.image_details.join('|') : ''}
                                        name="image_details"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <br />

                            <div>
                                <Label>Mô tả ngắn</Label>
                                <div className="relative">
                                    <textarea name="description"
                                        id="description"
                                        value={form.description || ""}
                                        rows={3}
                                        onChange={handleChange}
                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300
                                         focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600
                                          dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Mô tả ngắn ...">
                                    </textarea>
                                </div>
                            </div>

                            <br />

                            <div>
                                <Label>Nội dung về sản phẩm</Label>
                                <ContentEditor
                                    value={form.content || ""}
                                    onChange={(val) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            content: val,
                                        }))
                                    }
                                    placeholder="Nội dung sản phẩm..."
                                    className="bg-white dark:bg-gray-700 p-4 rounded text-gray-900 dark:text-white"
                                />
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Vị trí hiển thị</Label>
                                    <Input
                                        type="number"
                                        placeholder="Vị trí hiển thị"
                                        value={form.location}
                                        name="location"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Trạng thái hiển thị sản phẩm trên website: </Label>
                                    <Switch
                                        label=""
                                        name="status"
                                        checked={form.status}
                                        onChange={(checked, name) => {
                                            setForm({
                                                ...form,
                                                status: checked
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Gửi thư thông báo: </Label>
                                    <Switch
                                        label=""
                                        name="send_message"
                                        checked={form.send_message}
                                        onChange={(checked, name) => {
                                            setForm({
                                                ...form,
                                                send_message: checked
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <br />

                            <h2 className="text-red-500">Phương thức nhận quà: </h2>
                            <div className="flex gap-8">
                                {Object.entries(information.product_type_register).map(([key, label]) => (
                                    <div key={key} className="flex items-center gap-3 py-2">

                                        <Checkbox
                                            id={key}
                                            name="type_register"
                                            checked={form.type_register.includes(key)}
                                            onChange={(checked) => {
                                                setForm((prev) => {
                                                    const current = prev.type_register || [];
                                                    const updated = checked
                                                        ? [...current, key]
                                                        : current.filter((item: string) => item !== key);

                                                    return {
                                                        ...prev,
                                                        type_register: updated,
                                                    };
                                                });
                                            }}
                                        />
                                        <label htmlFor="scales">{label}</label>
                                    </div>
                                ))}
                            </div>
                            <br />

                            <h2 className="text-red-500">Cấu hình phương thức nhận theo điểm: </h2>
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Điểm: </Label>
                                    <Input
                                        type="number"
                                        placeholder="Nhập số điểm"
                                        name="condition_point.point"
                                        value={form.condition_point?.point ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Trạng thái: </Label>

                                    <Switch
                                        label=""
                                        name="condition_point.status"
                                        checked={form.condition_point.status}
                                        onChange={(checked, name) => {
                                            setForm({
                                                ...form,
                                                condition_point: {
                                                    ...form.condition_point,
                                                    status: checked
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <br />
                            <h2 className="text-red-500">Cấu hình từ thiện: </h2>
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Điểm</Label>
                                    <Input
                                        type="number"
                                        placeholder="Nhập số điểm"
                                        name="condition_donate.point"
                                        value={form.condition_donate?.point ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Trạng thái: </Label>
                                    <Switch
                                        label=""
                                        name="condition_donate.status"
                                        checked={form.condition_donate.status}
                                        onChange={(checked, name) => {
                                            setForm({
                                                ...form,
                                                condition_donate: {
                                                    ...form.condition_donate,
                                                    status: checked
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Số tiền tương đương với điểm</Label>
                                    <Input
                                        type="number"
                                        placeholder="Số tiền tương đương với điểm"
                                        name="condition_donate.money"
                                        value={form.condition_donate?.money ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Số tiền hiện tại :</Label>
                                    <Input
                                        type="number"
                                        placeholder="Số tiền hiện tại"
                                        name="condition_donate.current_money"
                                        value={form.condition_donate?.current_money ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Số tiền tối đa: </Label>
                                    <Input
                                        type="number"
                                        placeholder="Số tiền tối đa"
                                        name="condition_donate.max_money"
                                        value={form.condition_donate?.max_money ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Thời gian kết thúc :</Label>
                                    <DatePicker
                                        selected={form.condition_donate.end_timestamp ? toVietnamDate(new Date(form.condition_donate.end_timestamp)) : null}
                                        onChange={(date) => handleDateChange(date, "condition_donate.end_timestamp")}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="border p-2 rounded"
                                    />
                                </div>
                            </div>
                            <br />

                            <h2 className="text-red-500">Cấu hình phương thức nhận theo điều kiện: </h2>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Có thể nhận thưởng sau bao nhiêu ngày: </Label>
                                    <Input
                                        type="number"
                                        placeholder="Số ngày có thể nhận thưởng"
                                        name="conditions.take_after_day"
                                        value={form.conditions?.take_after_day ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Yêu cầu nhận các sản phẩm khác trước khi nhận thưởng :</Label>
                                    <Input
                                        type="number"
                                        placeholder="Mã sản phẩm yêu cầu nhận trước"
                                        name="conditions.take_before_product"
                                        value={form.conditions?.take_before_product ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Tự động cập nhật số lượng mỗi ngày ( Áp dụng với GiftCode ) </Label>
                                    <Input
                                        type="number"
                                        placeholder="Tự động cập nhật số lượng mỗi ngày"
                                        name="conditions.stock_auto_update"
                                        value={form.conditions.stock_auto_update ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Tổng cược ( Điểm ): </Label>
                                    <Input
                                        type="number"
                                        placeholder="Tổng cược"
                                        name="conditions.total_bet"
                                        value={form.conditions?.total_bet ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Tổng nạp ( Điểm ) :</Label>
                                    <Input
                                        type="number"
                                        placeholder="Tổng nạp"
                                        name="conditions.total_deposit"
                                        value={form.conditions?.total_deposit ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Có thể nhận sau bao nhiêu ngày: </Label>
                                    <Input
                                        type="number"
                                        placeholder="Số ngày"
                                        name="conditions.times_deposit"
                                        value={form.conditions?.times_deposit ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Cấp độ Vip :</Label>
                                    <Input
                                        type="number"
                                        placeholder="Vip"
                                        name="conditions.level_vip"
                                        value={form.conditions?.level_vip ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Số ngày nạp tiền gần nhất: </Label>
                                    <Input
                                        type="number"
                                        placeholder="Số ngày nạp tiền gần nhất"
                                        name="conditions.last_day_deposit"
                                        value={form.conditions?.last_day_deposit ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Số ngày cược gần nhất:</Label>
                                    <Input
                                        type="number"
                                        placeholder="Số ngày cược gần nhất"
                                        name="conditions.last_day_bet"
                                        value={form.conditions?.last_day_bet ?? 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <h2>Có thể nhận thưởng sau bao nhiêu ngày ( Tổng cược ): </h2>
                            <div className="col-md-5">
                                <Label>Áp dụng thời gian cho tổng nạp: </Label>
                                <Switch
                                    label=""
                                    name="conditions.time_condition.status"
                                    checked={form.conditions.time_condition.status}
                                    onChange={(checked, name) => {
                                        setForm({
                                            ...form,
                                            conditions: {
                                                ...form.conditions,
                                                time_condition: {
                                                    ...form.conditions.time_condition,
                                                    status: checked,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Thời gian bắt đầu: </Label>
                                    <DatePicker
                                        selected={form.conditions.time_condition.start_timestamp ? toVietnamDate(new Date(form.conditions.time_condition.start_timestamp)) : null}
                                        onChange={(date) => handleDateChange(date, "conditions.time_condition.start_timestamp")}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="border p-2 rounded"
                                        name="conditions.time_condition"
                                    />
                                </div>
                                <div className="col-md-8">
                                    <Label>Thời gian kết thúc :</Label>
                                    <DatePicker
                                        selected={form.conditions.time_condition.end_timestamp ? toVietnamDate(new Date(form.conditions.time_condition.end_timestamp)) : null}
                                        onChange={(date) => handleDateChange(date, "conditions.time_condition.end_timestamp")}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className="border p-2 rounded"
                                        name="conditions.time_condition.end_timestamp"
                                    />
                                </div>
                            </div>
                            <br />

                            {modalType === "update" && (
                                <>
                                    <h2>Tạo thêm nhiều mẫu sản phẩm từ sản phẩm chính: </h2>
                                    {form.details.map((item, index) => (
                                        <div key={index} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
                                            <input
                                                placeholder="Color"
                                                value={item.color}
                                                onChange={(e) => handleDetailChange(index, 'color', e.target.value)}
                                            />
                                            <input
                                                placeholder="Size"
                                                value={item.size}
                                                onChange={(e) => handleDetailChange(index, 'size', e.target.value)}
                                            />
                                            <input
                                                placeholder="Stock"
                                                type="number"
                                                value={item.stock}
                                                onChange={(e) => handleDetailChange(index, 'stock', parseInt(e.target.value) || 0)}
                                            />
                                            <label>
                                                Status:
                                                <input
                                                    type="checkbox"
                                                    className="w-5"
                                                    checked={item.status}
                                                    onChange={(e) => handleDetailChange(index, 'status', e.target.checked)}
                                                />
                                            </label>

                                            <button type="button" className="bg-red-500 p-3 text-white rounded-lg" onClick={() => removeDetailItem(index)} style={{ marginLeft: '50px' }}>Xóa</button>
                                        </div>
                                    ))}

                                    <button type="button" onClick={addDetailItem}>+ Thêm phân sản phẩm con</button>
                                </>
                            )}


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
                </div >
            </Modal >
        </>
    );
}
