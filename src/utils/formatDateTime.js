export function formatDateTimeVN(date) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Invalid date:", date);
    return "";
  }
}

export function toVietnamDate(date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const offset = 7 * 60 * 60000; // +7 giờ
  return new Date(utc + offset);
}