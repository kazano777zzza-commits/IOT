#!/usr/bin/env node

/**
 * Script kiểm tra Serial Port của Arduino
 * Chạy: node scripts/detect-arduino.js
 */

const { SerialPort } = require('serialport');

async function detectArduino() {
  console.log('🔍 Đang tìm kiếm Arduino...\n');

  try {
    const ports = await SerialPort.list();

    if (ports.length === 0) {
      console.log('❌ Không tìm thấy Serial Port nào!');
      console.log('   - Kiểm tra Arduino đã cắm USB chưa');
      console.log('   - Kiểm tra driver CH340/FTDI đã cài chưa (Linux)');
      process.exit(1);
    }

    console.log(`📡 Tìm thấy ${ports.length} port(s):\n`);

    let arduinoFound = false;

    ports.forEach((port, index) => {
      const isArduino = 
        port.manufacturer?.toLowerCase().includes('arduino') ||
        port.manufacturer?.toLowerCase().includes('usb') ||
        port.path.includes('ttyUSB') ||
        port.path.includes('ttyACM') ||
        port.path.includes('COM');

      console.log(`${index + 1}. ${port.path}`);
      console.log(`   Manufacturer: ${port.manufacturer || 'Unknown'}`);
      console.log(`   Serial Number: ${port.serialNumber || 'Unknown'}`);
      console.log(`   Vendor ID: ${port.vendorId || 'Unknown'}`);
      console.log(`   Product ID: ${port.productId || 'Unknown'}`);
      
      if (isArduino) {
        console.log(`   ✅ Arduino detected!`);
        console.log(`   👉 Dùng port này: ${port.path}\n`);
        arduinoFound = true;
      } else {
        console.log('');
      }
    });

    if (!arduinoFound) {
      console.log('⚠️  Không tìm thấy Arduino rõ ràng.');
      console.log('    Thử các port trên (thường là port đầu tiên).\n');
    }

    console.log('📝 Cập nhật file .env.local:');
    console.log('   ARDUINO_SERIAL_PORT=' + ports[0].path);
    console.log('\n💡 Lưu ý:');
    console.log('   - Linux: Có thể cần quyền: sudo chmod 666 ' + ports[0].path);
    console.log('   - Hoặc thêm user vào group dialout: sudo usermod -a -G dialout $USER');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

detectArduino();
