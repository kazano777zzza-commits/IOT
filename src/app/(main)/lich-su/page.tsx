"use client";

import { useState, useEffect } from "react";
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
import { HistoryStorage, type SensorHistoryRecord } from "@/lib/history-storage";
import { Download, Calendar as CalendarIcon, Trash2, Database } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function LichSuPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<SensorHistoryRecord[]>([]);
  const [hourlyStats, setHourlyStats] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const dayRecords = HistoryStorage.getByDate(selectedDate);
    setRecords(dayRecords);
    
    const stats = HistoryStorage.getHourlyStats(selectedDate);
    setHourlyStats(stats);
    
    setTotalCount(HistoryStorage.getCount());
  };

  const handleExportCSV = () => {
    const csv = HistoryStorage.exportCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-history-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      HistoryStorage.clear();
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử"
        description="Xem lại dữ liệu cảm biến đã ghi nhận."
      />

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>{records.length} bản ghi ngày này</span>
              <span className="text-xs">({totalCount} tổng)</span>
            </div>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa lịch sử
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {hourlyStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nhiệt độ theo giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: "Giờ", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
                  <Tooltip 
                    formatter={(value: any) => value !== null ? `${value.toFixed(1)}°C` : "N/A"}
                    labelFormatter={(label) => `Giờ ${label}:00`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgTemp" 
                    stroke="#f97316" 
                    name="Nhiệt độ TB"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Humidity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Độ ẩm theo giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: "Giờ", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis label={{ value: "%", angle: -90, position: "insideLeft" }} />
                  <Tooltip 
                    formatter={(value: any) => value !== null ? `${value.toFixed(1)}%` : "N/A"}
                    labelFormatter={(label) => `Giờ ${label}:00`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgHum" 
                    stroke="#3b82f6" 
                    name="Độ ẩm TB"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Air Quality Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Chất lượng không khí theo giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: "Giờ", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis label={{ value: "PPM", angle: -90, position: "insideLeft" }} />
                  <Tooltip 
                    formatter={(value: any) => `${value.toFixed(0)} PPM`}
                    labelFormatter={(label) => `Giờ ${label}:00`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgMq135" 
                    stroke="#22c55e" 
                    name="MQ135 TB"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết dữ liệu</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Không có dữ liệu cho ngày này</p>
            </div>
          ) : (
            <div className="rounded-md border max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Thời gian</TableHead>
                    <TableHead className="text-right">Nhiệt độ</TableHead>
                    <TableHead className="text-right">Độ ẩm</TableHead>
                    <TableHead className="text-right">MQ135</TableHead>
                    <TableHead className="text-center">Ánh sáng</TableHead>
                    <TableHead className="text-center">Tiếng ồn</TableHead>
                    <TableHead className="text-center">Gas/Khói</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 100).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(record.timestamp), "HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.temp !== null ? `${record.temp.toFixed(1)}°C` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.hum !== null ? `${record.hum.toFixed(1)}%` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">{record.mq135}</TableCell>
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
                <div className="text-center py-4 text-sm text-muted-foreground">
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
