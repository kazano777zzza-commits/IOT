/**
 * History Storage Service
 * Lưu trữ lịch sử dữ liệu cảm biến trong localStorage
 */

export interface SensorHistoryRecord {
  id: string;
  timestamp: string;
  temp: number | null;
  hum: number | null;
  mq135: number;
  light: number;
  sound: number;
  mq2: number;
}

const STORAGE_KEY = "sensor_history";
const MAX_RECORDS = 1000; // Giới hạn 1000 bản ghi

export class HistoryStorage {
  /**
   * Thêm bản ghi mới
   */
  static addRecord(data: Omit<SensorHistoryRecord, "id" | "timestamp">): void {
    if (typeof window === "undefined") return;

    const record: SensorHistoryRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    const history = this.getAll();
    history.unshift(record); // Thêm vào đầu

    // Giới hạn số lượng
    const limited = history.slice(0, MAX_RECORDS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }

  /**
   * Lấy tất cả bản ghi
   */
  static getAll(): SensorHistoryRecord[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load history:", error);
      return [];
    }
  }

  /**
   * Lấy bản ghi theo khoảng thời gian
   */
  static getByTimeRange(startTime: Date, endTime: Date): SensorHistoryRecord[] {
    const all = this.getAll();
    return all.filter((record) => {
      const recordTime = new Date(record.timestamp);
      return recordTime >= startTime && recordTime <= endTime;
    });
  }

  /**
   * Lấy bản ghi gần nhất (N records)
   */
  static getRecent(limit: number = 100): SensorHistoryRecord[] {
    const all = this.getAll();
    return all.slice(0, limit);
  }

  /**
   * Lấy theo ngày
   */
  static getByDate(date: Date): SensorHistoryRecord[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getByTimeRange(startOfDay, endOfDay);
  }

  /**
   * Thống kê theo phút - bao gồm tất cả các chỉ số
   */
  static getMinuteStats(date: Date): Array<{
    time: string;         // Format: "HH:mm"
    minute: number;       // Số phút trong ngày (0-1439)
    avgTemp: number | null;
    avgHum: number | null;
    avgMq135: number;
    lightPercent: number;
    soundPercent: number;
    gasCount: number;
    count: number;
  }> {
    const records = this.getByDate(date);
    const minuteData: Record<string, SensorHistoryRecord[]> = {};

    // Group by minute (HH:mm)
    records.forEach((record) => {
      const d = new Date(record.timestamp);
      const timeKey = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (!minuteData[timeKey]) minuteData[timeKey] = [];
      minuteData[timeKey].push(record);
    });

    // Calculate averages and percentages
    return Object.entries(minuteData).map(([time, records]) => {
      const validTemps = records.filter((r) => r.temp !== null).map((r) => r.temp!);
      const validHums = records.filter((r) => r.hum !== null).map((r) => r.hum!);
      const mq135Values = records.map((r) => r.mq135);
      
      const lightOnCount = records.filter((r) => r.light === 1).length;
      const lightPercent = (lightOnCount / records.length) * 100;
      
      const soundOnCount = records.filter((r) => r.sound === 1).length;
      const soundPercent = (soundOnCount / records.length) * 100;
      
      const gasCount = records.filter((r) => r.mq2 === 1).length;

      const [hours, mins] = time.split(':').map(Number);
      const minuteOfDay = hours * 60 + mins;

      return {
        time,
        minute: minuteOfDay,
        avgTemp: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : null,
        avgHum: validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : null,
        avgMq135: mq135Values.length > 0 ? mq135Values.reduce((a, b) => a + b, 0) / mq135Values.length : 0,
        lightPercent,
        soundPercent,
        gasCount,
        count: records.length,
      };
    }).sort((a, b) => a.minute - b.minute);
  }

  /**
   * Thống kê theo giờ - bao gồm tất cả các chỉ số (giữ lại để tương thích)
   */
  static getHourlyStats(date: Date): Array<{
    hour: number;
    avgTemp: number | null;
    avgHum: number | null;
    avgMq135: number;
    lightPercent: number;   // % thời gian thiếu sáng (light=1)
    soundPercent: number;   // % thời gian có tiếng ồn (sound=1)
    gasCount: number;       // Số lần phát hiện gas (mq2=1)
    count: number;
  }> {
    const records = this.getByDate(date);
    const hourlyData: Record<number, SensorHistoryRecord[]> = {};

    // Group by hour
    records.forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(record);
    });

    // Calculate averages and percentages
    return Object.entries(hourlyData).map(([hour, records]) => {
      const validTemps = records.filter((r) => r.temp !== null).map((r) => r.temp!);
      const validHums = records.filter((r) => r.hum !== null).map((r) => r.hum!);
      const mq135Values = records.map((r) => r.mq135);
      
      // Tính % thời gian thiếu sáng (light=1 là thiếu sáng)
      const lightOnCount = records.filter((r) => r.light === 1).length;
      const lightPercent = (lightOnCount / records.length) * 100;
      
      // Tính % thời gian có tiếng ồn (sound=1 là có tiếng ồn)
      const soundOnCount = records.filter((r) => r.sound === 1).length;
      const soundPercent = (soundOnCount / records.length) * 100;
      
      // Đếm số lần phát hiện gas (mq2=1)
      const gasCount = records.filter((r) => r.mq2 === 1).length;

      return {
        hour: parseInt(hour),
        avgTemp: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : null,
        avgHum: validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : null,
        avgMq135: mq135Values.length > 0 ? mq135Values.reduce((a, b) => a + b, 0) / mq135Values.length : 0,
        lightPercent,
        soundPercent,
        gasCount,
        count: records.length,
      };
    }).sort((a, b) => a.hour - b.hour);
  }

  /**
   * Xóa toàn bộ lịch sử
   */
  static clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Xuất dữ liệu CSV
   */
  static exportCSV(): string {
    const records = this.getAll();
    const headers = ["Timestamp", "Temp (°C)", "Humidity (%)", "MQ135", "Light", "Sound", "MQ2"];
    const rows = records.map((r) => [
      r.timestamp,
      r.temp ?? "N/A",
      r.hum ?? "N/A",
      r.mq135,
      r.light,
      r.sound,
      r.mq2,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  /**
   * Lấy tổng số bản ghi
   */
  static getCount(): number {
    return this.getAll().length;
  }
}
