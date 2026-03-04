/**
 * Telegram Alert Service
 * Gửi cảnh báo tự động qua Telegram khi phát hiện nguy hiểm
 */

const TelegramBot = require('node-telegram-bot-api');

class TelegramAlertService {
  constructor(token, chatId) {
    if (!token || !chatId) {
      console.warn('⚠️  Telegram bot token hoặc chat ID không được cấu hình');
      this.enabled = false;
      return;
    }

    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
    this.enabled = true;
    
    // Lưu trạng thái cảnh báo để tránh spam
    this.lastAlerts = {
      temp: { status: 0, time: 0 },
      hum: { status: 0, time: 0 },
      air: { status: 0, time: 0 },
      gas: { status: 0, time: 0 },
      light: { status: 0, time: 0 },
      noise: { status: 0, time: 0 },
    };
    
    // Cooldown: không gửi cảnh báo lại cùng loại trong vòng 5 phút
    this.COOLDOWN_MS = 5 * 60 * 1000;
    
    console.log('✅ Telegram Alert Service đã khởi động');
  }

  /**
   * Kiểm tra và gửi cảnh báo nếu cần
   */
  async checkAndSendAlerts(processedData, rawData) {
    if (!this.enabled) return;

    const now = Date.now();
    const alerts = [];

    // Kiểm tra từng chỉ số
    const checks = [
      {
        key: 'temp',
        alert: processedData.alert.temp,
        value: rawData.temp,
        unit: '°C',
        name: 'Nhiệt độ',
        emoji: '🌡️',
      },
      {
        key: 'hum',
        alert: processedData.alert.hum,
        value: rawData.hum,
        unit: '%',
        name: 'Độ ẩm',
        emoji: '💧',
      },
      {
        key: 'air',
        alert: processedData.alert.air,
        value: rawData.mq135_value,
        unit: 'ppm',
        name: 'Chất lượng không khí',
        emoji: '💨',
      },
      {
        key: 'gas',
        alert: processedData.alert.gas,
        value: rawData.mq2_value,
        unit: '',
        name: 'Khí gas/khói',
        emoji: '🔥',
      },
      {
        key: 'light',
        alert: processedData.alert.light,
        value: rawData.light_value,
        unit: '',
        name: 'Ánh sáng',
        emoji: '💡',
      },
      {
        key: 'noise',
        alert: processedData.alert.noise,
        value: rawData.sound_value,
        unit: 'dB',
        name: 'Tiếng ồn',
        emoji: '🔊',
      },
    ];

    for (const check of checks) {
      const lastAlert = this.lastAlerts[check.key];
      const hasAlert = check.alert === 1;
      const cooldownExpired = now - lastAlert.time > this.COOLDOWN_MS;

      // Gửi cảnh báo nếu:
      // 1. Có alert mới (chuyển từ 0 -> 1)
      // 2. Hoặc vẫn đang alert nhưng đã hết cooldown
      if (hasAlert && (lastAlert.status === 0 || cooldownExpired)) {
        alerts.push({
          ...check,
          level: processedData.level[check.key],
        });
        
        // Cập nhật trạng thái
        this.lastAlerts[check.key] = {
          status: 1,
          time: now,
        };
      } else if (!hasAlert) {
        // Reset trạng thái khi hết cảnh báo
        this.lastAlerts[check.key].status = 0;
      }
    }

    // Gửi cảnh báo nếu có
    if (alerts.length > 0) {
      await this.sendAlert(alerts, processedData, rawData);
    }
  }

