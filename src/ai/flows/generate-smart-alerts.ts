'use server';

/**
 * @fileOverview Generates intelligent alerts in Vietnamese based on sensor data analysis.
 *
 * - generateSmartAlerts - A function that analyzes sensor data and generates alerts.
 * - GenerateSmartAlertsInput - The input type for the generateSmartAlerts function.
 * - GenerateSmartAlertsOutput - The return type for the generateSmartAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartAlertsInputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current humidity percentage.'),
  light: z.number().describe('The current light level in lux.'),
  noise: z.number().describe('The current noise level index.'),
  airQuality: z.number().describe('The current air quality index (MQ-135).'),
  gasSmoke: z.number().describe('The current gas/smoke index (MQ-2).'),
  temperatureThresholdHigh: z.number().describe('High threshold for temperature.'),
  temperatureThresholdLow: z.number().describe('Low threshold for temperature.'),
  humidityThresholdHigh: z.number().describe('High threshold for humidity.'),
  humidityThresholdLow: z.number().describe('Low threshold for humidity.'),
  lightThresholdHigh: z.number().describe('High threshold for light.'),
  lightThresholdLow: z.number().describe('Low threshold for light.'),
  noiseThresholdHigh: z.number().describe('High threshold for noise.'),
  airQualityThresholdHigh: z.number().describe('High threshold for air quality.'),
  gasSmokeThresholdHigh: z.number().describe('High threshold for gas/smoke.'),
});
export type GenerateSmartAlertsInput = z.infer<typeof GenerateSmartAlertsInputSchema>;

const GenerateSmartAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      title: z.string().describe('The title of the alert in Vietnamese.'),
      severity: z.enum(['Tốt', 'Trung bình', 'Nguy hiểm']).describe('The severity of the alert.'),
      message: z.string().describe('The detailed alert message in Vietnamese.'),
    })
  ).describe('A list of alerts generated based on the sensor data.')
});
export type GenerateSmartAlertsOutput = z.infer<typeof GenerateSmartAlertsOutputSchema>;

export async function generateSmartAlerts(input: GenerateSmartAlertsInput): Promise<GenerateSmartAlertsOutput> {
  return generateSmartAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartAlertsPrompt',
  input: {schema: GenerateSmartAlertsInputSchema},
  output: {schema: GenerateSmartAlertsOutputSchema},
  prompt: `You are an AI assistant that analyzes sensor data and generates alerts in Vietnamese when environmental parameters exceed predefined thresholds.

  Consider the following sensor data and thresholds:

  Nhiệt độ (°C): {{temperature}}
  Ngưỡng nhiệt độ (Cao): {{temperatureThresholdHigh}}
  Ngưỡng nhiệt độ (Thấp): {{temperatureThresholdLow}}
  Độ ẩm (%): {{humidity}}
  Ngưỡng độ ẩm (Cao): {{humidityThresholdHigh}}
  Ngưỡng độ ẩm (Thấp): {{humidityThresholdLow}}
  Ánh sáng (lux): {{light}}
  Ngưỡng ánh sáng (Cao): {{lightThresholdHigh}}
  Ngưỡng ánh sáng (Thấp): {{lightThresholdLow}}
  Tiếng ồn: {{noise}}
  Ngưỡng tiếng ồn (Cao): {{noiseThresholdHigh}}
  Chỉ số khí (MQ-135): {{airQuality}}
  Ngưỡng chỉ số khí (Cao): {{airQualityThresholdHigh}}
  Chỉ số gas/khói (MQ-2): {{gasSmoke}}
  Ngưỡng chỉ số gas/khói (Cao): {{gasSmokeThresholdHigh}}

  Generate alerts in Vietnamese based on the following criteria:

  - If a sensor value exceeds its high threshold, generate a "Nguy hiểm" (Dangerous) alert.
  - If a sensor value is below its low threshold, generate a "Nguy hiểm" (Dangerous) alert.
  - If a sensor value is within the thresholds, no alert is needed for that sensor.

  The alerts should be concise and informative, providing the sensor name, the current value, and the reason for the alert.

  Output the alerts in JSON format.
  `,
});

const generateSmartAlertsFlow = ai.defineFlow(
  {
    name: 'generateSmartAlertsFlow',
    inputSchema: GenerateSmartAlertsInputSchema,
    outputSchema: GenerateSmartAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
