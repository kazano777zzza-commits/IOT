/**
 * Sensor Processor - Xử lý dữ liệu cảm biến từ Arduino
 * Format đầu vào từ http://192.168.4.1/log:
 * {
 *   "sound": 0|1,
 *   "sound_value": number,
 *   "sound_msg": string,
 *   "light": 0|1,
 *   "light_value": number,
 *   "light_msg": string,
 *   "mq2": 0|1,
 *   "mq2_value": number,
 *   "mq2_msg": string,
 *   "mq135": 0|1,
 *   "mq135_value": number,
 *   "mq135_msg": string,
 *   "dht_ok": 0|1,
 *   "temp": number,
 *   "hum": number,
 *   "dht_msg": string
 * }
 */

// ===== Input type từ Arduino =====
export interface SensorInput {
  // Sound sensor
  sound: 0 | 1;
  sound_value: number;
  sound_msg: string;

  // Light sensor  
  light: 0 | 1;
  light_value: number;
  light_msg: string;

  // MQ2 Gas sensor
  mq2: 0 | 1;
  mq2_value: number;
  mq2_msg: string;

  // MQ135 Air quality sensor
  mq135: 0 | 1;
  mq135_value: number;
  mq135_msg: string;

  // DHT22 Temperature & Humidity
  dht_ok: 0 | 1;
  temp: number;
  hum: number;
  dht_msg: string;
}

// ===== Output type cho frontend =====
export interface ProcessedOutput {
  avg: {
    temp: number | null;
    hum: number | null;
    mq135: number;
  };
  stable: {
    light: number;
    sound: number;
    mq2: number;
  };
  level: {
    temp: number;
    hum: number;
    air: number;
    light: number;
    noise: number;
    gas: number;
  };
  alert: {
    temp: number;
    hum: number;
    air: number;
    light: number;
    noise: number;
    gas: number;
  };
  room_status: number;
  comfort_index: number;
  message: string;
}

// ===== Ngưỡng xử lý =====
const THRESHOLDS = {
  temp: { low: 18, ideal_low: 22, ideal_high: 28, high: 35 },
  hum: { low: 30, ideal_low: 40, ideal_high: 60, high: 90 },
  mq135: { good: 300, medium: 450, bad: 600 },
};

const BUFFER_SIZE = 5;

class SensorProcessor {
  private tempBuffer: number[] = [];
  private humBuffer: number[] = [];
  private mq135Buffer: number[] = [];
  private sampleCount = 0;
  private baseline: number | null = null;
  private baselineReady = false;

  process(input: SensorInput): ProcessedOutput {
    this.sampleCount++;

    if (input.dht_ok === 1 && input.temp !== -1 && input.hum !== -1) {
      this.addToBuffer(this.tempBuffer, input.temp);
      this.addToBuffer(this.humBuffer, input.hum);
    }

    this.addToBuffer(this.mq135Buffer, input.mq135_value);

    if (this.sampleCount >= 10 && !this.baselineReady) {
      this.baseline = this.average(this.mq135Buffer);
      this.baselineReady = true;
    }

    const avgTemp = this.tempBuffer.length > 0 ? this.average(this.tempBuffer) : null;
    const avgHum = this.humBuffer.length > 0 ? this.average(this.humBuffer) : null;
    const avgMq135 = this.average(this.mq135Buffer) || input.mq135_value;

    // Tính level: 0=Tốt, 1=Bình thường, 2=Trung bình, 3=Xấu, 4=Nguy hiểm
    const tempLevel = this.getTempLevel(avgTemp);
    const humLevel = this.getHumLevel(avgHum);
    const airLevel = this.getAirLevel(input.mq135_value, input.mq135);
    // Light: light=1 là tối (vượt ngưỡng), light=0 là sáng
    const lightLevel = input.light === 1 ? 1 : 0;  // Tối chỉ là "Bình thường", không nguy hiểm
    // Sound: sound=1 là có tiếng ồn
    const noiseLevel = input.sound === 1 ? 1 : 0;  // Ồn chỉ là "Bình thường", không nguy hiểm
    // Gas: mq2=1 là phát hiện gas -> Nguy hiểm (level 4)
    const gasLevel = input.mq2 === 1 ? 4 : 0;

    // Alert chỉ bật khi level >= 3 (Xấu hoặc Nguy hiểm)
    const alerts = {
      temp: tempLevel >= 3 ? 1 : 0,
      hum: humLevel >= 3 ? 1 : 0,
      air: airLevel >= 3 ? 1 : 0,
      light: 0,  // Ánh sáng không cần cảnh báo
      noise: 0,  // Tiếng ồn không cần cảnh báo
      gas: gasLevel >= 4 ? 1 : 0,  // Chỉ gas mới cảnh báo nguy hiểm
    };

    const roomStatus = this.getRoomStatus(tempLevel, humLevel, airLevel, gasLevel);
    const comfortIndex = this.calculateComfortIndex(tempLevel, humLevel, airLevel, lightLevel, noiseLevel, gasLevel);
    const message = this.generateMessage(input, roomStatus, alerts);

    return {
      avg: {
        temp: avgTemp,
        hum: avgHum,
        mq135: Math.round(avgMq135),
      },
      stable: {
        light: input.light,
        sound: input.sound,
        mq2: input.mq2,
      },
      level: {
        temp: tempLevel,
        hum: humLevel,
        air: airLevel,
        light: lightLevel,
        noise: noiseLevel,
        gas: gasLevel,
      },
      alert: alerts,
      room_status: roomStatus,
      comfort_index: comfortIndex,
      message,
    };
  }