  /**
   * Gửi tin nhắn cảnh báo qua Telegram
   */
  async sendAlert(alerts, processedData, rawData) {
    try {
      // Tạo message
      let message = '🚨 *CẢNH BÁO MÔI TRƯỜNG - Nam Dương Office*\n\n';
      
      // Room status
      const statusEmoji = processedData.room_status === 0 ? '✅' : 
                         processedData.room_status === 1 ? '⚠️' : '🔴';
      const statusText = processedData.room_status === 0 ? 'Tốt' :
                        processedData.room_status === 1 ? 'Cảnh báo' : 'Nguy hiểm';
      
      message += `${statusEmoji} *Trạng thái:* ${statusText}\n`;
      message += `📊 *Comfort Index:* ${processedData.comfort_index}/100\n\n`;
      
      message += '⚠️ *Các chỉ số cảnh báo:*\n';
      
      // Chi tiết từng cảnh báo
      for (const alert of alerts) {
        const levelEmoji = alert.level === 0 ? '🟢' :
                          alert.level === 1 ? '🟡' : '🔴';
        const levelText = alert.level === 0 ? 'Tốt' :
                         alert.level === 1 ? 'Trung bình' : 'Nguy hiểm';
        
        message += `\n${alert.emoji} *${alert.name}:* ${levelEmoji} ${levelText}\n`;
        message += `   Giá trị: \`${alert.value}${alert.unit}\`\n`;
      }
      
      // Thời gian
      message += `\n🕐 *Thời gian:* ${new Date().toLocaleString('vi-VN')}\n`;
      
      // Gợi ý hành động
      message += '\n💡 *Hành động đề xuất:*\n';
      
      if (alerts.some(a => a.key === 'temp' && a.level === 2)) {
        message += '• Bật điều hòa hoặc quạt\n';
      }
      if (alerts.some(a => a.key === 'hum' && a.level === 2)) {
        message += '• Kiểm tra độ ẩm, bật máy hút ẩm\n';
      }
      if (alerts.some(a => a.key === 'air' && a.level >= 1)) {
        message += '• Mở cửa sổ thông gió\n';
      }
      if (alerts.some(a => a.key === 'gas' && a.level >= 1)) {
        message += '• ⚠️ KIỂM TRA RƯỚC LỬA! Tắt nguồn gas/điện\n';
      }
      if (alerts.some(a => a.key === 'light')) {
        message += '• Điều chỉnh ánh sáng\n';
      }
      if (alerts.some(a => a.key === 'noise' && a.level >= 1)) {
        message += '• Giảm tiếng ồn trong văn phòng\n';
      }

      // Gửi message
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      console.log(`📱 Đã gửi cảnh báo Telegram: ${alerts.length} alert(s)`);

    } catch (error) {
      console.error('❌ Lỗi gửi Telegram:', error.message);
    }
  }

  /**
   * Gửi báo cáo tổng hợp (có thể dùng schedule)
   */
  async sendSummaryReport(processedData, rawData) {
    if (!this.enabled) return;

    try {
      let message = '📊 *BÁO CÁO MÔI TRƯỜNG - Nam Dương Office*\n\n';
      
      message += `✅ *Trạng thái:* ${processedData.room_status === 0 ? 'Tốt' : processedData.room_status === 1 ? 'Cảnh báo' : 'Nguy hiểm'}\n`;
      message += `📈 *Comfort Index:* ${processedData.comfort_index}/100\n\n`;
      
      message += '*Các chỉ số hiện tại:*\n';
      message += `🌡️ Nhiệt độ: \`${rawData.temp}°C\`\n`;
      message += `💧 Độ ẩm: \`${rawData.hum}%\`\n`;
      message += `💨 Không khí: \`${rawData.mq135_value} ppm\`\n`;
      message += `🔥 Gas: \`${rawData.mq2_value}\`\n`;
      message += `💡 Ánh sáng: \`${rawData.light ? 'Sáng' : 'Tối'}\`\n`;
      message += `🔊 Tiếng ồn: \`${rawData.sound ? 'Có' : 'Không'}\`\n\n`;
      
      message += `🕐 ${new Date().toLocaleString('vi-VN')}`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      console.log('📱 Đã gửi báo cáo tổng hợp Telegram');

    } catch (error) {
      console.error('❌ Lỗi gửi báo cáo Telegram:', error.message);
    }
  }

  /**
   * Test gửi message
   */
  async testConnection() {
    if (!this.enabled) {
      console.log('❌ Telegram chưa được cấu hình');
      return false;
    }

    try {
      await this.bot.sendMessage(
        this.chatId,
        '✅ *Telegram Alert System*\n\nHệ thống cảnh báo đã được kích hoạt!\n\n' +
        '📡 Bạn sẽ nhận được thông báo khi:\n' +
        '• Nhiệt độ quá cao/thấp\n' +
        '• Độ ẩm bất thường\n' +
        '• Chất lượng không khí kém\n' +
        '• Phát hiện khí gas/khói\n' +
        '• Tiếng ồn quá mức\n\n' +
        `🕐 ${new Date().toLocaleString('vi-VN')}`,
        { parse_mode: 'Markdown' }
      );
      
      console.log('✅ Telegram connection test thành công');
      return true;
    } catch (error) {
      console.error('❌ Telegram connection test thất bại:', error.message);
      return false;
    }
  }
}

// Singleton instance
let telegramServiceInstance = null;

/**
 * Khởi tạo Telegram service
 */
function initTelegramService(token, chatId) {
  if (!telegramServiceInstance) {
    telegramServiceInstance = new TelegramAlertService(token, chatId);
  }
  return telegramServiceInstance;
}

/**
 * Lấy Telegram service instance
 */
function getTelegramService() {
  return telegramServiceInstance;
}

module.exports = {
  initTelegramService,
  getTelegramService,
  TelegramAlertService,
};
