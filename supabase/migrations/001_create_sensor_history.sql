-- ============================================================
-- Migration 001: Tạo bảng sensor_history
-- Dán SQL này vào Supabase Dashboard > SQL Editor và chạy
-- ============================================================

-- Bảng chính lưu dữ liệu cảm biến
CREATE TABLE IF NOT EXISTS sensor_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- DHT11: Nhiệt độ & Độ ẩm
  temp        FLOAT,           -- Nhiệt độ (°C), NULL nếu DHT lỗi
  hum         FLOAT,           -- Độ ẩm (%), NULL nếu DHT lỗi
  dht_ok      SMALLINT DEFAULT 0, -- 1 = DHT đọc OK, 0 = lỗi

  -- MQ-135: Chất lượng không khí
  mq135       SMALLINT DEFAULT 0, -- 0 = bình thường, 1 = vượt ngưỡng
  mq135_value INTEGER DEFAULT 0,  -- Giá trị ADC thô (0-1023)

  -- Ánh sáng (LDR)
  light       SMALLINT DEFAULT 0, -- 0 = đủ sáng, 1 = thiếu sáng
  light_value INTEGER DEFAULT 0,  -- Giá trị ADC thô (0-1023)

  -- Tiếng ồn (Sound sensor)
  sound       SMALLINT DEFAULT 0, -- 0 = yên tĩnh, 1 = có tiếng ồn
  sound_value INTEGER DEFAULT 0,  -- Giá trị ADC thô (0-1023)

  -- MQ-2: Gas/Khói
  mq2         SMALLINT DEFAULT 0, -- 0 = an toàn, 1 = phát hiện gas/khói
  mq2_value   INTEGER DEFAULT 0,  -- Giá trị ADC thô (0-1023)

  -- Kết quả xử lý (từ sensor-processor)
  room_status    SMALLINT DEFAULT 0, -- 0=OK, 1=cảnh báo, 2=nguy hiểm
  comfort_index  SMALLINT DEFAULT 0, -- 0-100
  message        TEXT,               -- Thông điệp trạng thái phòng

  -- Messages từ Arduino
  sound_msg  TEXT,
  light_msg  TEXT,
  mq2_msg    TEXT,
  mq135_msg  TEXT,
  dht_msg    TEXT
);

-- Index để query theo thời gian nhanh hơn
CREATE INDEX IF NOT EXISTS idx_sensor_history_created_at
  ON sensor_history (created_at DESC);

-- Index để lọc theo ngày (dùng cast sang DATE với UTC, tránh lỗi IMMUTABLE)
CREATE INDEX IF NOT EXISTS idx_sensor_history_date
  ON sensor_history ((created_at::date));

-- Bật Row Level Security (bảo mật)
ALTER TABLE sensor_history ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép đọc/ghi từ server (service_role key)
-- Chú ý: anon key chỉ đọc, service_role key có thể ghi
CREATE POLICY "Allow all for service role"
  ON sensor_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy riêng cho anon (chỉ đọc)
CREATE POLICY "Allow anon read"
  ON sensor_history
  FOR SELECT
  TO anon
  USING (true);

-- Tự động xóa dữ liệu cũ hơn 30 ngày (tuỳ chọn - bỏ comment để bật)
-- CREATE OR REPLACE FUNCTION delete_old_sensor_history()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM sensor_history WHERE created_at < NOW() - INTERVAL '30 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- Kiểm tra bảng đã tạo
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sensor_history'
ORDER BY ordinal_position;
