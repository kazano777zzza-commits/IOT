import { type LucideIcon } from 'lucide-react';

export type SensorMetric =
  | 'temperature'
  | 'humidity'
  | 'light'
  | 'noise'
  | 'airQuality'
  | 'gasSmoke';

export type AlertSeverity = 'Tốt' | 'Trung bình' | 'Nguy hiểm';

export interface Sensor {
  id: SensorMetric;
  name: string;
  unit: string;
  Icon: LucideIcon;
  thresholds: {
    low: number | null;
    high: number;
    medium: number;
  };
}

export interface SensorDataPoint {
  metric: SensorMetric;
  value: number;
  timestamp: Date;
}

export interface CurrentSensorData extends SensorDataPoint {
  status: AlertSeverity;
}

export interface SmartAlert {
  title: string;
  severity: AlertSeverity;
  message: string;
}

export interface GeneratedAlert extends SmartAlert {
  id: string;
  timestamp: Date;
}

export interface DeviceStatus {
  online: boolean;
  lastSeen: Date;
  wifiStrength: 'Mạnh' | 'Vừa' | 'Yếu' | 'Không rõ';
  dataInterval: number;
}
