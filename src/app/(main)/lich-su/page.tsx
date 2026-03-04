"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SensorHistoryRow } from "@/lib/supabase";
import { getByDate, getMinuteStats, getTotalCount, exportCSV, clearAll } from "@/lib/db-storage";
import { Download, Calendar as CalendarIcon, Trash2, Database, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LichSuPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<SensorHistoryRow[]>([]);
  const [minutelyStats, setMinutelyStats] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dayRecords, stats, total] = await Promise.all([
        getByDate(selectedDate),
        getMinuteStats(selectedDate),
        getTotalCount(),
      ]);
      setRecords(dayRecords);
      setMinutelyStats(stats);
      setTotalCount(total);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = async () => {
    const csv = await exportCSV(selectedDate);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-history-${format(selectedDate, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử trên Supabase? Không thể khôi phục!")) {
      await clearAll();
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử"
        description="Dữ liệu cảm biến lưu trữ trên Supabase PostgreSQL."
      />

      {/* Controls */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Database className="h-4 w-4" />
              <span>{isLoading ? "Đang tải..." : `${records.length} bản ghi ngày này`}</span>
              <span className="text-xs">({totalCount} tổng trên Supabase)</span>
            </div>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isLoading || records.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {minutelyStats.length > 0 && (
        <>
          {/* Row 1: Nhiệt độ và Độ ẩm */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  🌡️ Nhiệt độ trung bình theo phút
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={minutelyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="minute" 
                      stroke="#9ca3af"
                      fontSize={10}
                      interval="preserveStartEnd"
                      tickCount={10}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(v) => `${v}°`}
                    />
                    <Tooltip 
                      formatter={(value: any) => value !== null ? [`${value.toFixed(1)}°C`, "Nhiệt độ TB"] : ["N/A", "Nhiệt độ TB"]}
                      labelFormatter={(label) => `Phút ${label}`}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgTemp" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-center text-slate-500 mt-2">Ngưỡng tốt: 22-28°C</div>
              </CardContent>
            </Card>

            {/* Humidity Chart */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  💧 Độ ẩm trung bình theo phút
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={minutelyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="minute" 
                      stroke="#9ca3af"
                      fontSize={10}
                      interval="preserveStartEnd"
                      tickCount={10}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => value !== null ? [`${value.toFixed(1)}%`, "Độ ẩm TB"] : ["N/A", "Độ ẩm TB"]}
                      labelFormatter={(label) => `Phút ${label}`}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgHum" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-center text-slate-500 mt-2">Ngưỡng tốt: 40-60%</div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Chất lượng không khí - Full width */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                💨 Chất lượng không khí (MQ135) theo phút
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={minutelyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="minute" 
                    stroke="#9ca3af"
                    fontSize={10}
                    interval="preserveStartEnd"
                    tickCount={10}
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 50']}
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(0)} PPM`, "MQ135 TB"]}
                    labelFormatter={(label) => `Phút ${label}`}
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgMq135" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-xs text-center text-slate-500 mt-2">
                Tốt: &lt;300 | Bình thường: 300-450 | Trung bình: 450-600 | Xấu: &gt;600
              </div>
            </CardContent>
          </Card>

          {/* Row 3: Ánh sáng, Tiếng ồn, Gas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Light Events */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  💡 Tình trạng ánh sáng theo phút
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={minutelyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="minute" 
                      stroke="#9ca3af"
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      fontSize={11}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(0)}%`, "Thời gian thiếu sáng"]}
                      labelFormatter={(label) => `Phút ${label}`}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="lightPercent" 
                      stroke="#eab308" 
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-center text-slate-500 mt-2">% thời gian thiếu sáng trong phút</div>
              </CardContent>
            </Card>

            {/* Noise Events */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  🔊 Tiếng ồn theo phút
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={minutelyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="minute" 
                      stroke="#9ca3af"
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      fontSize={11}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(0)}%`, "Thời gian có tiếng ồn"]}
                      labelFormatter={(label) => `Phút ${label}`}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="soundPercent" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-center text-slate-500 mt-2">% thời gian có tiếng ồn trong phút</div>
              </CardContent>
            </Card>

            {/* Gas Events */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  🔥 Phát hiện Gas/Khói theo phút
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={minutelyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="minute" 
                      stroke="#9ca3af"
                      fontSize={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 'dataMax + 1']}
                      stroke="#9ca3af"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value} lần`, "Số lần phát hiện"]}
                      labelFormatter={(label) => `Phút ${label}`}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="gasCount" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-center text-slate-500 mt-2">Số lần phát hiện gas/khói trong phút</div>
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Summary Stats */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-900 dark:text-white">📊 Thống kê tổng hợp trong ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(() => {
                  const validTemps = minutelyStats.filter((s: any) => s.avgTemp !== null);
                  const validHums = minutelyStats.filter((s: any) => s.avgHum !== null);
                  const avgTemp = validTemps.length > 0 ? validTemps.reduce((a: number, b: any) => a + b.avgTemp, 0) / validTemps.length : null;
                  const avgHum = validHums.length > 0 ? validHums.reduce((a: number, b: any) => a + b.avgHum, 0) / validHums.length : null;
                  const avgMq135 = minutelyStats.length > 0 ? minutelyStats.reduce((a: number, b: any) => a + (b.avgMq135 || 0), 0) / minutelyStats.length : 0;
                  const totalGas = minutelyStats.reduce((a: number, b: any) => a + (b.gasCount || 0), 0);
                  const avgLight = minutelyStats.length > 0 ? minutelyStats.reduce((a: number, b: any) => a + (b.lightPercent || 0), 0) / minutelyStats.length : 0;
                  const avgSound = minutelyStats.length > 0 ? minutelyStats.reduce((a: number, b: any) => a + (b.soundPercent || 0), 0) / minutelyStats.length : 0;

                  return (
                    <>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{avgTemp !== null ? `${avgTemp.toFixed(1)}°C` : "N/A"}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Nhiệt độ TB</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{avgHum !== null ? `${avgHum.toFixed(1)}%` : "N/A"}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Độ ẩm TB</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{avgMq135.toFixed(0)}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">MQ135 TB</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{avgLight.toFixed(0)}%</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Thiếu sáng TB</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{avgSound.toFixed(0)}%</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Tiếng ồn TB</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{totalGas}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Lần phát hiện gas</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Data Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Chi tiết dữ liệu</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <p>Không có dữ liệu cho ngày này</p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 dark:border-slate-800 max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableHead className="w-[180px] text-slate-900 dark:text-slate-100">Thời gian</TableHead>
                    <TableHead className="text-right text-slate-900 dark:text-slate-100">Nhiệt độ</TableHead>
                    <TableHead className="text-right text-slate-900 dark:text-slate-100">Độ ẩm</TableHead>
                    <TableHead className="text-right text-slate-900 dark:text-slate-100">MQ135</TableHead>
                    <TableHead className="text-center text-slate-900 dark:text-slate-100">Ánh sáng</TableHead>
                    <TableHead className="text-center text-slate-900 dark:text-slate-100">Tiếng ồn</TableHead>
                    <TableHead className="text-center text-slate-900 dark:text-slate-100">Gas/Khói</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 100).map((record) => (
                    <TableRow key={record.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell className="font-mono text-xs text-slate-900 dark:text-slate-100">
                        {format(new Date(record.created_at), "HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right text-slate-900 dark:text-slate-100">
                        {record.temp !== null ? `${record.temp.toFixed(1)}°C` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-slate-900 dark:text-slate-100">
                        {record.hum !== null ? `${record.hum.toFixed(1)}%` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-slate-900 dark:text-slate-100">{record.mq135}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.light === 1 ? "default" : "secondary"}>
                          {record.light}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.sound === 1 ? "destructive" : "secondary"}>
                          {record.sound}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.mq2 === 1 ? "destructive" : "secondary"}>
                          {record.mq2}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {records.length > 100 && (
                <div className="text-center py-4 text-sm text-slate-600 dark:text-slate-400">
                  Hiển thị 100/{records.length} bản ghi
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
