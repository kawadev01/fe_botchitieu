"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    query?: Record<string, string>;
    pro?: boolean;
    new?: boolean,
    permission?: string,
    role?: ("user" | "admin" | "superadmin")[];
  }[];
};

const navItems: NavItem[] = [
  {
    name: "Quản lý truy cập",
    icon: <UserCircleIcon />,
    subItems: [
      {
        name: "Tài khoản",
        path: "/admin/user",
        pro: false,
        role: ["admin","superadmin"],
      },
      {
        name: "Whitelist IP",
        path: "/admin/ip_whitelist",
        pro: false,
        role: ["superadmin"],
      }
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Quản lý của hàng",
    icon: <ListIcon />,
    subItems: [
      {
        name: "Setting sản phẩm",
        path: "/admin/products",
        pro: false,
        role: ["admin", "superadmin"],
      },
      {
        name: "Duyệt đơn sản phẩm",
        path: "/admin/orders",
        query: { type_register: "product" },
        role: ["user", "admin", "superadmin"],
      },
      {
        name: "Ủng hộ từ thiện",
        path: "/admin/orders",
        query: { type_register: "donate" },
        role: ["user", "admin", "superadmin"],
      },
      {
        name: "GIFTCODE đã phát",
        path: "/admin/orders",
        query: { type_register: "giftcode" },
        role: ["user", "admin", "superadmin"],
      },
    ],
  },
  {
    name: "Quản lý thiết lập",
    icon: <TableIcon />,
    subItems: [
      {
        name: "Setting thời gian sự kiện",
        path: "/admin/sesstionsPoint",
        pro: false,
        role: ["admin", "superadmin"],
      },
      {
        name: "Setting Nội dung thư gửi",
        path: "/admin/templateMessages",
        pro: false,
        role: ["admin", "superadmin"],
      },
      {
        name: "Danh sách đánh giá SP",
        path: "/admin/reviews",
        pro: false,
        role: ["admin", "superadmin"],
      },
      {
        name: "Kiểm tra khách hàng",
        path: "/admin/customer",
        pro: false,
        role: ["admin", "superadmin"],
      },
      {
        name: "Setting toàn cục Webiste",
        path: "/admin/settingWeb",
        pro: false,
        role: ["admin", "superadmin"],
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const currentUserRole = user?.role ?? "user";

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string, query?: Record<string, string>): boolean => {
      if (pathname !== path) return false;
      if (!query) return true;
      return Object.entries(query).every(
        ([key, value]) => searchParams.get(key) === value
      );
    },
    [pathname, searchParams]
  );

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems
        .map((nav) => {
          const filteredSubItems = nav.subItems?.filter((subItem) =>
            subItem.role?.includes(currentUserRole as 'user' | 'admin' | 'superadmin')
          );
          if (!filteredSubItems || filteredSubItems.length === 0) return null;
          return { ...nav, subItems: filteredSubItems };
        })
        .filter(Boolean)
        .map((nav, index) => (
          <li key={nav?.name}>
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType &&
                openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`${openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav?.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav?.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>

            {/* Subitems */}
            {nav?.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={{
                          pathname: subItem.path,
                          query: subItem.query,
                        }}
                        className={`menu-dropdown-item ${isActive(
                          subItem.path,
                          subItem.query
                        )
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                          }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span className="menu-dropdown-badge">new</span>
                          )}
                          {subItem.pro && (
                            <span className="menu-dropdown-badge">pro</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  useEffect(() => {
    let matched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          if (isActive(subItem.path, subItem.query)) {
            setOpenSubmenu({ type: menuType as "main" | "others", index });
            matched = true;
          }
        });
      });
    });

    if (!matched) setOpenSubmenu(null);
  }, [pathname, searchParams, isActive]);

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex justify-center }`}
      >
        <div className="flex gap-2 items-center">
          {/* Hiển thị tên site từ AuthContext nếu có, fallback ATT - ADMIN */}
          {(isExpanded || isHovered || isMobileOpen) && (
            <div>
              {user?.site ? user.site.toUpperCase() + " - BOTCHITIEU" : "BOTCHITIEU"}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
