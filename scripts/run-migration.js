/**
 * Migration Script: Tạo bảng sensor_history trên Supabase
 * Chạy: node scripts/run-migration.js
 * 
 * Yêu cầu: NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local thủ công (không dùng dotenv)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Không tìm thấy file .env.local');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

async function runMigration() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('REPLACE_WITH')) {
    console.error('❌ Chưa điền NEXT_PUBLIC_SUPABASE_URL trong .env.local');
    process.exit(1);
  }

  if (!serviceKey || serviceKey.includes('REPLACE_WITH')) {
    console.error('❌ Chưa điền SUPABASE_SERVICE_ROLE_KEY trong .env.local');
    console.log('📌 Lấy key từ: Supabase Dashboard > Project Settings > API > service_role key');
    process.exit(1);
  }

  console.log('\n🚀 Kết nối Supabase...');
  console.log(`   URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_sensor_history_created_at
      ON sensor_history (created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_sensor_history_date
      ON sensor_history (DATE(created_at));
  `;

  console.log('📋 Đang kiểm tra bảng sensor_history...');

  // Thử SELECT để kiểm tra bảng đã tồn tại chưa
  const { error: selectError } = await supabase
    .from('sensor_history')
    .select('id')
    .limit(1);

  if (selectError && selectError.message.includes('does not exist')) {
    console.error('\n❌ Bảng chưa tồn tại!');
    console.log('\n📌 Vui lòng tạo bảng thủ công:');
    console.log('   1. Vào: https://supabase.com/dashboard/project/hbjxdtnmvvgxrlwhctfa/sql/new');
    console.log('   2. Dán và chạy SQL từ file: supabase/migrations/001_create_sensor_history.sql');
    process.exit(1);
  } else if (selectError) {
    console.error('❌ Lỗi kết nối:', selectError.message);
    process.exit(1);
  } else {
    console.log('✅ Bảng sensor_history đã tồn tại và kết nối OK!');
  }

  // Test kết nối cuối cùng
  console.log('\n🔍 Kiểm tra kết nối và bảng...');
  const { data, error: testErr } = await supabase
    .from('sensor_history')
    .select('id, created_at')
    .limit(5)
    .order('created_at', { ascending: false });

  if (testErr) {
    console.error('❌ Lỗi kết nối:', testErr.message);
  } else {
    console.log(`✅ Kết nối OK! Hiện có ${data.length} bản ghi gần nhất.`);
    if (data.length > 0) {
      console.log('   Bản ghi mới nhất:', data[0].created_at);
    } else {
      console.log('   (Bảng trống - sẽ được điền khi chạy chương trình)');
    }
  }

  console.log('\n🎉 Xong! Bạn có thể chạy chương trình bằng: npm run dev:full\n');
}

runMigration();
