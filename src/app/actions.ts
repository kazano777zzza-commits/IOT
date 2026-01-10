'use server';

import {
  generateSmartAlerts,
  type GenerateSmartAlertsInput,
} from '@/ai/flows/generate-smart-alerts';
import { SENSORS } from '@/lib/data';
import type { CurrentSensorData, SmartAlert } from '@/lib/types';

export async function generateAlertsAction(
  currentData: CurrentSensorData[]
): Promise<SmartAlert[]> {
  try {
    const input: GenerateSmartAlertsInput = {
      temperature: currentData.find((d) => d.metric === 'temperature')?.value ?? 0,
      humidity: currentData.find((d) => d.metric === 'humidity')?.value ?? 0,
      light: currentData.find((d) => d.metric === 'light')?.value ?? 0,
      noise: currentData.find((d) => d.metric === 'noise')?.value ?? 0,
      airQuality: currentData.find((d) => d.metric === 'airQuality')?.value ?? 0,
      gasSmoke: currentData.find((d) => d.metric === 'gasSmoke')?.value ?? 0,
      temperatureThresholdHigh: SENSORS.find(s => s.id === 'temperature')?.thresholds.high ?? 32,
      temperatureThresholdLow: SENSORS.find(s => s.id === 'temperature')?.thresholds.low ?? 20,
      humidityThresholdHigh: SENSORS.find(s => s.id === 'humidity')?.thresholds.high ?? 85,
      humidityThresholdLow: SENSORS.find(s => s.id === 'humidity')?.thresholds.low ?? 40,
      lightThresholdHigh: SENSORS.find(s => s.id === 'light')?.thresholds.high ?? 1000,
      lightThresholdLow: SENSORS.find(s => s.id === 'light')?.thresholds.low ?? 100,
      noiseThresholdHigh: SENSORS.find(s => s.id === 'noise')?.thresholds.high ?? 80,
      airQualityThresholdHigh: SENSORS.find(s => s.id === 'airQuality')?.thresholds.high ?? 250,
      gasSmokeThresholdHigh: SENSORS.find(s => s.id === 'gasSmoke')?.thresholds.high ?? 300,
    };

    const result = await generateSmartAlerts(input);
    return result.alerts;
  } catch (error) {
    console.error('Error generating smart alerts:', error);
    return [];
  }
}
