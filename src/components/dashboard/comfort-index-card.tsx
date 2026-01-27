/**
 * Component: ComfortIndexCard
 * Hiển thị chỉ số thoải mái môi trường - 5 mức độ
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, AlertTriangle, AlertCircle } from "lucide-react";

interface ComfortIndexCardProps {
  index: number;
  status: number;
  message: string;
  breakdown?: {
    temp: number;
    humidity: number;
    airQuality: number;
    light: number;
    noise: number;
    gas: number;
  };
  maxPoints?: {
    temp: number;
    humidity: number;
    airQuality: number;
    light: number;
    noise: number;
    gas: number;
  };
}

export function ComfortIndexCard({ index, status, message, breakdown, maxPoints }: ComfortIndexCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 0: return "bg-green-600";
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-600";
      default: return "bg-gray-500";
    }
  };

  const getIcon = () => {
    switch (status) {
      case 0: return <Smile className="h-12 w-12 text-green-600" />;
      case 1: return <Smile className="h-12 w-12 text-green-500" />;
      case 2: return <Meh className="h-12 w-12 text-yellow-500" />;
      case 3: return <AlertTriangle className="h-12 w-12 text-orange-500" />;
      case 4: return <AlertCircle className="h-12 w-12 text-red-600" />;
      default: return <Frown className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 0: return "🟢 Tốt";
      case 1: return "🟡 Bình thường";
      case 2: return "🟠 Trung bình";
      case 3: return "🔴 Xấu";
      case 4: return "⛔ Nguy hiểm";
      default: return "Không xác định";
    }
  };

  const getScoreRange = () => {
    switch (status) {
      case 0: return "80-100";
      case 1: return "60-79";
      case 2: return "40-59";
      case 3: return "20-39";
      case 4: return "0-19";
      default: return "N/A";
    }
  };

  const percentage = Math.min(100, Math.max(0, index));

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Chỉ số thoải mái</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getIcon()}
            <div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">{index}</div>
              <Badge className={getStatusColor()}>{getStatusText()}</Badge>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mức: {getScoreRange()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Nhiệt độ</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.temp || 0}/{maxPoints?.temp || 20} điểm</div>
          </div>
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Độ ẩm</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.humidity || 0}/{maxPoints?.humidity || 20} điểm</div>
          </div>
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Không khí</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.airQuality || 0}/{maxPoints?.airQuality || 20} điểm</div>
          </div>
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Ánh sáng</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.light || 0}/{maxPoints?.light || 15} điểm</div>
          </div>
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Tiếng ồn</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.noise || 0}/{maxPoints?.noise || 10} điểm</div>
          </div>
          <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Gas/Khói</div>
            <div className="text-slate-600 dark:text-slate-400">{breakdown?.gas || 0}/{maxPoints?.gas || 15} điểm</div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="font-medium text-slate-700 dark:text-slate-300">80-100: Tốt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium text-slate-700 dark:text-slate-300">60-79: Bình thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="font-medium text-slate-700 dark:text-slate-300">40-59: Trung bình</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="font-medium text-slate-700 dark:text-slate-300">20-39: Xấu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="font-medium text-slate-700 dark:text-slate-300">0-19: Nguy hiểm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
