export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin', 
  SUPERADMIN = 'superadmin',
}

export interface User {
  _id: string;
  username: string;
  site: string;
  role: string; // API trả về string, không phải enum
  status: string; // Thay đổi từ boolean thành string
  createdAt: string;
  updatedAt: string;
}

// Helper functions để xử lý status
export const isActiveStatus = (status: string): boolean => {
  return status === UserStatus.ACTIVE;
};

export const getStatusLabel = (status: string): string => {
  return status === UserStatus.ACTIVE ? 'Hoạt động' : 'Tạm ngừng';
};

export const toggleStatus = (currentStatus: string): string => {
  return currentStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
}; 