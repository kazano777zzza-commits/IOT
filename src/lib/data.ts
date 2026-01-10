import type { Sensor, CurrentSensorData, AlertSeverity } from './types';

export const SENSORS: Omit<Sensor, 'Icon'>[] = [
  {
    id: 'temperature',
    name: 'Nhiệt độ',
    unit: '°C',
    iconName: 'Thermometer',
    thresholds: { low: 20, medium: 28, high: 32 },
  },
  {
    id: 'humidity',
    name: 'Độ ẩm',
    unit: '%',
    iconName: 'Droplets',
    thresholds: { low: 40, medium: 70, high: 85 },
  },
  {
    id: 'light',
    name: 'Ánh sáng',
    unit: 'lux',
    iconName: 'Lightbulb',
    thresholds: { low: 100, medium: 500, high: 1000 },
  },
  {
    id: 'noise',
    name: 'Tiếng ồn',
    unit: 'index',
    iconName: 'Volume2',
    thresholds: { low: null, medium: 60, high: 80 },
  },
  {
    id: 'airQuality',
    name: 'Chỉ số khí (MQ-135)',
    unit: 'index',
    iconName: 'Wind',
    thresholds: { low: null, medium: 150, high: 250 },
  },
  {
    id: 'gasSmoke',
    name: 'Chỉ số gas/khói (MQ-2)',
    unit: 'index',
    iconName: 'Cloud',
    thresholds: { low: null, medium: 200, high: 300 },
  },
];

const getStatus = (value: number, sensor: Omit<Sensor, 'Icon'>): AlertSeverity => {
  if (value >= sensor.thresholds.high) {
    return 'Nguy hiểm';
  }
  if (sensor.thresholds.low !== null && value < sensor.thresholds.low) {
    return 'Nguy hiểm';
  }
  if (value >= sensor.thresholds.medium) {
    return 'Trung bình';
  }
  return 'Tốt';
};

export const generateInitialData = (): CurrentSensorData[] => {
  return SENSORS.map((sensor) => {
    let value = 0;
    switch (sensor.id) {
      case 'temperature':
        value = 24 + Math.random() * 5; // 24-29
        break;
      case 'humidity':
        value = 50 + Math.random() * 20; // 50-70
        break;
      case 'light':
        value = 300 + Math.random() * 200; // 300-500
        break;
      case 'noise':
        value = 40 + Math.random() * 15; // 40-55
        break;
      case 'airQuality':
        value = 100 + Math.random() * 40; // 100-140
        break;
      case 'gasSmoke':
        value = 150 + Math.random() * 40; // 150-190
        break;
    }
    const finalValue = parseFloat(value.toFixed(1));
    return {
      metric: sensor.id,
      value: finalValue,
      timestamp: new Date(),
      status: getStatus(finalValue, sensor),
    };
  });
};

export const getSensorConfig = (metric: string): Omit<Sensor, 'Icon'> | undefined => {
  return SENSORS.find((s) => s.id === metric);
};
