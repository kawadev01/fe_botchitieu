import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useMultiModal } from "@/hooks/useMultiModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import settingWebServices from '@/services/settingWebServices';
import { getSiteSystem } from "@/utils/storage";
import { useAuth } from "@/context/AuthContext";

const initialForm = {
    _id: null,
    site: getSiteSystem(),
    time_zone: '',
    created_by: '',
    site_active: true,
    home_url: '',
    register_url: '',
    login_url: '',
    cskh_url: '',
    daily_url: '',
    vip_url: '',
    promotion_url: '',
    facebook_url: '',
    youtube_url: '',
    telegram_url: '',
    banner: '',
    sub_banner: '',
    notification: '',
    updated_by: ''
};

export default function SettingWebTable() {
    const { user } = useAuth();
    const { isOpen, modalType, openModal, closeModal } = useMultiModal();
    type SettingForm = typeof initialForm;
    const [form, setForm] = useState<SettingForm>(initialForm);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editSettingId, setEditSettingId] = useState(null);
    const [filters, setFilters] = useState({
        ip: '',
    });

    useEffect(() => {
        if (isOpen) {
            setError('');
        }
    }, [isOpen, modalType]);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            form.created_by = user?.username ?? "Admin";
            res = await settingWebServices.postSetting(form);
            if (res.status_code == 200) {
                fetchSettingWeb(getSiteSystem() || "");
            } else {
                alert(res.message)
            }

        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            let res;
            form.updated_by = user?.username ?? "Admin";
            res = await settingWebServices.update(form, getSiteSystem());

            if (res.status_code == 200) {
                fetchSettingWeb(getSiteSystem() || "");
            } else {
                toast.error(res.message)
            }
        } catch (err) {
            setError('Thao tác thất bại. Vui lòng kiểm tra thông tin.');
        }
    };

    const deleteSetting = async (site: string) => {
        try {
            await settingWebServices.delete(site);
            fetchSettingWeb(getSiteSystem() || "");
        } catch (err) {
            setError('Xóa người dùng thất bại. Vui lòng kiểm tra thông tin.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;
        const checked = 'checked' in target ? (target as HTMLInputElement).checked : undefined;

        setForm((prev) => ({
            ...prev,
            [name]: name === 'site_active'
                ? (type === 'checkbox' ? checked : value === 'true')
                : value,
        }));
    };

    const fetchSettingWeb = async (site: string) => {
        try {
            const settingWeb = await settingWebServices.getBySite(site);

            setForm(prev => ({
                ...prev,
                ...settingWeb.data
            }));
        } catch (err) {
            console.error("Lỗi lấy dữ liệu review", err);
        }
    }

    useEffect(() => {
        fetchSettingWeb(getSiteSystem() || "");
    }, []);

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="m-5">

                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Cấu hình cài đặt Website
                        </h4>
                    </div>

                    <form className="flex flex-col"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (form._id) {
                                handleUpdate(e);
                            } else {
                                handleAdd(e);
                            }
                        }}
                    >
                        <div className="custom-scrollbar h-[100%] overflow-y-auto px-2 pb-3">
                            <br />
                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Múi giờ</Label>
                                    <Input
                                        type="text"
                                        placeholder="Múi giờ (...)"
                                        value={form.time_zone || ""}
                                        name="time_zone"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Bảo trì / Hoạt động</Label>
                                    <Label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="site_active"
                                            className="sr-only peer"
                                            checked={form.site_active}
                                            onChange={handleChange}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                        peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700
                                         peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                                          peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                                          after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                                          after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                                           dark:peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ẩn/Hiện</span>
                                    </Label>
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Url Home</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link trang chủ"
                                        value={form.home_url || ""}
                                        name="home_url"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Url đăng ký</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link đăng ký"
                                        value={form.register_url || ""}
                                        name="register_url"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-8">
                                    <Label>Url đăng nhập</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link đăng nhập"
                                        value={form.login_url || ""}
                                        name="login_url"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-5">
                                    <Label>Url CSKH</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link CSKH"
                                        value={form.cskh_url || ""}
                                        name="cskh_url"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Url đại lý</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link đại lý"
                                        value={form.daily_url || ""}
                                        name="daily_url"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-8">
                                    <Label>Url cấp vip</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link cấp độ Vip"
                                        value={form.vip_url || ""}
                                        name="vip_url"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Url quà tặng</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link quà tặng"
                                        value={form.promotion_url || ""}
                                        name="promotion_url"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-8">
                                    <Label>Url facebook</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link FaceBook"
                                        value={form.facebook_url || ""}
                                        name="facebook_url"
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Url Youtube</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link Youtube"
                                        value={form.youtube_url || ""}
                                        name="youtube_url"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-8">
                                    <Label>Url Telegram</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link Telegram"
                                        value={form.telegram_url || ""}
                                        name="telegram_url"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div className="grid md:grid-cols-2 md:gap-6">
                                <div className="col-md-5">
                                    <Label>Banner chính</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link banner Chính"
                                        value={form.banner || ""}
                                        name="banner"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-8">
                                    <Label>Banner phụ</Label>
                                    <Input
                                        type="text"
                                        placeholder="Link Banner phụ"
                                        value={form.sub_banner || ""}
                                        name="sub_banner"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <br />

                            <div>
                                <Label>Thông báo</Label>
                                <div className="relative">
                                    <textarea name="notification"
                                        value={form.notification || ""}
                                        id="notification"
                                        rows={3}
                                        onChange={handleChange}
                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300
                                         focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600
                                          dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Thông báo ...">
                                    </textarea>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={() => deleteSetting(form.site ?? '')}>
                                Xóa thiết lập
                            </Button>

                            <Button size="sm" type="submit">
                                {loading ? 'Đang xử lý...' : 'Lưu thông tin'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Form */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">

                </div>
            </Modal>
        </>
    );
}
