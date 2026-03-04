/**
 * Serial Reader Service
 * Đọc dữ liệu trực tiếp từ Arduino UNO qua Serial Port
 * Thay thế ESP8266 WiFi connection
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

interface ArduinoData {
  sound: number;
  sound_value: number;
  sound_msg: string;
  light: number;
  light_value: number;
  light_msg: string;
  mq2: number;
  mq2_value: number;
  mq2_msg: string;
  mq135: number;
  mq135_value: number;
  mq135_msg: string;
  dht_ok: number;
  temp: number;
  hum: number;
  dht_msg: string;
}

class SerialReader {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private latestData: ArduinoData | null = null;
  private isConnected: boolean = false;
  private portPath: string;
  
  constructor(portPath: string = '/dev/ttyUSB0') {
    this.portPath = portPath;
  }

  /**
   * Khởi động kết nối Serial
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('✓ Serial port already connected');
      return;
    }

    try {
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: 9600,
        autoOpen: false,
      });

      // Mở port
      await new Promise<void>((resolve, reject) => {
        this.port!.open((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Setup parser để đọc từng dòng
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      // Lắng nghe dữ liệu
      this.parser.on('data', (line: string) => {
        try {
          // Arduino gửi JSON mỗi dòng
          const data = JSON.parse(line.trim());
          
          // Validate data có đủ fields không
          if (this.isValidArduinoData(data)) {
            this.latestData = data;
            console.log(`📡 Serial Data: T=${data.temp}°C H=${data.hum}% MQ135=${data.mq135_value}`);
          }
        } catch (error) {
          // Bỏ qua dòng không phải JSON (như "Dang lam nong MQ2...")
          // console.debug('Non-JSON line:', line);
        }
      });

      this.port.on('error', (err) => {
        console.error('❌ Serial port error:', err.message);
        this.isConnected = false;
      });

      this.port.on('close', () => {
        console.log('Serial port closed');
        this.isConnected = false;
      });

      this.isConnected = true;
      console.log(`✅ Connected to Arduino on ${this.portPath}`);

    } catch (error) {
      console.error('❌ Failed to connect to Arduino:', error);
      throw error;
    }
  }

  /**
   * Validate dữ liệu từ Arduino
   */
  private isValidArduinoData(data: any): data is ArduinoData {
    return (
      typeof data.sound === 'number' &&
      typeof data.sound_value === 'number' &&
      typeof data.light === 'number' &&
      typeof data.light_value === 'number' &&
      typeof data.mq2 === 'number' &&
      typeof data.mq2_value === 'number' &&
      typeof data.mq135 === 'number' &&
      typeof data.mq135_value === 'number' &&
      typeof data.dht_ok === 'number' &&
      typeof data.temp === 'number' &&
      typeof data.hum === 'number'
    );
  }

  /**
   * Lấy dữ liệu mới nhất
   */
  getLatestData(): ArduinoData | null {
    return this.latestData;
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isPortConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Đóng kết nối
   */
  async disconnect(): Promise<void> {
    if (this.port && this.port.isOpen) {
      await new Promise<void>((resolve) => {
        this.port!.close(() => {
          console.log('Serial port disconnected');
          resolve();
        });
      });
    }
    this.isConnected = false;
  }

  /**
   * Thay đổi port path (ví dụ từ /dev/ttyUSB0 sang /dev/ttyACM0)
   */
  setPortPath(path: string): void {
    this.portPath = path;
  }
}

// Singleton instance
let serialReaderInstance: SerialReader | null = null;

/**
 * Lấy hoặc tạo Serial Reader instance
 */
export function getSerialReader(portPath?: string): SerialReader {
  if (!serialReaderInstance) {
    // Đọc từ environment variable hoặc dùng default
    const defaultPort = process.env.ARDUINO_SERIAL_PORT || '/dev/ttyUSB0';
    serialReaderInstance = new SerialReader(portPath || defaultPort);
  }
  return serialReaderInstance;
}

/**
 * Tự động detect Arduino port (helper function)
 */
export async function detectArduinoPort(): Promise<string | null> {
  const { SerialPort } = await import('serialport');
  
  try {
    const ports = await SerialPort.list();
    
    // Tìm Arduino UNO (thường có manufacturer chứa "Arduino" hoặc "USB")
    const arduinoPort = ports.find(port => 
      port.manufacturer?.toLowerCase().includes('arduino') ||
      port.manufacturer?.toLowerCase().includes('usb') ||
      port.path.includes('ttyUSB') ||
      port.path.includes('ttyACM')
    );

    if (arduinoPort) {
      console.log(`🔍 Detected Arduino at: ${arduinoPort.path}`);
      return arduinoPort.path;
    }

    // Fallback: list all ports
    console.log('Available ports:', ports.map(p => p.path).join(', '));
    return null;
  } catch (error) {
    console.error('Error detecting Arduino port:', error);
    return null;
  }
}

export type { ArduinoData };
