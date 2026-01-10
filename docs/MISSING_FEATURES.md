# DANH SÁCH CHỨC NĂNG CÒN THIẾU

## 1. PHẦN CỨNG (Hardware)

### Thiếu cảm biến:
- ❌ BH1750 - Cảm biến ánh sáng chính xác (lux)
  - Hiện tại chỉ dùng digital light sensor (0/1)
  - Cần: đo chính xác độ sáng (lux) để đánh giá đủ sáng/thiếu sáng/chói

- ❌ KY-038 - Cảm biến tiếng ồn analog
  - Hiện tại chỉ có digital sound sensor (0/1)
  - Cần: đo mức dB chính xác

### Thiếu thiết bị cảnh báo:
- ❌ LED RGB - Cảnh báo bằng màu sắc
  - Xanh = Tốt
  - Vàng = Trung bình
  - Đỏ = Nguy hiểm

- ❌ Buzzer - Còi cảnh báo âm thanh
  - Phát âm khi vượt ngưỡng

- ❌ LCD Display (I2C) - Hiển thị thông số
  - Hiển thị nhiệt độ, độ ẩm, CO2 trực tiếp

### Thiếu mô hình:
- ❌ Mô hình văn phòng thu nhỏ
  - Tường, cửa, bàn ghế
  - Đèn LED mô phỏng đèn trần
  - Quạt mini (relay điều khiển)

---

## 2. PHẦN WEB DASHBOARD

### Thiếu biểu đồ & visualization:
- ❌ Biểu đồ Gauge (vòng tròn) cho từng cảm biến
- ❌ Biểu đồ đường realtime (live chart)
- ❌ Biểu đồ cột so sánh
- ❌ Sparkline chart cho MetricCard

### Thiếu tính năng cảnh báo:
- ❌ Popup cảnh báo khi vượt ngưỡng
- ❌ Âm thanh cảnh báo browser
- ❌ Animation nhấp nháy khi nguy hiểm
- ❌ Thông báo push notification

### Thiếu trang Analytics:
- ❌ Comfort Index visualization
- ❌ Biểu đồ xu hướng (trend analysis)
- ❌ So sánh theo ngày/tuần/tháng
- ❌ Báo cáo tổng hợp (PDF export)

### Thiếu Control Panel:
- ❌ Điều khiển đèn/quạt từ xa
- ❌ Cài đặt ngưỡng cảnh báo
- ❌ Bật/tắt cảm biến

---

## 3. TÍNH NĂNG NÂNG CAO

### Thiếu kết nối cloud:
- ❌ Firebase Realtime Database
- ❌ ThingSpeak integration
- ❌ MQTT Broker

### Thiếu AI/Analytics:
- ❌ Dự đoán xu hướng môi trường
- ❌ Gợi ý cải thiện tự động
- ❌ Machine Learning patterns

### Thiếu tính năng người dùng:
- ❌ Đăng nhập/Phân quyền
- ❌ Multi-tenant (nhiều phòng)
- ❌ Mobile app

---

## ĐÁNH GIÁ HOÀN THIỆN

### Hoàn thiện: ~60%
- ✅ Core monitoring (nhiệt độ, độ ẩm, MQ135, digital sensors)
- ✅ Realtime display
- ✅ History logging
- ✅ Basic charts

### Cần bổ sung ưu tiên cao:
1. **LED RGB + Buzzer** - Cảnh báo trực quan
2. **BH1750** - Đo ánh sáng chính xác
3. **LCD Display** - Hiển thị local
4. **Gauge Charts** - Visualization đẹp hơn
5. **Popup Alerts** - Cảnh báo web
6. **Comfort Index** - Đánh giá tổng hợp

### Cần bổ sung ưu tiên trung bình:
7. Control Panel - Điều khiển từ xa
8. KY-038 analog - Đo tiếng ồn dB
9. Mô hình văn phòng 3D
10. Export PDF report

### Có thể bổ sung sau:
11. Firebase/ThingSpeak
12. MQTT
13. Mobile app
14. AI predictions
