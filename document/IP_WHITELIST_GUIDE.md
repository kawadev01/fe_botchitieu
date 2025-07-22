# 🛡️ Hướng dẫn IP Whitelist Module

## 🎯 Tổng quan

Module IP Whitelist cho phép kiểm soát truy cập dựa trên địa chỉ IP của client. Hệ thống hỗ trợ nhiều định dạng IP và có thể được áp dụng cho từng site cụ thể.

## ✨ Tính năng

- **🔐 Kiểm soát truy cập theo IP**: Chỉ cho phép IP được whitelist truy cập
- **📍 Hỗ trợ nhiều định dạng IP**:
  - Single IP: `192.168.1.100`
  - IP Range: `192.168.1.1-192.168.1.100`
  - CIDR: `192.168.1.0/24`
- **🏢 Multi-site support**: Quản lý whitelist cho từng site riêng biệt
- **⏰ Hết hạn tự động**: Thiết lập thời gian hết hạn cho IP
- **📊 Thống kê và báo cáo**: Theo dõi usage và hiệu quả
- **🚀 Bulk operations**: Tạo/cập nhật nhiều IP cùng lúc

## 🗄️ Database Schema

```typescript
{
  name: string;              // Tên mô tả
  ipAddress: string;         // IP/Range/CIDR
  type: 'single'|'range'|'cidr';
  description?: string;      // Mô tả chi tiết
  status: 'active'|'inactive';
  site: string;             // Site áp dụng
  createdBy: string;        // Username người tạo
  updatedBy?: string;       // Username người cập nhật
  expiresAt?: Date;         // Ngày hết hạn
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 API Endpoints

### Quản lý IP Whitelist

```bash
# Tạo IP whitelist mới
POST /api/v1/ip-whitelist
{
  "name": "Office Network",
  "ipAddress": "192.168.1.100",
  "type": "single",
  "description": "IP văn phòng chính",
  "site": "mb66",
  "status": "active"
}

# Lấy danh sách với filter
GET /api/v1/ip-whitelist?page=1&limit=10&site=mb66&status=active

# Lấy thông tin chi tiết
GET /api/v1/ip-whitelist/:id

# Cập nhật IP whitelist
PATCH /api/v1/ip-whitelist/:id
{
  "status": "inactive",
  "description": "Tạm ngưng sử dụng"
}

# Xóa IP whitelist
DELETE /api/v1/ip-whitelist/:id
```

### Kiểm tra và thống kê

```bash
# Kiểm tra IP có được phép không
GET /api/v1/ip-whitelist/check/192.168.1.100?site=mb66

# Lấy thống kê
GET /api/v1/ip-whitelist/statistics?site=mb66
```

### Bulk Operations

```bash
# Tạo nhiều IP cùng lúc
POST /api/v1/ip-whitelist/bulk-create
[
  {
    "name": "Office Range",
    "ipAddress": "192.168.1.0/24",
    "type": "cidr",
    "site": "mb66"
  },
  {
    "name": "VPN Server",
    "ipAddress": "10.0.0.100",
    "type": "single",
    "site": "mb66"
  }
]

# Cập nhật trạng thái nhiều IP
PATCH /api/v1/ip-whitelist/bulk-update-status
{
  "ids": ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"],
  "status": "inactive"
}
```

## 🛠️ Sử dụng Guard

### Áp dụng IP Whitelist Guard

```typescript
import { IpWhitelistGuard, IpWhitelistSite, SkipIpWhitelist } from './modules/ip-whitelist/guards/ip-whitelist.guard';

@Controller('protected')
@UseGuards(JwtAuthGuard, IpWhitelistGuard) // Áp dụng cho toàn controller
export class ProtectedController {
  
  @Get('data')
  @IpWhitelistSite('mb66') // Chỉ định site cụ thể
  getData() {
    return { message: 'Data chỉ dành cho IP được whitelist' };
  }
  
  @Get('public')
  @SkipIpWhitelist() // Bỏ qua kiểm tra IP whitelist
  getPublicData() {
    return { message: 'Data công khai' };
  }
}
```

### Global Guard (tùy chọn)

```typescript
// main.ts
import { IpWhitelistGuard } from './modules/ip-whitelist/guards/ip-whitelist.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Áp dụng IP whitelist cho toàn bộ app
  app.useGlobalGuards(app.get(IpWhitelistGuard));
  
  await app.listen(3000);
}
```

## ⚙️ Cấu hình

### Environment Variables

```bash
# IP Whitelist Configuration
IP_WHITELIST_ENABLED=true           # Bật/tắt tính năng
IP_WHITELIST_ALLOW_ON_ERROR=true    # Cho phép truy cập khi có lỗi hệ thống
```

### Configuration

```typescript
// src/config/configuration.ts
export default () => ({
  // ...
  ipWhitelist: {
    enabled: process.env['IP_WHITELIST_ENABLED'] === 'true',
    allowOnError: process.env['IP_WHITELIST_ALLOW_ON_ERROR'] === 'true',
  },
});
```

## 📝 Ví dụ sử dụng

### 1. Thêm IP văn phòng

```bash
curl -X POST http://localhost:9000/api/v1/ip-whitelist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Văn phòng HCM",
    "ipAddress": "203.113.xxx.xxx",
    "type": "single",
    "description": "IP tĩnh văn phòng TP.HCM",
    "site": "mb66",
    "status": "active"
  }'
