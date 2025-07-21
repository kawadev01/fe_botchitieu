
# Tài liệu API - Quản lý Người dùng (`/api/v1/users`)

Tài liệu này mô tả các API endpoint để quản lý người dùng trong hệ thống. Tất cả các endpoint đều yêu cầu xác thực bằng JWT Bearer Token.

**Quyền truy cập:**
- `SUPERADMIN`: Có toàn quyền trên tất cả các endpoint.
- `ADMIN`: Có quyền tạo, xem, cập nhật người dùng. Không có quyền xóa.

---

## 1. Lấy danh sách người dùng (Phân trang và Lọc)

- **Method:** `GET`
- **Endpoint:** `/api/v1/users`
- **Mô tả:** Lấy danh sách người dùng với khả năng phân trang và lọc theo nhiều tiêu chí.
- **Quyền:** `SUPERADMIN`, `ADMIN`

#### Tham số Query (Query Parameters):

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
| --- | --- | --- | --- | --- |
| `page` | `number` | Không | `1` | Số trang hiện tại. |
| `limit` | `number` | Không | `10` | Số lượng kết quả trên mỗi trang. |
| `username` | `string` | Không | | Lọc theo tên đăng nhập (tìm kiếm gần đúng, không phân biệt hoa thường). |
| `role` | `string` | Không | | Lọc theo vai trò (`superadmin`, `admin`, `user`). |
| `site` | `string` | Không | | Lọc theo trang web (site) của người dùng. |
| `status` | `string` | Không | | Lọc theo trạng thái (`true` hoặc `false`). |

#### Phản hồi thành công (Success Response - `200 OK`):

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "username": "admin_site_a",
        "site": "site-a.com",
        "role": "admin",
        "status": true,
        "createdAt": "2024-07-28T12:00:00.000Z",
        "updatedAt": "2024-07-28T12:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "message": "Thành công",
  "timestamp": "2024-07-28T12:00:00.000Z"
}
```

---

## 2. Tạo người dùng mới

- **Method:** `POST`
- **Endpoint:** `/api/v1/users`
- **Mô tả:** Tạo một người dùng mới.
- **Quyền:** `SUPERADMIN`, `ADMIN`

#### Body Request:

```json
{
  "username": "newuser",
  "password": "SecurePassword123!",
  "site": "example.com",
  "role": "user",
  "status": true
}
```
*(Lưu ý: `CreateUserDto` được sử dụng ở đây)*

#### Phản hồi thành công (Success Response - `201 Created`):

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "username": "newuser",
    "site": "example.com",
    "role": "user",
    "status": true,
    "createdAt": "2024-07-28T12:05:00.000Z",
    "updatedAt": "2024-07-28T12:05:00.000Z"
  },
  "message": "Thành công",
  "timestamp": "2024-07-28T12:05:00.000Z"
}
```

#### Phản hồi lỗi (Error Responses):
- `400 Bad Request`: Dữ liệu không hợp lệ.
- `401 Unauthorized`: Không có quyền truy cập.
- `409 Conflict`: `username` đã tồn tại trong site này.

---

## 3. Lấy thông tin người dùng theo ID

- **Method:** `GET`
- **Endpoint:** `/api/v1/users/:id`
- **Mô tả:** Lấy thông tin chi tiết của một người dùng dựa trên ID.
- **Quyền:** `SUPERADMIN`, `ADMIN`

#### Tham số Path (Path Parameters):
| Tên | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | `string` | ID của người dùng (MongoDB ObjectId). |

#### Phản hồi thành công (Success Response - `200 OK`):

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "username": "newuser",
    "site": "example.com",
    "role": "user",
    "status": true,
    "createdAt": "2024-07-28T12:05:00.000Z",
    "updatedAt": "2024-07-28T12:05:00.000Z"
  },
  "message": "Thành công",
  "timestamp": "2024-07-28T12:10:00.000Z"
}
```

#### Phản hồi lỗi (Error Responses):
- `401 Unauthorized`: Không có quyền truy cập.
- `404 Not Found`: Không tìm thấy người dùng với ID đã cho.

---

## 4. Cập nhật thông tin người dùng

- **Method:** `PATCH`
- **Endpoint:** `/api/v1/users/:id`
- **Mô tả:** Cập nhật thông tin của một người dùng. Chỉ các trường được cung cấp trong body sẽ được cập nhật.
- **Quyền:** `SUPERADMIN`, `ADMIN`

#### Tham số Path (Path Parameters):
| Tên | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | `string` | ID của người dùng cần cập nhật. |

#### Body Request:

```json
{
  "role": "admin",
  "status": false
}
```
*(Lưu ý: `UpdateUserDto` được sử dụng ở đây, tất cả các trường đều là tùy chọn)*

#### Phản hồi thành công (Success Response - `200 OK`):

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "username": "newuser",
    "site": "example.com",
    "role": "admin",
    "status": false,
    "createdAt": "2024-07-28T12:05:00.000Z",
    "updatedAt": "2024-07-28T12:15:00.000Z"
  },
  "message": "Thành công",
  "timestamp": "2024-07-28T12:15:00.000Z"
}
```

#### Phản hồi lỗi (Error Responses):
- `400 Bad Request`: Dữ liệu không hợp lệ.
- `401 Unauthorized`: Không có quyền truy cập.
- `404 Not Found`: Không tìm thấy người dùng với ID đã cho.
- `409 Conflict`: `username` cập nhật đã tồn tại trong site.

---

## 5. Xóa người dùng

- **Method:** `DELETE`
- **Endpoint:** `/api/v1/users/:id`
- **Mô tả:** Xóa một người dùng khỏi hệ thống.
- **Quyền:** `SUPERADMIN`

#### Tham số Path (Path Parameters):
| Tên | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | `string` | ID của người dùng cần xóa. |

#### Phản hồi thành công (Success Response - `200 OK`):

```json
{
  "success": true,
  "data": {
    "message": "Đã xóa user với ID \"60d0fe4f5311236168a109cb\""
  },
  "message": "Thành công",
  "timestamp": "2024-07-28T12:20:00.000Z"
}
```

#### Phản hồi lỗi (Error Responses):
- `401 Unauthorized`: Không có quyền truy cập.
- `404 Not Found`: Không tìm thấy người dùng với ID đã cho.

--- 