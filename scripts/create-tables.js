/**
 * Tạo bảng sensor_history trực tiếp qua PostgreSQL connection string
 * Chạy: node scripts/create-tables.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        process.env[line.substring(0, eqIdx).trim()] = line.substring(eqIdx + 1).trim();
      }
    }
  });
}

async function createTables() {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Thiếu DATABASE_URL trong .env.local');
    process.exit(1);
  }

  console.log('\n🚀 Kết nối PostgreSQL (Supabase)...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Kết nối thành công!\n');

    console.log('📋 Tạo bảng sensor_history...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_history (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        temp        FLOAT,
        hum         FLOAT,
        dht_ok      SMALLINT DEFAULT 0,
        mq135       SMALLINT DEFAULT 0,
        mq135_value INTEGER DEFAULT 0,
        light       SMALLINT DEFAULT 0,
        light_value INTEGER DEFAULT 0,
        sound       SMALLINT DEFAULT 0,
        sound_value INTEGER DEFAULT 0,
        mq2         SMALLINT DEFAULT 0,
        mq2_value   INTEGER DEFAULT 0,
        room_status    SMALLINT DEFAULT 0,
        comfort_index  SMALLINT DEFAULT 0,
        message        TEXT,
        sound_msg  TEXT,
        light_msg  TEXT,
        mq2_msg    TEXT,
        mq135_msg  TEXT,
        dht_msg    TEXT
      );
    `);
    console.log('   ✅ Bảng sensor_history tạo thành công!');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_history_created_at
        ON sensor_history (created_at DESC);
    `);
    console.log('   ✅ Index created_at tạo thành công!');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_history_date
        ON sensor_history ((created_at::date));
    `);
    console.log('   ✅ Index date tạo thành công!');

    // Kiểm tra bảng
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sensor_history' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Cấu trúc bảng sensor_history:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name.padEnd(18)} ${row.data_type}`);
    });

    // Đếm bản ghi
    const countResult = await client.query('SELECT COUNT(*) FROM sensor_history');
    console.log(`\n📈 Số bản ghi hiện tại: ${countResult.rows[0].count}`);

    console.log('\n🎉 Xong! Database sẵn sàng.');
    console.log('   Chạy chương trình: npm run dev:full\n');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
