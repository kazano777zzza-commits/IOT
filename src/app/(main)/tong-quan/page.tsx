"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Cloud,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Volume2,
  Lightbulb,
  Activity,
  TrendingUp,
  Gauge,
  Sparkles,
  Cpu,
} from "lucide-react";

interface RawSensorData {
  temp: number | null;
  hum: number | null;
  mq135: number;
  light: number;
  sound: number;
  mq2: number;
}

export default function LandingPage() {
  const [data, setData] = useState<RawSensorData | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.4.1/data", {
          cache: "no-store",
        });
        if (response.ok) {
          const rawData = await response.json();
          setData(rawData);
          setOnline(true);
        } else {
          setOnline(false);
        }
      } catch (error) {
        setOnline(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Thermometer,
      title: "Theo dõi Nhiệt độ",
      description: "Giám sát nhiệt độ realtime với độ chính xác cao",
    },
    {
      icon: Droplets,
      title: "Đo Độ ẩm",
      description: "Kiểm soát độ ẩm tối ưu cho không gian làm việc",
    },
    {
      icon: Wind,
      title: "Chất lượng không khí",
      description: "Phát hiện chất lượng không khí và kiểm soát CO2",
    },
    {
      icon: Volume2,
      title: "Cảnh báo Tiếng ồn",
      description: "Theo dõi mức độ ồn để bảo vệ sức khỏe",
    },
    {
      icon: Lightbulb,
      title: "Ánh sáng môi trường",
      description: "Tối ưu ánh sáng cho hiệu suất làm việc",
    },
    {
      icon: Activity,
      title: "Phát hiện Gas/Khói",
      description: "Cảnh báo an toàn với độ nhạy cao",
    },
  ];

  const stats = [
    { label: "Cảm biến hoạt động", value: "6" },
    { label: "Cập nhật realtime", value: "3s" },
    { label: "Độ chính xác", value: "±0.5°" },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-purple-500/20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">IoT Monitor</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition">Solutions</a>
            <a href="#howworks" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition">How it Works</a>
            <Link href="/thoi-gian-thuc">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 dark:opacity-20 animate-pulse" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 dark:opacity-20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.3),rgba(255,255,255,0))]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-purple-600/20 dark:bg-purple-600/30 text-purple-700 dark:text-purple-200 border border-purple-600/40 dark:border-purple-500/50 px-4 py-2 text-sm">
              <Sparkles className="w-3 h-3 mr-2" />
              2026 READY: AI-AUGMENTED DISPATCH
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl font-bold text-slate-900 dark:text-white text-center mb-6 leading-tight">
            Elevate IoT<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-300 dark:to-cyan-300">
              monitoring with intelligent
            </span><br />
            control.
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
            Built for Smart Spaces. Monitor, analyze, and optimize your environment with real-time sensor data and AI-powered insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/thoi-gian-thuc">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-6 text-lg font-semibold flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/lich-su">
              <Button
                variant="outline"
                className="border border-purple-600/40 dark:border-purple-600/40 hover:bg-purple-100 dark:hover:bg-purple-950/50 text-slate-900 dark:text-white px-8 py-6 text-lg font-semibold flex items-center gap-2 dark:hover:text-white"
              >
                View Architecture
                <Gauge className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Connection Status */}
          {!loading && (
            <div className="flex justify-center mb-12">
              <Badge
                className={`flex items-center gap-2 px-4 py-2 ${
                  online
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-600/30 dark:border-emerald-600/30"
                    : "bg-red-500/20 text-red-600 dark:text-red-300 border border-red-600/30 dark:border-red-600/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-red-500 dark:bg-red-400"}`}
                />
                {online ? "All Systems Online" : "Connection Offline"}
              </Badge>
            </div>
          )}

          {/* Live Data Cards */}
          {data && online && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-600/20 dark:border-purple-500/30 rounded-lg p-4 backdrop-blur-sm hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition">
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="text-slate-300 text-sm">Temperature</span>
                </div>
                <div className="text-3xl font-bold text-white">{data.temp?.toFixed(1)}°C</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm hover:bg-purple-500/20 transition">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300 text-sm">Humidity</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.hum?.toFixed(1)}%</div>
              </div>
              <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-600/20 dark:border-purple-500/30 rounded-lg p-4 backdrop-blur-sm hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition">
                <div className="flex items-center gap-3 mb-2">
                  <Wind className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Air Quality</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.mq135}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 dark:from-purple-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Comprehensive Monitoring
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Real-time sensors across 6 environmental parameters with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-purple-500/5 border border-purple-600/30 hover:border-purple-500/50 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/10"
                >
                  <div className="p-3 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-lg w-fit mb-4 group-hover:from-purple-600/50 group-hover:to-cyan-600/50 transition-all">
                    <Icon className="w-6 h-6 text-purple-300" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-950 to-purple-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.15),rgba(255,255,255,0))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-purple-500/10 border border-purple-600/30 rounded-lg p-6 backdrop-blur-sm hover:bg-purple-500/20 transition">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 text-sm">Total Sensors</span>
              </div>
              <div className="text-3xl font-bold text-white">6</div>
              <p className="text-slate-500 text-xs mt-2">Active Monitoring</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-600/30 rounded-lg p-6 backdrop-blur-sm hover:bg-purple-500/20 transition">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 text-sm">Update Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">3s</div>
              <p className="text-slate-500 text-xs mt-2">Real-time Sync</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-600/30 rounded-lg p-6 backdrop-blur-sm hover:bg-purple-500/20 transition">
              <div className="flex items-center gap-3 mb-3">
                <Gauge className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300 text-sm">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-white">±0.5°</div>
              <p className="text-slate-500 text-xs mt-2">Temperature</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-600/30 rounded-lg p-6 backdrop-blur-sm hover:bg-purple-500/20 transition">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-orange-400" />
                <span className="text-slate-300 text-sm">Uptime</span>
              </div>
              <div className="text-3xl font-bold text-white">99%</div>
              <p className="text-slate-500 text-xs mt-2">Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="howworks" className="relative py-32 bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-600/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              From data collection to intelligent insights
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: "1",
                title: "Connect",
                desc: "ESP8266 sensors transmit WiFi data",
                icon: Cpu,
              },
              {
                num: "2",
                title: "Process",
                desc: "Real-time data processing & analysis",
                icon: Zap,
              },
              {
                num: "3",
                title: "Display",
                desc: "Live dashboard updates & insights",
                icon: TrendingUp,
              },
              {
                num: "4",
                title: "Alert",
                desc: "Intelligent notifications & warnings",
                icon: Shield,
              },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative">
                  <div className="bg-purple-500/10 border border-purple-600/30 rounded-lg p-6 backdrop-blur-sm hover:bg-purple-500/20 transition">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step.num}
                    </div>
                    <StepIcon className="w-6 h-6 text-purple-300 mb-3" />
                    <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-700">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border-y border-purple-600/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.25),rgba(255,255,255,0))]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Start Optimizing Today
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Gain complete control over your workspace environment with real-time monitoring and AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/thoi-gian-thuc">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-10 py-6 text-lg font-semibold">
                Access Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/lich-su">
              <Button
                variant="outline"
                className="border border-purple-600/40 hover:bg-purple-950/50 text-white px-10 py-6 text-lg font-semibold"
              >
                View History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-purple-600/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">IoT Monitor</span>
              </div>
              <p className="text-slate-400 text-sm">
                Intelligent environmental monitoring for smart spaces.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/thoi-gian-thuc" className="text-slate-400 hover:text-purple-300 text-sm transition">
                  Dashboard
                </Link>
                <Link href="/lich-su" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Analytics
                </Link>
                <Link href="/thiet-bi" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Devices
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  About
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Blog
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Privacy
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Terms
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-300 text-sm transition block">
                  Contact
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-600/30 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <div>© 2026 IoT Monitor Pro. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-300 transition">Twitter</a>
              <a href="#" className="hover:text-purple-300 transition">LinkedIn</a>
              <a href="#" className="hover:text-purple-300 transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
