#!/usr/bin/env node

/**
 * Script test đọc dữ liệu từ Arduino
 * Chạy: node scripts/test-serial.js [port]
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portPath = process.argv[2] || process.env.ARDUINO_SERIAL_PORT || '/dev/ttyUSB0';

console.log(`🔌 Đang kết nối với Arduino tại: ${portPath}`);
console.log('⏳ Vui lòng đợi...\n');

const port = new SerialPort({
  path: portPath,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let dataCount = 0;

port.on('open', () => {
  console.log('✅ Kết nối thành công!');
  console.log('📡 Đang đọc dữ liệu từ Arduino...\n');
  console.log('👉 Nhấn Ctrl+C để dừng\n');
  console.log('-'.repeat(80));
});

parser.on('data', (line) => {
  try {
    const data = JSON.parse(line.trim());
    dataCount++;
    
    console.log(`\n📊 Mẫu #${dataCount} - ${new Date().toLocaleTimeString()}`);
    console.log('├─ Nhiệt độ:', data.temp !== -1 ? `${data.temp}°C` : 'N/A');
    console.log('├─ Độ ẩm:', data.hum !== -1 ? `${data.hum}%` : 'N/A');
    console.log('├─ Ánh sáng:', data.light ? '💡 Sáng' : '🌙 Tối', `(${data.light_value})`);
    console.log('├─ Tiếng ồn:', data.sound ? '🔊 Có tiếng động' : '🔇 Yên lặng', `(${data.sound_value})`);
    console.log('├─ MQ-2 (Gas):', data.mq2 ? '⚠️  Phát hiện!' : '✅ Bình thường', `(${data.mq2_value})`);
    console.log('└─ MQ-135 (Air):', data.mq135 ? '⚠️  Kém' : '✅ Tốt', `(${data.mq135_value})`);
    
    if (data.dht_ok === 0) {
      console.log('⚠️  Cảnh báo: DHT22 đang lỗi đọc!');
    }
    
  } catch (error) {
    // Không phải JSON, in ra như text
    console.log('📝', line.trim());
  }
});

port.on('error', (err) => {
  console.error('\n❌ Lỗi kết nối Serial Port:');
  console.error('   ', err.message);
  console.error('\n💡 Giải pháp:');
  console.error('   1. Kiểm tra Arduino đã cắm USB chưa');
  console.error('   2. Kiểm tra port đúng chưa (chạy: node scripts/detect-arduino.js)');
  console.error('   3. Linux: Cấp quyền: sudo chmod 666', portPath);
  console.error('   4. Hoặc: sudo usermod -a -G dialout $USER (rồi logout/login)');
  process.exit(1);
});

port.on('close', () => {
  console.log('\n🔌 Kết nối đã đóng');
  console.log(`📊 Tổng cộng nhận được: ${dataCount} mẫu dữ liệu`);
  process.exit(0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Đang đóng kết nối...');
  port.close();
});
