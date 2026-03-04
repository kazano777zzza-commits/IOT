# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN IOT GIÁM SÁT MÔI TRƯỜNG

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt phần cứng (Hardware)](#cài-đặt-phần-cứng)
3. [Cài đặt phần mềm (Software)](#cài-đặt-phần-mềm)
4. [Chạy dự án](#chạy-dự-án)
5. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)
6. [Tính năng và sử dụng](#tính-năng-và-sử-dụng)

---

## 🔧 YÊU CẦU HỆ THỐNG

### Phần cứng cần thiết:
- **Arduino UNO** (hoặc tương thích)
- **ESP8266** (NodeMCU/Wemos D1 Mini)
- **Cảm biến DHT22** - Nhiệt độ & Độ ẩm
- **Sound Sensor (Analog)** - Cảm biến tiếng ồn
- **Light Sensor (Analog)** - Cảm biến ánh sáng
- **MQ-2** - Cảm biến khí gas/khói
- **MQ-135** - Cảm biến chất lượng không khí
- Dây jumper, breadboard, cáp USB

### Phần mềm cần cài:
- **Node.js** >= 18.0 (khuyến nghị v20+)
- **npm** hoặc **yarn** hoặc **pnpm**
- **Arduino IDE** >= 1.8.x hoặc **Arduino IDE 2.x**
- **Git** (tùy chọn)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge)

---

## ⚡ CÀI ĐẶT PHẦN CỨNG

### Bước 1: Kết nối cảm biến với Arduino UNO

```
┌─────────────────────────────────────────────┐
│           ARDUINO UNO PIN MAPPING           │
├─────────────────┬───────────────────────────┤
│ DHT22           │ Digital Pin 2 (D2)        │
│ Sound Sensor AO │ Analog Pin A0             │
│ Light Sensor AO │ Analog Pin A1             │
│ MQ-2 AO         │ Analog Pin A3             │
│ MQ-135 AO       │ Analog Pin A4             │
│ VCC (All)       │ 5V                        │
│ GND (All)       │ GND                       │
└─────────────────┴───────────────────────────┘
```

### Bước 2: Upload code lên Arduino

1. Mở **Arduino IDE**

2. Cài đặt thư viện cần thiết:
   - Vào `Sketch` → `Include Library` → `Manage Libraries`
   - Tìm và cài đặt: **DHT sensor library** by Adafruit

3. Mở file: `arduino/iot_sensor_optimized.ino`

4. Chọn board và port:
   - `Tools` → `Board` → `Arduino UNO`
   - `Tools` → `Port` → Chọn port COM (Windows) hoặc /dev/ttyUSB0 (Linux)

5. Nhấn nút **Upload** (→)

6. Mở **Serial Monitor** (`Ctrl+Shift+M`) để kiểm tra:
   - Baud rate: **9600**
   - Bạn sẽ thấy JSON data mỗi 2 giây:
   ```json
   {"sound":0,"sound_value":123,"sound_msg":"Yen lang","light":1,"light_value":567,...}
   ```

### Bước 3: Kết nối Arduino với ESP8266

```
Arduino UNO (TX/RX) ←→ ESP8266 (RX/TX)
Arduino GND        ←→ ESP8266 GND
```

**LƯU Ý**: ESP8266 hoạt động ở 3.3V, cần dùng voltage divider cho TX/RX nếu cần!

### Bước 4: Cấu hình ESP8266

ESP8266 sẽ:
- Đọc JSON từ Arduino qua Serial (9600 baud)
- Tạo WiFi Access Point: **SSID mặc định** (cần cấu hình trong code ESP)
- Chạy HTTP server trên: `http://192.168.4.1`
- Endpoint: `http://192.168.4.1/log` trả về JSON data

**File ESP8266** (nếu có): Cần upload code ESP8266 để tạo WiFi AP và HTTP server.

---

## 💻 CÀI ĐẶT PHẦN MỀM

### Bước 1: Clone/Download dự án

```bash
# Nếu dùng git
git clone <repository-url>
cd IOT

# Hoặc giải nén file zip vào thư mục
cd /home/nemmer/Documents/IOT/MTK-Hao/IOT
```

### Bước 2: Cài đặt dependencies

```bash
# Dùng npm
npm install

# Hoặc yarn
yarn install

# Hoặc pnpm
pnpm install
```

### Bước 3: Cấu hình Firebase (tùy chọn - cho lưu lịch sử)

1. Tạo project Firebase tại: https://console.firebase.google.com

2. Tạo file `.env.local` trong thư mục gốc:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ESP8266 API URL (mặc định)
NEXT_PUBLIC_ESP_API_URL=http://192.168.4.1/log
```

3. Enable Firestore Database trong Firebase Console

### Bước 4: Kiểm tra cấu hình

```bash
# Kiểm tra version Node.js
node --version  # Nên >= v18.0.0

# Kiểm tra npm
npm --version   # Nên >= 9.0.0
```

---

## 🎯 CHẠY DỰ ÁN

### Phương án A: Chạy Development Mode (khuyến nghị cho test)

```bash
# Chạy server dev với Turbopack (nhanh hơn)
npm run dev

# Hoặc chạy trên port cụ thể (mặc định: 9002)
npm run dev
```

**Kết quả**:
```
▲ Next.js 15.5.9 (Turbopack)
- Local:        http://localhost:9002
- Network:      http://192.168.2.179:9002

✓ Ready in 848ms
```

### Phương án B: Build & Run Production

```bash
# Build production
npm run build

# Chạy production server
npm start
```

### Bước tiếp theo:

1. **Kết nối WiFi ESP8266**:
   - Tìm WiFi AP do ESP8266 phát ra
   - Kết nối với password (nếu có)
   - IP ESP8266 mặc định: `192.168.4.1`

2. **Kiểm tra API ESP8266**:
   ```bash
   # Test từ terminal (cần kết nối WiFi ESP)
   curl http://192.168.4.1/log
   
   # Hoặc mở trình duyệt:
   # http://192.168.4.1/log
   ```
   
   Nếu thành công, bạn sẽ thấy JSON:
   ```json
   {"temp":22.5,"hum":65.0,"mq135":245,"light":1,"sound":0,"mq2":0}
   ```

3. **Mở Dashboard**:
   - Truy cập: http://localhost:9002
   - Hoặc: http://192.168.2.179:9002 (từ thiết bị khác trong mạng)

---

## 🌐 TRUY CẬP ỨNG DỤNG

### Các trang có sẵn:

| URL | Mô tả |
|-----|-------|
| `http://localhost:9002/` | Trang chủ (redirect → /tong-quan) |
| `http://localhost:9002/tong-quan` | Landing page giới thiệu |
| `http://localhost:9002/thoi-gian-thuc` | Dashboard realtime monitoring |
| `http://localhost:9002/lich-su` | Lịch sử dữ liệu cảm biến |
| `http://localhost:9002/thiet-bi` | Quản lý thiết bị |

### Luồng hoạt động:

```
[Sensors] → [Arduino] → [ESP8266 WiFi AP] 
                             ↓
                    http://192.168.4.1/log
                             ↓
           [Web App] ← API polling mỗi 1-3s
                             ↓
                    [Dashboard Display]
                             ↓
                    [Firebase Storage]
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. **Lỗi: "Cannot find module" khi chạy npm run dev**

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

### 2. **Lỗi: "useTheme must be used within ThemeProvider"**

✅ **ĐÃ SỬA**: File `/tong-quan/page.tsx` đã được cập nhật, không còn lỗi này.

Nếu vẫn gặp lỗi, xóa `.next` và rebuild:
```bash
rm -rf .next
npm run dev
```

### 3. **Lỗi: "Failed to fetch sensor data" / ESP8266 không kết nối được**

**Nguyên nhân**:
- Chưa kết nối WiFi ESP8266
- ESP8266 chưa được cấu hình đúng
- IP sai hoặc endpoint không hoạt động

**Giải pháp**:
```bash
# 1. Kiểm tra kết nối WiFi ESP8266
# 2. Ping ESP8266
ping 192.168.4.1

# 3. Test API bằng curl
curl http://192.168.4.1/log

# 4. Kiểm tra Serial Monitor Arduino để thấy data đang gửi
```

### 4. **Lỗi: "Port 9002 already in use"**

```bash
# Tìm và kill process đang dùng port
# Linux/Mac:
lsof -ti:9002 | xargs kill -9

# Hoặc chạy trên port khác
npm run dev -- -p 3000
```

### 5. **Lỗi: Arduino không đọc được DHT22 (temp = -1)**

**Nguyên nhân**:
- Chân kết nối sai
- DHT22 chưa được làm nóng đủ (cần 3-5s)
- Thư viện DHT chưa cài

**Giải pháp**:
- Kiểm tra lại chân D2
- Đợi 5 giây sau khi reset Arduino
- Cài đặt `DHT sensor library` trong Arduino IDE

### 6. **Lỗi: MQ-2/MQ-135 luôn báo alarm**

**Nguyên nhân**: MQ sensors cần làm nóng 20-60 giây

**Giải pháp**:
```cpp
// Trong Arduino code đã có delay(20000) ở setup()
// Đợi 20s trước khi đọc giá trị
```

Hoặc điều chỉnh ngưỡng trong code Arduino:
```cpp
#define MQ2_THRESHOLD     400  // Tăng nếu quá nhạy
#define MQ135_THRESHOLD   450  // Tùy chỉnh theo môi trường
```

### 7. **Lỗi: Dashboard không cập nhật realtime**

**Kiểm tra**:
- Mở DevTools (F12) → Console để xem lỗi
- Kiểm tra API endpoint: http://localhost:9002/api/sensor-data
- Xem Network tab để thấy request

**Giải pháp**:
```bash
# Restart server
Ctrl+C
npm run dev
```

### 8. **Lỗi: Firebase "Permission denied" khi lưu lịch sử**

**Nguyên nhân**: Firestore rules chưa cấu hình

**Giải pháp**: 
Vào Firebase Console → Firestore → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Chỉ dùng cho dev, không dùng production!
    }
  }
}
```

---

## 📊 TÍNH NĂNG VÀ SỬ DỤNG

### 1. **Dashboard Tổng quan** (`/tong-quan`)
- Giới thiệu hệ thống
- Hiển thị stats realtime
- Features overview
- Call-to-action buttons

### 2. **Giám sát Thời gian thực** (`/thoi-gian-thuc`)

**Hiển thị**:
- 6 sensor cards: Nhiệt độ, Độ ẩm, Chất lượng không khí, Ánh sáng, Tiếng ồn, Gas
- Comfort Index (0-100)
- Room Status: Tốt / Cảnh báo / Nguy hiểm
- Level badges cho từng metric
- Cập nhật mỗi 1 giây

**Cách đọc**:
- 🟢 **Tốt**: Tất cả thông số trong mức an toàn
- 🟡 **Trung bình**: Một số thông số cần chú ý
- 🔴 **Nguy hiểm**: Có thông số vượt ngưỡng nguy hiểm

### 3. **Lịch sử** (`/lich-su`)
- Xem dữ liệu đã lưu trong Firebase
- Filter theo date range
- Export báo cáo
- Biểu đồ xu hướng (nếu đã implement)

### 4. **Quản lý Thiết bị** (`/thiet-bi`)
- Trạng thái kết nối ESP8266
- WiFi signal strength
- Device info
- Connection monitoring

### 5. **Ngưỡng đánh giá**

#### Nhiệt độ:
- ❄️ Quá lạnh: < 18°C
- ✅ Lý tưởng: 22-28°C
- 🔥 Quá nóng: > 35°C

#### Độ ẩm:
- 🏜️ Khô: < 30%
- ✅ Lý tưởng: 40-60%
- 💧 Ẩm: > 90%

#### Chất lượng không khí (MQ-135):
- ✅ Tốt: < 300
- ⚠️ Trung bình: 300-600
- ❌ Xấu: > 600

---

## 🔐 BẢO MẬT & PRODUCTION

### Để deploy lên production:

1. **Tắt CORS và authentication**:
   - Thêm authentication cho Firebase
   - Cấu hình Firestore rules an toàn
   - Thêm rate limiting cho API

2. **Deploy lên Firebase Hosting**:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
npm run build
firebase deploy
```

3. **Hoặc deploy lên Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## 📞 HỖ TRỢ & LIÊN HỆ

### Tài liệu tham khảo:
- [Next.js Documentation](https://nextjs.org/docs)
- [Arduino DHT Library](https://github.com/adafruit/DHT-sensor-library)
- [Firebase Documentation](https://firebase.google.com/docs)
- [ESP8266 Arduino Core](https://github.com/esp8266/Arduino)

### Thư mục quan trọng:
- `/src/app/api/sensor-data/` - API endpoint xử lý data
- `/src/lib/sensor-processor.ts` - Logic xử lý và tính toán
- `/src/components/` - UI components
- `/arduino/` - Arduino firmware

### File logs & debug:
```bash
# Xem terminal logs
npm run dev

# Xem browser console (F12)
# Xem Network tab để debug API calls
```

---

## 🎓 KIẾN THỨC BỔ SUNG

### Cấu trúc Comfort Index:

```javascript
Comfort Index = 100 - (
  tempPenalty +     // Nhiệt độ không lý tưởng
  humPenalty +      // Độ ẩm không lý tưởng
  airPenalty +      // Chất lượng không khí xấu
  lightPenalty +    // Ánh sáng không đủ/quá
  noisePenalty +    // Tiếng ồn cao
  gasPenalty        // Phát hiện gas
)
```

### API Response Format:

```json
{
  "success": true,
  "timestamp": "2026-03-02T04:46:37.166Z",
  "raw": {
    "temp": 21.5,
    "hum": 85.5,
    "mq135": 223,
    "light": 1,
    "sound": 0,
    "mq2": 0
  },
  "processed": {
    "avg": { "temp": 21.5, "hum": 85.5, "mq135": 223 },
    "stable": { "light": 1, "sound": 0, "mq2": 0 },
    "level": { "temp": 0, "hum": 2, "air": 0, "light": 0, "noise": 0, "gas": 0 },
    "alert": { "temp": 0, "hum": 1, "air": 0, "light": 0, "noise": 0, "gas": 0 },
    "room_status": 2,
    "comfort_index": 55,
    "message": "✅ Môi trường ổn định - Tất cả các chỉ số trong mức an toàn"
  },
  "meta": {
    "sample_count": 135,
    "baseline_ready": true,
    "baseline": 223
  }
}
```

---

## ✅ CHECKLIST KHỞI ĐỘNG DỰ ÁN

- [ ] Arduino IDE đã cài đặt
- [ ] Thư viện DHT đã cài trong Arduino
- [ ] Đã upload code lên Arduino UNO
- [ ] Serial Monitor hiển thị JSON data (9600 baud)
- [ ] ESP8266 đã cấu hình và phát WiFi
- [ ] Có thể truy cập http://192.168.4.1/log
- [ ] Node.js >= v18 đã cài đặt
- [ ] `npm install` chạy thành công
- [ ] `.env.local` đã cấu hình (nếu dùng Firebase)
- [ ] `npm run dev` chạy thành công
- [ ] Truy cập http://localhost:9002 được
- [ ] Dashboard hiển thị dữ liệu realtime

---

**Chúc bạn triển khai thành công! 🎉**

*Cập nhật lần cuối: 02/03/2026*
