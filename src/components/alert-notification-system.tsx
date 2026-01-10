/**
 * Alert Notification System
 * Hiển thị popup cảnh báo khi vượt ngưỡng
 */

"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AlertNotification {
  id: string;
  type: "success" | "warning" | "danger";
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: number; // milliseconds
}

interface AlertNotificationSystemProps {
  alerts: AlertNotification[];
  onDismiss: (id: string) => void;
  enableSound?: boolean;
}

export function AlertNotificationSystem({
  alerts,
  onDismiss,
  enableSound = true,
}: AlertNotificationSystemProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && enableSound) {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
  }, [enableSound]);

  useEffect(() => {
    // Play sound for danger alerts
    if (enableSound && audioContext && alerts.some(a => a.type === "danger")) {
      playAlertSound();
    }

    // Auto-close alerts
    alerts.forEach((alert) => {
      if (alert.autoClose) {
        setTimeout(() => {
          onDismiss(alert.id);
        }, alert.autoClose);
      }
    });
  }, [alerts, enableSound, audioContext]);

  const playAlertSound = () => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "danger":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case "danger":
        return "destructive";
      default:
        return "default";
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={getVariant(alert.type)}
          className={`
            animate-in slide-in-from-right-5 
            ${alert.type === "danger" ? "animate-pulse" : ""}
            shadow-lg
          `}
        >
          <div className="flex items-start gap-2">
            {getIcon(alert.type)}
            <div className="flex-1">
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
              <div className="text-xs text-muted-foreground mt-1">
                {alert.timestamp.toLocaleTimeString("vi-VN")}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDismiss(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}

/**
 * Hook to manage alerts
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  const addAlert = (
    type: "success" | "warning" | "danger",
    title: string,
    message: string,
    autoClose?: number
  ) => {
    const newAlert: AlertNotification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date(),
      autoClose: autoClose || (type === "success" ? 5000 : undefined),
    };

    setAlerts((prev) => [...prev, newAlert]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    addAlert,
    dismissAlert,
    clearAlerts,
  };
}
