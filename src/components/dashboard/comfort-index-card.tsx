/**
 * Component: ComfortIndexCard
 * Hiển thị chỉ số thoải mái môi trường
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown } from "lucide-react";

interface ComfortIndexCardProps {
  index: number; // 0-100
  status: number; // 0=tốt, 1=trung bình, 2=nguy hiểm
  message: string;
}

export function ComfortIndexCard({ index, status, message }: ComfortIndexCardProps) {
  const getStatusColor = () => {
    if (status === 0) return "bg-green-500";
    if (status === 1) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getIcon = () => {
    if (status === 0) return <Smile className="h-12 w-12 text-green-500" />;
    if (status === 1) return <Meh className="h-12 w-12 text-yellow-500" />;
    return <Frown className="h-12 w-12 text-red-500" />;
  };

  const getStatusText = () => {
    if (status === 0) return "Môi trường tốt";
    if (status === 1) return "Cần cải thiện";
    return "Nguy hiểm";
  };

  // Calculate percentage for progress bar
  const percentage = Math.min(100, Math.max(0, index));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Chỉ số thoải mái</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getIcon()}
            <div>
              <div className="text-4xl font-bold">{index}</div>
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Message */}
        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold">Nhiệt độ</div>
            <div className="text-muted-foreground">25%</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold">Độ ẩm</div>
            <div className="text-muted-foreground">20%</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold">Không khí</div>
            <div className="text-muted-foreground">25%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
