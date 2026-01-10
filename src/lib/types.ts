import { type LucideIcon } from 'lucide-react';
import type * as Icons from 'lucide-react';

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
  iconName: keyof typeof Icons;
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
