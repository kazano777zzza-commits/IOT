/**
 * Database Storage Service (Supabase)
 * Thay thế HistoryStorage (localStorage) bằng Supabase PostgreSQL
 * Dùng phía server (API routes) để INSERT và phía client để SELECT
 */

import { supabaseAdmin, supabase, type SensorHistoryRow, type SensorHistoryInsert } from './supabase';
import type { SensorInput } from './sensor-processor';
import type { ProcessedOutput } from './sensor-processor';

// =============================================
// WRITE - Dùng trong API route (server-side)
// =============================================

/**
 * Lưu một bản đọc cảm biến vào Supabase
 * Gọi từ API route sau khi nhận dữ liệu từ Bridge Server
 */
export async function saveReading(
  raw: SensorInput,
  processed: ProcessedOutput
): Promise<void> {
  const record: SensorHistoryInsert = {
    // DHT11
    temp: raw.dht_ok === 1 ? raw.temp : null,
    hum: raw.dht_ok === 1 ? raw.hum : null,
    dht_ok: raw.dht_ok,

    // MQ-135
    mq135: raw.mq135,
    mq135_value: raw.mq135_value,

    // Ánh sáng
    light: raw.light,
    light_value: raw.light_value,

    // Tiếng ồn
    sound: raw.sound,
    sound_value: raw.sound_value,

    // MQ-2 Gas
    mq2: raw.mq2,
    mq2_value: raw.mq2_value,

    // Kết quả xử lý
    room_status: processed.room_status,
    comfort_index: processed.comfort_index,
    message: processed.message,

    // Messages từ Arduino
    sound_msg: raw.sound_msg ?? null,
    light_msg: raw.light_msg ?? null,
    mq2_msg: raw.mq2_msg ?? null,
    mq135_msg: raw.mq135_msg ?? null,
    dht_msg: raw.dht_msg ?? null,
  };

  const { error } = await supabaseAdmin
    .from('sensor_history')
    .insert(record);

  if (error) {
    console.error('❌ [DB] Lỗi lưu dữ liệu cảm biến:', error.message);
    throw error;
  }
}

// =============================================
// READ - Dùng trong trang Lịch sử (client-side)
// =============================================

/**
 * Lấy tất cả bản ghi theo ngày cụ thể
 */
export async function getByDate(date: Date): Promise<SensorHistoryRow[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('sensor_history')
    .select('*')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [DB] Lỗi đọc lịch sử theo ngày:', error.message);
    return [];
  }

  return data as SensorHistoryRow[];
}

/**
 * Lấy N bản ghi gần nhất
 */
export async function getRecent(limit = 100): Promise<SensorHistoryRow[]> {
  const { data, error } = await supabase
    .from('sensor_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ [DB] Lỗi đọc dữ liệu gần nhất:', error.message);
    return [];
  }

  return data as SensorHistoryRow[];
}

/**
 * Đếm tổng số bản ghi
 */
export async function getTotalCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sensor_history')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}

/**
 * Thống kê theo phút trong một ngày (cho biểu đồ lịch sử)
 */
export async function getMinuteStats(date: Date) {
  const records = await getByDate(date);

  // Group theo phút
  const minuteData: Record<string, SensorHistoryRow[]> = {};
  records.forEach((r) => {
    const d = new Date(r.created_at);
    const key = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (!minuteData[key]) minuteData[key] = [];
    minuteData[key].push(r);
  });

  return Object.entries(minuteData).map(([time, recs]) => {
    const validTemps = recs.filter((r) => r.temp !== null).map((r) => r.temp!);
    const validHums = recs.filter((r) => r.hum !== null).map((r) => r.hum!);
    const mq135Values = recs.map((r) => r.mq135_value);

    const lightOnCount = recs.filter((r) => r.light === 1).length;
    const soundOnCount = recs.filter((r) => r.sound === 1).length;
    const gasCount = recs.filter((r) => r.mq2 === 1).length;

    const [hours, mins] = time.split(':').map(Number);

    return {
      time,
      minute: hours * 60 + mins,
      avgTemp: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : null,
      avgHum: validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : null,
      avgMq135: mq135Values.length > 0 ? mq135Values.reduce((a, b) => a + b, 0) / mq135Values.length : 0,
      lightPercent: (lightOnCount / recs.length) * 100,
      soundPercent: (soundOnCount / recs.length) * 100,
      gasCount,
      count: recs.length,
    };
  }).sort((a, b) => a.minute - b.minute);
}

/**
 * Xuất dữ liệu CSV từ database
 */
export async function exportCSV(date?: Date): Promise<string> {
  const records = date ? await getByDate(date) : await getRecent(5000);

  const headers = ['Timestamp', 'Temp (°C)', 'Humidity (%)', 'MQ135 Alert', 'MQ135 Value', 'Light Alert', 'Light Value', 'Sound Alert', 'Sound Value', 'MQ2 Alert', 'MQ2 Value', 'Room Status', 'Comfort Index', 'Message'];

  const rows = records.map((r) => [
    r.created_at,
    r.temp ?? 'N/A',
    r.hum ?? 'N/A',
    r.mq135,
    r.mq135_value,
    r.light,
    r.light_value,
    r.sound,
    r.sound_value,
    r.mq2,
    r.mq2_value,
    r.room_status,
    r.comfort_index,
    `"${r.message ?? ''}"`,
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

/**
 * Xóa toàn bộ dữ liệu (cẩn thận!)
 */
export async function clearAll(): Promise<void> {
  const { error } = await supabaseAdmin
    .from('sensor_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('❌ [DB] Lỗi xóa dữ liệu:', error.message);
    throw error;
  }
}