  private addToBuffer(buffer: number[], value: number) {
    buffer.push(value);
    if (buffer.length > BUFFER_SIZE) {
      buffer.shift();
    }
  }

  private average(buffer: number[]): number {
    if (buffer.length === 0) return 0;
    return buffer.reduce((a, b) => a + b, 0) / buffer.length;
  }

  // Level: 0=Tốt, 1=Bình thường, 2=Trung bình, 3=Xấu, 4=Nguy hiểm
  private getTempLevel(temp: number | null): number {
    if (temp === null) return 0;
    // Lý tưởng: 22-28°C
    if (temp >= THRESHOLDS.temp.ideal_low && temp <= THRESHOLDS.temp.ideal_high) return 0;
    // Bình thường: 18-22 hoặc 28-32
    if (temp >= THRESHOLDS.temp.low && temp <= THRESHOLDS.temp.high) return 1;
    // Xấu: 15-18 hoặc 32-38
    if (temp >= 15 && temp <= 38) return 3;
    // Nguy hiểm: <15 hoặc >38
    return 4;
  }

  private getHumLevel(hum: number | null): number {
    if (hum === null) return 0;
    // Lý tưởng: 40-60%
    if (hum >= THRESHOLDS.hum.ideal_low && hum <= THRESHOLDS.hum.ideal_high) return 0;
    // Bình thường: 30-40 hoặc 60-80
    if (hum >= THRESHOLDS.hum.low && hum <= 80) return 1;
    // Trung bình: 20-30 hoặc 80-90
    if (hum >= 20 && hum <= THRESHOLDS.hum.high) return 2;
    // Xấu: <20 hoặc >90
    return 3;
  }

  private getAirLevel(mq135Value: number, mq135Alert: number): number {
    // Dựa theo giá trị analog (0-1023)
    if (mq135Value < THRESHOLDS.mq135.good) return 0;      // <300: Tốt
    if (mq135Value < THRESHOLDS.mq135.medium) return 1;    // 300-450: Bình thường
    if (mq135Value < THRESHOLDS.mq135.bad) return 2;       // 450-600: Trung bình
    if (mq135Value < 800) return 3;                         // 600-800: Xấu
    return 4;                                               // >800: Nguy hiểm
  }

  private getRoomStatus(tempLevel: number, humLevel: number, airLevel: number, gasLevel: number): number {
    // Chỉ gas mới là nguy hiểm thật sự
    if (gasLevel >= 4) return 4;  // Nguy hiểm
    
    const maxLevel = Math.max(tempLevel, humLevel, airLevel);
    if (maxLevel >= 4) return 4;  // Nguy hiểm
    if (maxLevel >= 3) return 3;  // Xấu
    if (maxLevel >= 2) return 2;  // Trung bình
    if (maxLevel >= 1) return 1;  // Bình thường
    return 0;  // Tốt
  }

  private calculateComfortIndex(
    tempLevel: number,
    humLevel: number,
    airLevel: number,
    lightLevel: number,
    noiseLevel: number,
    gasLevel: number
  ): number {
    let score = 100;
    score -= tempLevel * 15;
    score -= humLevel * 15;
    score -= airLevel * 20;
    score -= lightLevel * 5;
    score -= noiseLevel * 5;
    score -= gasLevel * 30;
    return Math.max(0, Math.min(100, score));
  }

  private generateMessage(
    input: SensorInput,
    roomStatus: number,
    alerts: { temp: number; hum: number; air: number; light: number; noise: number; gas: number }
  ): string {
    const warnings: string[] = [];

    if (alerts.gas) warnings.push(`🔥 ${input.mq2_msg}`);
    if (alerts.air) warnings.push(`💨 ${input.mq135_msg}`);
    if (alerts.temp) warnings.push(`🌡️ Nhiệt độ ${input.temp > 28 ? "cao" : "thấp"} (${input.temp}°C)`);
    if (alerts.hum) warnings.push(`💧 Độ ẩm ${input.hum > 60 ? "cao" : "thấp"} (${input.hum}%)`);
    if (alerts.light) warnings.push(`💡 ${input.light_msg}`);
    if (alerts.noise) warnings.push(`🔊 ${input.sound_msg}`);

    if (warnings.length === 0) {
      return "✅ Môi trường ổn định - Tất cả các chỉ số trong mức an toàn";
    }

    if (roomStatus === 2) {
      return `⚠️ CẢNH BÁO: ${warnings.join(" | ")}`;
    }

    return `📊 Lưu ý: ${warnings.join(" | ")}`;
  }

  getSampleCount(): number {
    return this.sampleCount;
  }

  isBaselineReady(): boolean {
    return this.baselineReady;
  }

  getBaseline(): number | null {
    return this.baseline ? Math.round(this.baseline) : null;
  }
}

let processorInstance: SensorProcessor | null = null;

export function getSensorProcessor(): SensorProcessor {
  if (!processorInstance) {
    processorInstance = new SensorProcessor();
  }
  return processorInstance;
}

export function resetProcessor(): void {
  processorInstance = null;
}
