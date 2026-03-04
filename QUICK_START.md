# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN ĐẦY ĐỦ

## ✅ Setup đã hoàn thành

Dự án hiện đã có đầy đủ tính năng:
- ✅ Đọc dữ liệu trực tiếp từ Arduino qua Serial Port
- ✅ Serial Bridge Server (tách biệt với Next.js)
- ✅ Dashboard realtime với Turbopack
- ✅ Telegram Alert tự động khi có cảnh báo

---

## 📋 BƯỚC 1: SETUP TELEGRAM (TÙY CHỌN)

Nếu muốn nhận cảnh báo qua Telegram, xem file: [`docs/TELEGRAM_SETUP.md`](./docs/TELEGRAM_SETUP.md)

**Tóm tắt nhanh:**
1. Tạo bot với @BotFather → lấy Bot Token
2. Lấy Chat ID từ @userinfobot
3. Cập nhật `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

---

## 🔌 BƯỚC 2: KẾT NỐI ARDUINO

### 2.1. Kiểm tra Arduino đã cắm USB
```bash
npm run detect-arduino
```

Bạn sẽ thấy:
```
✅ Arduino detected!
👉 Dùng port này: /dev/ttyUSB0
```

### 2.2. Cấp quyền (Linux)
```bash
sudo chmod 666 /dev/ttyUSB0
```

Hoặc thêm user vào group dialout (cố định):
```bash
sudo usermod -a -G dialout $USER
# Sau đó logout và login lại
```

### 2.3. Test kết nối Serial
```bash
npm run test-serial
```

Nếu thấy dữ liệu như thế này → **Thành công!**
```
📊 Mẫu #1 - 5:03:40 PM
├─ Nhiệt độ: 26.7°C
├─ Độ ẩm: 59.5%
├─ Ánh sáng: 💡 Sáng (717)
...
```

Nhấn **Ctrl+C** để dừng test.

---

## 🚀 BƯỚC 3: CHẠY DỰ ÁN

### Cách 1: Chạy 2 lệnh riêng (khuyến nghị)

**Terminal 1 - Chạy Serial Bridge:**
```bash
npm run bridge
```

Đợi đến khi thấy:
```
✅ Kết nối Serial thành công!
📡 HTTP API: http://localhost:3001
```

**Terminal 2 - Chạy Next.js:**
```bash
npm run dev
```

### Cách 2: Chạy 1 lệnh (nếu đã cài concurrently)
```bash
npm run dev:full
```

---

## 🌐 BƯỚC 4: TRUY CẬP DASHBOARD

Mở trình duyệt và truy cập:

### Dashboard chính:
- **http://localhost:9002** - Trang chủ
- **http://localhost:9002/thoi-gian-thuc** - Monitoring realtime
- **http://localhost:9002/lich-su** - Lịch sử dữ liệu
- **http://localhost:9002/thiet-bi** - Quản lý thiết bị

### Serial Bridge Web UI:
- **http://localhost:3001** - Xem dữ liệu trực tiếp từ Arduino

---

## 📱 CẢNH BÁO TELEGRAM

### Khi nào nhận cảnh báo?

Hệ thống tự động gửi Telegram khi:

| Chỉ số | Điều kiện nguy hiểm |
|--------|---------------------|
| 🌡️ Nhiệt độ | < 18°C hoặc > 35°C |
| 💧 Độ ẩm | < 30% hoặc > 90% |
| 💨 Không khí | MQ135 > 300 ppm |
| 🔥 Gas/Khói | MQ-2 vượt ngưỡng |
| 💡 Ánh sáng | Quá sáng/tối |
| 🔊 Tiếng ồn | Quá ồn |

### Tính năng chống spam:
- Mỗi loại cảnh báo chỉ gửi lại sau **5 phút**
- Không spam nếu chỉ số dao động nhẹ

### Ví dụ tin nhắn nhận được:
```
🚨 CẢNH BÁO MÔI TRƯỜNG - Nam Dương Office

🔴 Trạng thái: Nguy hiểm
📊 Comfort Index: 35/100