```

### 2. Thêm dải IP cho công ty

```bash
curl -X POST http://localhost:9000/api/v1/ip-whitelist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mạng nội bộ công ty",
    "ipAddress": "192.168.1.0/24",
    "type": "cidr",
    "description": "Toàn bộ mạng LAN công ty",
    "site": "mb66",
    "status": "active"
  }'
```

### 3. Thêm IP tạm thời có hạn

```bash
curl -X POST http://localhost:9000/api/v1/ip-whitelist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IP khách hàng VIP",
    "ipAddress": "1.2.3.4",
    "type": "single",
    "description": "Truy cập đặc biệt cho khách VIP",
    "site": "mb66",
    "status": "active",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }'
```

### 4. Kiểm tra IP

```bash
curl -X GET "http://localhost:9000/api/v1/ip-whitelist/check/192.168.1.100?site=mb66" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "message": "Kiểm tra IP thành công",
  "data": {
    "ip": "192.168.1.100",
    "site": "mb66",
    "isAllowed": true,
    "status": "ALLOWED"
  }
}
```

## 🔍 Logic kiểm tra IP

### Thứ tự kiểm tra

1. **Skip decorator**: Nếu có `@SkipIpWhitelist()`, bỏ qua kiểm tra
2. **Lấy site**: Từ `@IpWhitelistSite()` hoặc config mặc định
3. **Extract client IP**: Từ headers (X-Forwarded-For, X-Real-IP, v.v.)
4. **Query database**: Lấy tất cả IP whitelist active cho site
5. **Match IP**: Kiểm tra client IP với từng entry
6. **Return result**: Allow/Deny

### IP Matching Logic

- **Single IP**: So sánh exact match
- **IP Range**: Convert to number và kiểm tra trong khoảng
- **CIDR**: Sử dụng subnet mask để kiểm tra

### Fallback khi lỗi

- Nếu `allowOnError = true`: Cho phép truy cập
- Nếu `allowOnError = false`: Từ chối truy cập

## 🚨 Lưu ý bảo mật

1. **Không có IP whitelist = Cho phép tất cả**: Nếu không có entry nào, system sẽ allow all
2. **IP Detection**: Hệ thống ưu tiên headers từ proxy/load balancer
3. **Error Handling**: Cấu hình `allowOnError` phù hợp với môi trường
4. **Audit Log**: Tất cả hoạt động đều được log

## 🔧 Troubleshooting

### IP không được nhận dạng đúng

```typescript
// Kiểm tra headers request
const headers = request.headers;
console.log('X-Forwarded-For:', headers['x-forwarded-for']);
console.log('X-Real-IP:', headers['x-real-ip']);
console.log('CF-Connecting-IP:', headers['cf-connecting-ip']);
```

### CIDR không hoạt động

```bash
# Kiểm tra CIDR format
192.168.1.0/24  ✅ Đúng
192.168.1.1/24  ❌ Sai (phải là network address)
```

### Range IP không hợp lệ

```bash
# Kiểm tra range format
192.168.1.1-192.168.1.100  ✅ Đúng
192.168.1.100-192.168.1.1  ❌ Sai (start > end)
```

## 📈 Performance Tips

1. **Index database**: Các field thường query đã được index sẵn
2. **Cache results**: Consider caching IP check results
3. **Bulk operations**: Sử dụng bulk APIs cho operations lớn
4. **Regular cleanup**: Xóa các entry đã hết hạn

## 🎛️ Admin Operations

### Xem thống kê tổng quan

```bash
curl -X GET "http://localhost:9000/api/v1/ip-whitelist/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Export/Import IP list

```bash
# Export (thông qua API list với limit lớn)
curl -X GET "http://localhost:9000/api/v1/ip-whitelist?limit=1000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" > ip_whitelist_backup.json

# Import (thông qua bulk-create API)
curl -X POST http://localhost:9000/api/v1/ip-whitelist/bulk-create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @ip_whitelist_data.json
```

## 🎯 Best Practices

1. **Naming Convention**: Sử dụng tên mô tả rõ ràng
2. **Documentation**: Ghi chú description chi tiết
3. **Expiry Dates**: Thiết lập thời hạn cho IP tạm thời
4. **Regular Review**: Kiểm tra và làm sạch danh sách định kỳ
5. **Monitoring**: Theo dõi logs và thống kê
6. **Backup**: Sao lưu cấu hình whitelist thường xuyên

---

## ⚡ Quick Start

1. **Tạo IP đầu tiên**:
```bash
npm run start:dev
# Đăng nhập để lấy JWT token
# Gọi API tạo IP whitelist
```

2. **Test IP checking**:
```bash
# Áp dụng guard cho controller
# Test với IP được whitelist và không được whitelist
```

3. **Monitor logs**:
```bash
# Kiểm tra logs để xem IP access patterns
tail -f logs/application.log | grep "IP whitelist"
```

Module IP Whitelist đã sẵn sàng sử dụng! 🚀 