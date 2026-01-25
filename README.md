# IOT — Hệ thống IoT giám sát môi trường phòng làm việc (Smart Office)

Hệ thống IoT giám sát môi trường trong phòng làm việc tại **Công Ty TNHH Công Nghệ Nam Dương**.  
Gồm **phần cứng (ESP8266 + cảm biến)** và **Web Dashboard (Next.js + Firebase)** để theo dõi **thời gian thực** và **lịch sử**, kèm logic đánh giá “Tốt / Trung bình / Nguy hiểm” và “Comfort Index”.

---

## 1) Tổng quan kiến trúc

- **ESP8266** đọc cảm biến → phát **WiFi AP** hoặc kết nối WiFi (tùy cấu hình)  
- ESP cung cấp API **HTTP `/data`** trả JSON realtime:
  ```json
  {"temp":22.2,"hum":74.2,"mq135":1,"light":0,"sound":0,"mq2":0}
  EZZZZZZ