⚠️ Các chỉ số cảnh báo:

🌡️ Nhiệt độ: 🔴 Nguy hiểm
   Giá trị: 37.5°C

💡 Hành động đề xuất:
• Bật điều hòa hoặc quạt
```

---

## 🛠️ CÁC LỆNH HỮU ÍCH

```bash
# Phát hiện Arduino port
npm run detect-arduino

# Test Serial connection
npm run test-serial

# Chạy Serial Bridge
npm run bridge

# Chạy Next.js
npm run dev

# Chạy cả 2 cùng lúc (nếu có concurrently)
npm run dev:full

# Build production
npm run build

# Chạy production
npm start
```

---

## 📊 LUỒNG DỮ LIỆU

```
[Arduino UNO]
     ↓ (Serial 9600 baud)
     ↓ JSON every 2s
     ↓
[Serial Bridge Server]
     ↓ (HTTP :3001/data)
     ↓
[Next.js API]
     ↓ (Process & Analyze)
     ├──→ [Web Dashboard] (Realtime display)
     ├──→ [Firebase] (History storage)
     └──→ [Telegram Bot] (Alerts)
```

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "Device or resource busy"
→ Arduino đang được dùng bởi chương trình khác
```bash
# Đóng Arduino IDE Serial Monitor
# Hoặc kill process:
sudo fuser -k /dev/ttyUSB0
```

### ❌ Lỗi: "Permission denied"
→ Chưa có quyền truy cập Serial Port
```bash
sudo chmod 666 /dev/ttyUSB0
```

### ❌ Dashboard không hiển thị dữ liệu
1. Kiểm tra Bridge Server đang chạy: http://localhost:3001/status
2. Kiểm tra Arduino gửi data trong Serial Monitor
3. Xem console logs trong terminal

### ❌ Telegram không gửi
1. Kiểm tra Bot Token và Chat ID trong `.env.local`
2. Đã gửi `/start` cho bot chưa?
3. Xem logs trong terminal Next.js

---

## 📁 CẤU TRÚC DỰ ÁN

```
/
├── serial-bridge.js          ← Serial to HTTP Bridge
├── arduino/
│   └── iot_sensor_optimized.ino  ← Arduino firmware
├── src/
│   ├── app/
│   │   └── api/sensor-data/  ← API endpoint
│   ├── lib/
│   │   ├── sensor-processor.ts   ← Logic xử lý
│   │   └── telegram-service.js   ← Telegram alerts
│   └── components/           ← UI components
├── scripts/
│   ├── detect-arduino.js     ← Tìm Arduino port
│   └── test-serial.js        ← Test Serial
└── docs/
    ├── TELEGRAM_SETUP.md     ← Hướng dẫn Telegram
    └── blueprint.md          ← Tài liệu dự án
```

---

## 🎯 CHECKLIST KHỞI ĐỘNG

- [ ] Arduino đã upload code `iot_sensor_optimized.ino`
- [ ] Arduino cắm USB và phát hiện được port
- [ ] Đã cấp quyền truy cập Serial Port (Linux)
- [ ] Test serial thành công (`npm run test-serial`)
- [ ] (Tùy chọn) Đã setup Telegram Bot Token & Chat ID
- [ ] Chạy Bridge Server (`npm run bridge`)
- [ ] Chạy Next.js (`npm run dev`)
- [ ] Truy cập http://localhost:9002 thành công
- [ ] Dashboard hiển thị dữ liệu realtime

---

## 🆘 HỖ TRỢ

### Xem logs:
- Bridge Server: Terminal chạy `npm run bridge`
- Next.js: Terminal chạy `npm run dev`
- Browser: F12 → Console tab

### Test từng phần:
1. Arduino Serial Monitor → Xem JSON output
2. Bridge API → http://localhost:3001/data
3. Next.js API → http://localhost:9002/api/sensor-data
4. Dashboard → http://localhost:9002/thoi-gian-thuc

---

**🎉 Chúc bạn triển khai thành công!**

*Cập nhật: 02/03/2026*
