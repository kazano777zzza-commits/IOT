#!/usr/bin/env node

/**
 * Serial to HTTP Bridge Server
 * Chạy riêng biệt với Next.js để đọc Serial và expose HTTP API
 * 
 * Chạy: node serial-bridge.js
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');

// Cấu hình
const SERIAL_PORT = process.env.ARDUINO_SERIAL_PORT || '/dev/ttyUSB0';
const HTTP_PORT = process.env.BRIDGE_PORT || 3001;
const BAUD_RATE = 9600;

// Lưu data mới nhất
let latestData = null;
let isConnected = false;
let errorMessage = null;

console.log('╔══════════════════════════════════════════════╗');
console.log('║   🔌 Arduino Serial to HTTP Bridge Server   ║');
console.log('╚══════════════════════════════════════════════╝\n');

// Kết nối Serial Port
console.log(`📡 Đang kết nối với Arduino tại: ${SERIAL_PORT}`);
console.log(`⏳ Vui lòng đợi...\n`);

const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  isConnected = true;
  errorMessage = null;
  console.log('✅ Kết nối Serial thành công!');
  console.log('📡 Đang đọc dữ liệu từ Arduino...\n');
  console.log('-'.repeat(80));
});

let dataCount = 0;

parser.on('data', (line) => {
  try {
    const data = JSON.parse(line.trim());
    dataCount++;
    latestData = {
      ...data,
      timestamp: new Date().toISOString(),
      sampleNumber: dataCount,
    };
    
    // Log mỗi 10 mẫu để không spam console
    if (dataCount % 10 === 0) {
      console.log(`📊 Mẫu #${dataCount} - T=${data.temp}°C H=${data.hum}% MQ135=${data.mq135_value}`);
    }
    
  } catch (error) {
    // Bỏ qua dòng không phải JSON
  }
});

port.on('error', (err) => {
  isConnected = false;
  errorMessage = err.message;
  console.error('\n❌ Lỗi Serial Port:', err.message);
});

port.on('close', () => {
  isConnected = false;
  console.log('\n🔌 Kết nối Serial đã đóng');
});

// Tạo HTTP Server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/data' || req.url === '/log') {
    if (!isConnected) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Serial port not connected',
        message: errorMessage || 'Arduino not connected',
      }));
      return;
    }

    if (!latestData) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'No data available yet',
        message: 'Waiting for first data from Arduino...',
      }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      ...latestData,
    }));
  } 
  else if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connected: isConnected,
      port: SERIAL_PORT,
      baudRate: BAUD_RATE,
      dataReceived: dataCount,
      lastUpdate: latestData?.timestamp || null,
      error: errorMessage,
    }));
  }
  else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Arduino Serial Bridge</title>
        <meta charset="utf-8">
        <style>
          body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
          h1 { color: #4ec9b0; }
          .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
          .connected { background: #0e639c; }
          .disconnected { background: #f14c4c; }
          pre { background: #252526; padding: 15px; border-radius: 5px; overflow-x: auto; }
          a { color: #569cd6; }
        </style>
      </head>
      <body>
        <h1>🔌 Arduino Serial to HTTP Bridge</h1>
        <div class="status ${isConnected ? 'connected' : 'disconnected'}">
          <strong>Status:</strong> ${isConnected ? '✅ Connected' : '❌ Disconnected'}<br>
          <strong>Port:</strong> ${SERIAL_PORT}<br>
          <strong>Samples:</strong> ${dataCount}
        </div>
        <h2>API Endpoints:</h2>
        <ul>
          <li><a href="/data">/data</a> - Latest sensor data (JSON)</li>
          <li><a href="/log">/log</a> - Same as /data (compatibility)</li>
          <li><a href="/status">/status</a> - Bridge status</li>
        </ul>
        <h2>Latest Data:</h2>
        <pre id="data">${JSON.stringify(latestData, null, 2)}</pre>
        <script>
          setInterval(() => {
            fetch('/data')
              .then(r => r.json())
              .then(data => {
                document.getElementById('data').textContent = JSON.stringify(data, null, 2);
              });
          }, 2000);
        </script>
      </body>
      </html>
    `);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(HTTP_PORT, () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║          🚀 Bridge Server Started            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n📡 HTTP API: http://localhost:${HTTP_PORT}`);
  console.log(`   ├─ http://localhost:${HTTP_PORT}/data   (Latest sensor data)`);
  console.log(`   ├─ http://localhost:${HTTP_PORT}/log    (Compatibility endpoint)`);
  console.log(`   └─ http://localhost:${HTTP_PORT}/status (Bridge status)\n`);
  console.log(`🌐 Web UI: http://localhost:${HTTP_PORT}\n`);
  console.log('💡 Tip: Để dừng server, nhấn Ctrl+C\n');
  console.log('-'.repeat(80));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Đang dừng Bridge Server...');
  console.log(`📊 Tổng cộng đã nhận: ${dataCount} mẫu dữ liệu`);
  port.close();
  server.close(() => {
    console.log('✅ Bridge Server đã dừng');
    process.exit(0);
  });
});
