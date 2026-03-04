# 🤖 HƯỚNG DẪN CÀI ĐẶT TELEGRAM ALERT

## Bước 1: Tạo Telegram Bot

1. Mở Telegram và tìm **@BotFather**
2. Gửi lệnh: `/newbot`
3. Đặt tên cho bot (ví dụ: `Nam Duong IoT Alert Bot`)
4. Đặt username (phải kết thúc bằng `bot`, ví dụ: `namduong_iot_bot`)
5. BotFather sẽ trả về **Bot Token**, giống như:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   ```
6. **LƯU LẠI TOKEN NÀY!**

## Bước 2: Lấy Chat ID

### Cách 1: Dùng @userinfobot
1. Tìm bot **@userinfobot** trên Telegram
2. Gửi bất kỳ tin nhắn nào
3. Bot sẽ trả về Chat ID của bạn (ví dụ: `123456789`)

### Cách 2: Dùng @myidbot
1. Tìm bot **@myidbot** trên Telegram
2. Gửi lệnh: `/getid`
3. Bot sẽ trả về Chat ID

### Cách 3: Gửi tin nhắn cho bot và lấy từ API
1. Tìm bot của bạn (search username đã tạo)
2. Nhấn **Start** hoặc gửi tin nhắn `/start`
3. Mở trình duyệt và truy cập:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   Thay `<YOUR_BOT_TOKEN>` bằng token từ BotFather
4. Tìm trong JSON response:
   ```json
   {
     "message": {
       "chat": {
         "id": 123456789  ← Đây là Chat ID của bạn
       }
     }
   }
   ```

## Bước 3: Cấu hình trong dự án

1. Mở file `.env.local`
2. Thêm Bot Token và Chat ID:

```env
# ===== TELEGRAM ALERT =====
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
TELEGRAM_CHAT_ID=123456789
```

3. Lưu file

## Bước 4: Test kết nối

```bash
# Restart Next.js server
# Ctrl+C để dừng, sau đó:
npm run dev
```

Lần đầu tiên API được gọi, hệ thống sẽ:
1. Khởi tạo Telegram bot
2. Gửi tin nhắn test: "✅ Telegram Alert System - Hệ thống cảnh báo đã được kích hoạt!"

Nếu bạn nhận được tin nhắn này → **Thành công!** 🎉

## Cách hoạt động

### Cảnh báo tự động gửi khi:
- 🌡️ **Nhiệt độ** quá cao (>35°C) hoặc quá thấp (<18°C)
- 💧 **Độ ẩm** quá cao (>90%) hoặc quá thấp (<30%)
- 💨 **Chất lượng không khí** kém (MQ135 > 300)
- 🔥 **Phát hiện khí gas/khói** (MQ-2 vượt ngưỡng)
- 💡 **Ánh sáng** không phù hợp
- 🔊 **Tiếng ồn** quá mức

### Tính năng chống spam:
- Mỗi loại cảnh báo chỉ gửi lại sau **5 phút** (cooldown)
- Tránh spam khi chỉ số dao động liên tục

### Nội dung cảnh báo bao gồm:
- Trạng thái môi trường (Tốt/Cảnh báo/Nguy hiểm)
- Comfort Index (0-100)
- Chi tiết các chỉ số cảnh báo
- Gợi ý hành động khắc phục
- Thời gian phát hiện

## Ví dụ tin nhắn cảnh báo:

```
🚨 CẢNH BÁO MÔI TRƯỜNG - Nam Dương Office

🔴 Trạng thái: Nguy hiểm
📊 Comfort Index: 35/100

⚠️ Các chỉ số cảnh báo:

🌡️ Nhiệt độ: 🔴 Nguy hiểm
   Giá trị: 37.5°C

🔥 Khí gas/khói: 🟡 Trung bình
   Giá trị: 450

🕐 Thời gian: 02/03/2026, 17:30:45

💡 Hành động đề xuất:
• Bật điều hòa hoặc quạt
• ⚠️ KIỂM TRA RƯỚC LỬA! Tắt nguồn gas/điện
```

## Tắt tính năng Telegram

Nếu không muốn dùng Telegram, đơn giản để trống hoặc xóa 2 dòng này trong `.env.local`:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Hệ thống sẽ tự động bỏ qua và không gửi cảnh báo.

## Troubleshooting

### ❌ Không nhận được tin nhắn test?

1. **Kiểm tra Bot Token đúng chưa**
   - Copy lại từ @BotFather
   - Không có khoảng trắng thừa

2. **Kiểm tra Chat ID đúng chưa**
   - Phải là số (không có chữ)
   - Có thể có dấu `-` ở đầu (cho group chat)

3. **Đã Start bot chưa?**
   - Phải gửi `/start` cho bot trước
   - Bot không thể gửi tin nếu bạn chưa start

4. **Kiểm tra logs trong terminal**
   ```
   ✅ Telegram Alert Service đã khởi động
   ✅ Telegram connection test thành công
   ```

### ❌ Lỗi "Forbidden: bot was blocked by the user"

→ Bạn đã block bot. Unblock và gửi `/start` lại.

### ❌ Lỗi "Bad Request: chat not found"

→ Chat ID sai. Lấy lại Chat ID theo hướng dẫn trên.

## Tips nâng cao

### Gửi cho Group Chat:
1. Thêm bot vào group
2. Gửi tin nhắn trong group
3. Lấy Chat ID từ `/getUpdates` (thường có dấu `-` ở đầu)

### Gửi cho nhiều người:
- Tạo group, thêm tất cả mọi người vào
- Dùng Chat ID của group

### Schedule báo cáo định kỳ:
Có thể thêm cron job gọi:
```javascript
telegramService.sendSummaryReport(processedData, rawData);
```

---

**Hoàn tất!** 🎉 Giờ bạn sẽ nhận cảnh báo realtime qua Telegram!
