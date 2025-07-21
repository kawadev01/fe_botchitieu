import { UserStatus } from "@/types/user";

// Mapping giữa enum values và display labels
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "Hoạt động",
  [UserStatus.INACTIVE]: "Tạm ngừng",
};

// Mapping giữa boolean values và UserStatus enum
export const BOOLEAN_TO_STATUS_MAP: Record<string, UserStatus> = {
  'true': UserStatus.ACTIVE,
  'false': UserStatus.INACTIVE,
};

// Mapping giữa UserStatus enum và boolean values
export const STATUS_TO_BOOLEAN_MAP: Record<UserStatus, boolean> = {
  [UserStatus.ACTIVE]: true,
  [UserStatus.INACTIVE]: false,
};

// Helper function để lấy tất cả status options cho dropdown
export const getUserStatusOptions = () => [
  { value: 'true', label: USER_STATUS_LABELS[UserStatus.ACTIVE] },
  { value: 'false', label: USER_STATUS_LABELS[UserStatus.INACTIVE] },
];

// Validation function để kiểm tra status hợp lệ
export const isValidUserStatus = (status: string): status is keyof typeof UserStatus => {
  return Object.values(UserStatus).includes(status as UserStatus);
}; 