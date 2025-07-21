"use client";

import React, { useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen, } = useSidebar();
  const { user, isLoading, refreshUser} = useAuth();
  const router = useRouter();

  // Xử lý margin layout khi sidebar thay đổi
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Điều hướng nếu không có user sau khi load xong
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Trạng thái loading khi chưa có thông tin user
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Nếu user null (dù đã load) thì tránh render layout
  if (!user) return null;

  return (
    <>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          <AppHeader />
          <div className="p-0 mx-auto w-full md:p-2">{children}</div>
        </div>
      </div>

      <ToastContainer position="top-right" className="!top-25" autoClose={3000} />
    </>
  );
}