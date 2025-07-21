import { siteMapping } from "@/lib/baseApi";

/**
 * Lấy key hệ thống site dựa trên hostname hiện tại.
 * Luôn trả về một string. Mặc định là chuỗi rỗng nếu không tìm thấy.
 */
export const getSiteSystem = (): string => {
  if (typeof window === "undefined") return ''; // Trả về chuỗi rỗng ở phía server
  // Sử dụng destructuring để lấy nhanh giá trị
  const { hostname } = window.location;
  return siteMapping[hostname] || ''; // Trả về site key hoặc chuỗi rỗng nếu không tìm thấy
};
