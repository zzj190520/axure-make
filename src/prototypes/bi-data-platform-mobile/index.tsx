/**
 * @name BI数据管理平台(移动端)
 *
 * 产线日常数据移动端适配版本，针对小屏幕优化交互体验。
 * 采用底部导航 + 可滑动子Tab + 卡片列表布局。
 *
 * 参考资料：
 * - /rules/development-standards.md
 * - /rules/design-guide.md
 * - /src/themes/antd-new/designToken.json
 */

import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import {
  ConfigProvider, Select, Tag, Space, Button,
  InputNumber, Form, Popconfirm, Typography, Badge,
  Modal, DatePicker, Tabs,
} from 'antd';
import {
  PlusOutlined, HomeOutlined, ToolOutlined, WarningOutlined,
  UserOutlined, BellOutlined, ClockCircleOutlined, CheckCircleOutlined,
  RiseOutlined, FallOutlined, EnvironmentOutlined, DashboardOutlined,
  MoreOutlined, ArrowLeftOutlined, BarChartOutlined, CalendarOutlined,
  LineChartOutlined, ThunderboltOutlined, FieldTimeOutlined, FundOutlined,
  AlertOutlined, SyncOutlined, InboxOutlined, ExperimentOutlined,
  CheckOutlined, SwapOutlined, FireOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  featured?: boolean;
  large?: boolean;
  valueStyle?: React.CSSProperties;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, unit, variant = 'primary', icon, footer, featured, large, valueStyle,
}) => (
  <div className={`bim-metric-card bim-metric-card--${variant}${featured ? ' bim-metric-card--featured' : ''}`}>
    <div className="bim-metric-card-deco" />
    {icon && <div className="bim-metric-icon">{icon}</div>}
    <div className="bim-metric-label">{label}</div>
    <div className={`bim-metric-value${large ? ' bim-metric-value--large' : ''}`} style={valueStyle}>
      {value}{unit && <span className="bim-metric-unit">{unit}</span>}
    </div>
    {footer && <div className="bim-metric-footer">{footer}</div>}
  </div>
);

const ChartSection: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title, subtitle, icon, children,
}) => (
  <div className="bim-chart-section">
    <div className="bim-chart-title">
      {icon && <span className="bim-chart-title-icon">{icon}</span>}
      {title}
      {subtitle && <span className="bim-chart-subtitle">{subtitle}</span>}
    </div>
    {children}
  </div>
);

const EXCEPTION_TYPE_CONFIG: Record<string, { cls: string; icon: React.ReactNode }> = {
  '设备故障': { cls: 'fault', icon: <ToolOutlined /> },
  '物料短缺': { cls: 'material', icon: <InboxOutlined /> },
  '品质异常': { cls: 'quality', icon: <ExperimentOutlined /> },
  '换型停机': { cls: 'changeover', icon: <SyncOutlined /> },
};

// ==================== Constants ====================

const PRODUCTION_LINES = [
  { value: 'ed1', label: '电驱一线' }, { value: 'ed2', label: '电驱二线' },
  { value: 'ed3', label: '电驱三线' }, { value: 'ed4', label: '电驱四线' },
  { value: 'ed5', label: '电驱五线' }, { value: 'ec', label: '电控产线' },
  { value: 'dr', label: '定转子产线' }, { value: 'ps', label: '电源产线' },
  { value: 'op', label: '油泵产线' }, { value: 'cp', label: '压缩机产线' },
];

const DATE_LABELS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

const genData = (base: number, variance: number, len = 30) =>
  Array.from({ length: len }, () => +(base + (Math.random() - 0.5) * variance).toFixed(2));

// ==================== Mock Data ====================

// 首页运营数据指标（Hero + 核心指标）
const HOME_METRICS = {
  loadTime: 720,
  operationTime: 720,
  fttOffline: 99.38,
  fttTarget: 99,
  oeeOffline: 86,
  oeeTarget: 90,
  planOutput: 720,
  actualOutput: 720,
  planAchievementRate: 99,
};

const OEE_DATA = {
  actual: 86, target: 90,
  loadTime: 480, operationTime: 412.8, downtime: 67.2,
  timeRate: 86, performanceRate: 95.2, productionRate: 93.5,
  trendActual: genData(84, 8), trendTarget: Array(30).fill(90),
  eolActual: genData(87, 6), eolTarget: Array(30).fill(90),
  details: DATE_LABELS.slice(-14).map((d, i) => ({
    key: i, date: d, loadTime: Math.round(480 + Math.random() * 20),
    operationTime: Math.round(400 + Math.random() * 30), downtime: Math.round(50 + Math.random() * 30),
    timeRate: +(85 + Math.random() * 10).toFixed(1), performanceRate: +(90 + Math.random() * 8).toFixed(1),
    actualOEE: +(82 + Math.random() * 12).toFixed(1), targetOEE: 90,
    diff: +(Math.random() * 10 - 5).toFixed(1),
  })),
};

const FTT_DATA = {
  actual: 99.38, target: 99.5,
  trendActual: genData(99.3, 0.6), trendTarget: Array(30).fill(99.5),
  details: DATE_LABELS.slice(-14).map((d, i) => ({
    key: i, date: d, actualFTT: +(99 + Math.random()).toFixed(2),
    targetFTT: 99.5, diff: +(Math.random() * 1 - 0.5).toFixed(2),
    qualified: Math.round(1200 + Math.random() * 50), unqualified: Math.round(Math.random() * 10),
    firstPassRate: +(98 + Math.random() * 2).toFixed(1),
  })),
};

const PRODUCTION_RATE_DATA = {
  actual: 99, target: 99,
  trend: genData(96, 6),
  details: DATE_LABELS.slice(-14).map((d, i) => ({
    key: i, date: d, plan: Math.round(700 + Math.random() * 50),
    actual: Math.round(680 + Math.random() * 60), rate: +(95 + Math.random() * 5).toFixed(1),
    diff: +(Math.random() * 40 - 20).toFixed(0),
  })),
};

const CYCLE_TIME_DATA = [
  { key: 1, station: 'OP10', name: '铣削端面', count: 1247, standard: 42, actual: 45, balance: 93.3 },
  { key: 2, station: 'OP20', name: '钻孔加工', count: 1247, standard: 38, actual: 37, balance: 102.7 },
  { key: 3, station: 'OP30', name: '攻丝工序', count: 1247, standard: 35, actual: 41, balance: 85.4, bottleneck: true },
  { key: 4, station: 'OP40', name: '精车外圆', count: 1247, standard: 45, actual: 44, balance: 102.3 },
  { key: 5, station: 'OP50', name: '磨削精加工', count: 1247, standard: 50, actual: 48, balance: 104.2 },
  { key: 6, station: 'OP60', name: '清洗检测', count: 1247, standard: 30, actual: 32, balance: 93.8 },
  { key: 7, station: 'OP70', name: '装配压装', count: 1247, standard: 55, actual: 53, balance: 103.8 },
  { key: 8, station: 'OP80', name: '气密测试', count: 1247, standard: 28, actual: 29, balance: 96.6 },
  { key: 9, station: 'OP90', name: '功能测试', count: 1247, standard: 40, actual: 42, balance: 95.2 },
  { key: 10, station: 'OP100', name: '外观检查', count: 1247, standard: 20, actual: 22, balance: 90.9 },
  { key: 11, station: 'OP110', name: '包装入库', count: 1247, standard: 25, actual: 24, balance: 104.2 },
  { key: 12, station: 'EOL', name: '下线终检', count: 1247, standard: 35, actual: 36, balance: 97.2 },
];

const EXCEPTION_DATA = [
  { key: 1, time: '06-13 08:23', line: '电驱一线', type: '设备故障', desc: 'OP30攻丝机主轴异常振动', duration: 45, status: '已解决', handler: '张工' },
  { key: 2, time: '06-13 09:15', line: '电驱三线', type: '物料短缺', desc: '轴承物料B-2047库存不足', duration: 30, status: '处理中', handler: '李工' },
  { key: 3, time: '06-12 14:30', line: '电控产线', type: '品质异常', desc: 'PCB板焊接不良率超标(2.3%)', duration: 60, status: '已解决', handler: '王工' },
  { key: 4, time: '06-12 16:45', line: '电驱二线', type: '设备故障', desc: 'OP50磨削机冷却液温度过高', duration: 25, status: '已解决', handler: '赵工' },
  { key: 5, time: '06-11 10:00', line: '油泵产线', type: '换型停机', desc: '型号切换 OP-A32 → OP-B18', duration: 90, status: '已解决', handler: '孙工' },
  { key: 6, time: '06-11 13:20', line: '压缩机产线', type: '设备故障', desc: 'OP70装配工位气动夹具漏气', duration: 35, status: '待处理', handler: '周工' },
];

const ENV_DATA = [
  { key: 1, checkTime: '06:00', position: '车间A区', shift: '早班', temperature: 23.5, humidity: 55.2 },
  { key: 2, checkTime: '06:00', position: '车间B区', shift: '早班', temperature: 24.1, humidity: 53.8 },
  { key: 3, checkTime: '06:00', position: '仓储区', shift: '早班', temperature: 22.8, humidity: 58.1 },
  { key: 4, checkTime: '14:00', position: '车间A区', shift: '中班', temperature: 26.3, humidity: 52.4 },
  { key: 5, checkTime: '14:00', position: '车间B区', shift: '中班', temperature: 27.0, humidity: 50.6 },
  { key: 6, checkTime: '22:00', position: '车间A区', shift: '晚班', temperature: 22.1, humidity: 60.5 },
  { key: 7, checkTime: '22:00', position: '车间B区', shift: '晚班', temperature: 22.8, humidity: 59.2 },
];

// 异常总览数据
const EXCEPTION_OVERVIEW = {
  equipmentFault: 45, materialShortage: 12, qualityIssue: 8, changeover: 5, plannedDowntime: 3,
};

// 维修记录
const MAINTENANCE_RECORDS = [
  { key: 1, faultTime: '06-13 08:23', type: '设备故障', repairDuration: 45, handler: '张工', status: '已解决' },
  { key: 2, faultTime: '06-13 09:15', type: '物料短缺', repairDuration: 30, handler: '李工', status: '处理中' },
  { key: 3, faultTime: '06-12 14:30', type: '品质异常', repairDuration: 60, handler: '王工', status: '已解决' },
];

// 故障率统计
const FAULT_RATE_STATS = {
  faultRate: 2.3, mttr: 35, mtbf: 120,
};

// TOP故障
const TOP_FAULTS = [
  { rank: 1, type: '主轴振动', count: 12, percentage: 35 },
  { rank: 2, type: '冷却液温度高', count: 8, percentage: 23 },
  { rank: 3, type: '气动夹具漏气', count: 6, percentage: 17 },
  { rank: 4, type: '焊接不良', count: 5, percentage: 14 },
  { rank: 5, type: '尺寸超差', count: 4, percentage: 11 },
];

// ==================== Chart Hook ====================

const useChart = (getOption: () => echarts.EChartsOption, deps: any[] = []) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instance = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    if (!instance.current) instance.current = echarts.init(chartRef.current);
    instance.current.setOption(getOption(), true);
    const ro = new ResizeObserver(() => instance.current?.resize());
    ro.observe(chartRef.current);
    return () => { ro.disconnect(); instance.current?.dispose(); instance.current = null; };
  }, deps);
  return chartRef;
};

// ==================== Mobile Charts ====================

const OEEChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { data: ['EOL站', '下线站', '目标'], top: 0, textStyle: { fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    grid: { top: 28, left: 8, right: 8, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#bbb', fontSize: 9, interval: 6 } },
    yAxis: { type: 'value', min: 72, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#bbb', fontSize: 9, formatter: '{value}%' } },
    series: [
      { name: 'EOL站', type: 'line', data: OEE_DATA.eolActual, smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#1677ff' }, itemStyle: { color: '#1677ff' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,119,255,0.12)' }, { offset: 1, color: 'rgba(22,119,255,0)' }] } } },
      { name: '下线站', type: 'line', data: OEE_DATA.trendActual, smooth: true, symbol: 'none', lineStyle: { width: 1.5, color: '#52c41a' }, itemStyle: { color: '#52c41a' } },
      { name: '目标', type: 'line', data: OEE_DATA.trendTarget, symbol: 'none', lineStyle: { width: 1, color: '#ff4d4f', type: 'dashed' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 220, width: '100%' }} />;
};

const FTTChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { data: ['实际FTT', '目标'], top: 0, textStyle: { fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    grid: { top: 28, left: 8, right: 8, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#bbb', fontSize: 9, interval: 6 } },
    yAxis: { type: 'value', min: 98.2, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#bbb', fontSize: 9, formatter: '{value}%' } },
    series: [
      { name: '实际FTT', type: 'line', data: FTT_DATA.trendActual, smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#722ed1' }, itemStyle: { color: '#722ed1' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(114,46,209,0.1)' }, { offset: 1, color: 'rgba(114,46,209,0)' }] } } },
      { name: '目标', type: 'line', data: FTT_DATA.trendTarget, symbol: 'none', lineStyle: { width: 1, color: '#ff4d4f', type: 'dashed' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 220, width: '100%' }} />;
};

const RateChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    grid: { top: 12, left: 8, right: 8, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#bbb', fontSize: 9, interval: 6 } },
    yAxis: { type: 'value', min: 75, max: 110, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#bbb', fontSize: 9, formatter: '{value}%' } },
    series: [
      { type: 'bar', data: PRODUCTION_RATE_DATA.trend, barWidth: '55%', itemStyle: { color: (p: any) => p.value >= 95 ? '#52c41a' : p.value >= 85 ? '#faad14' : '#ff4d4f', borderRadius: [2, 2, 0, 0] } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 200, width: '100%' }} />;
};

const TempHumChart = () => {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { data: ['温度℃', '湿度%'], top: 0, textStyle: { fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    grid: { top: 28, left: 8, right: 8, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#bbb', fontSize: 9 } },
    yAxis: [
      { type: 'value', min: 18, max: 32, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#bbb', fontSize: 9 } },
      { type: 'value', min: 40, max: 70, axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#bbb', fontSize: 9 } },
    ],
    series: [
      { name: '温度℃', type: 'line', data: [23.5, 24.2, 25.8, 26.5, 27.1, 26.3, 24.8, 23.2, 22.1], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#fa541c' }, itemStyle: { color: '#fa541c' } },
      { name: '湿度%', type: 'line', yAxisIndex: 1, data: [55.2, 53.8, 51.5, 49.8, 50.6, 52.1, 54.3, 57.8, 60.5], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#13c2c2' }, itemStyle: { color: '#13c2c2' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 200, width: '100%' }} />;
};

const OpTrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
    legend: { data: ['负荷', '稼动', '停机'], top: 0, textStyle: { fontSize: 10 }, itemWidth: 14, itemHeight: 8 },
    grid: { top: 28, left: 8, right: 8, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS.slice(-14), axisLine: { lineStyle: { color: '#eee' } }, axisLabel: { color: '#bbb', fontSize: 9 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#bbb', fontSize: 9 } },
    series: [
      { name: '负荷', type: 'bar', stack: 'a', data: genData(480, 20, 14), barWidth: '40%', itemStyle: { color: '#1677ff' } },
      { name: '稼动', type: 'bar', stack: 'a', data: genData(400, 30, 14), itemStyle: { color: '#52c41a' } },
      { name: '停机', type: 'line', data: genData(55, 40, 14), smooth: true, symbol: 'none', lineStyle: { width: 1.5, color: '#ff4d4f' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 220, width: '100%' }} />;
};

// ==================== Tab Views ====================

// 首页 - 运营数据
const HomeView = ({
  onShowLineSelector, onShowTimeSelector, lineLabel, dateTitle,
}: {
  onShowLineSelector: () => void;
  onShowTimeSelector: () => void;
  lineLabel: string;
  dateTitle: string;
}) => (
  <div>
    {/* Hero 概览 - 综合 OEE */}
    <div className="bim-hero-card">
      <div className="bim-hero-top">
        <div>
          <div className="bim-hero-label">{lineLabel} · 今日综合 OEE</div>
          <div className="bim-hero-value">
            {HOME_METRICS.oeeOffline}<span className="bim-hero-unit">%</span>
          </div>
        </div>
        <span className={`bim-hero-badge ${HOME_METRICS.oeeOffline >= HOME_METRICS.oeeTarget ? 'bim-hero-badge--good' : 'bim-hero-badge--warn'}`}>
          {HOME_METRICS.oeeOffline >= HOME_METRICS.oeeTarget ? <RiseOutlined /> : <FallOutlined />}
          目标 {HOME_METRICS.oeeTarget}%
        </span>
      </div>
      <div className="bim-hero-stats">
        <div className="bim-hero-stat">
          <div className="bim-hero-stat-value">{HOME_METRICS.actualOutput}</div>
          <div className="bim-hero-stat-label">实际产量</div>
        </div>
        <div className="bim-hero-stat">
          <div className="bim-hero-stat-value">{HOME_METRICS.fttOffline}%</div>
          <div className="bim-hero-stat-label">FTT</div>
        </div>
        <div className="bim-hero-stat">
          <div className="bim-hero-stat-value">{HOME_METRICS.planAchievementRate}%</div>
          <div className="bim-hero-stat-label">达产率</div>
        </div>
      </div>
    </div>

    {/* 核心指标 - 2列卡片网格 */}
    <div className="bim-section-header">
      <span className="bim-section-title">
        <span className="bim-section-title-icon"><DashboardOutlined /></span>
        核心指标
      </span>
      <span className="bim-section-hint">今日</span>
    </div>
    <div className="bim-metric-grid bim-metric-grid--double">
      <MetricCard label="负荷时间" value={HOME_METRICS.loadTime} unit="min" variant="primary" icon={<ClockCircleOutlined />} />
      <MetricCard label="稼动时间" value={HOME_METRICS.operationTime} unit="min" variant="success" icon={<FieldTimeOutlined />} />
      <MetricCard label="OEE(目标)" value={HOME_METRICS.oeeTarget} unit="%" variant="warning" icon={<FundOutlined />} />
      <MetricCard label="FTT(目标)" value={HOME_METRICS.fttTarget} unit="%" variant="info" icon={<CheckCircleOutlined />} />
      <MetricCard label="计划产量" value={HOME_METRICS.planOutput} unit="台" variant="primary" icon={<BarChartOutlined />} />
      <MetricCard label="实际产量" value={HOME_METRICS.actualOutput} unit="台" variant="success" icon={<ThunderboltOutlined />} />
    </div>

    <ChartSection title="OEE 走势图" subtitle="EOL站 / 下线站" icon={<LineChartOutlined />}>
      <OEEChart />
    </ChartSection>

    <div className="bim-action-chips">
      <div className="bim-action-chip bim-action-chip--primary" onClick={onShowLineSelector}>
        <EnvironmentOutlined className="bim-action-chip-icon" />
        {lineLabel}
      </div>
      <div className="bim-action-chip" onClick={onShowTimeSelector}>
        <CalendarOutlined className="bim-action-chip-icon" />
        {dateTitle}
      </div>
    </div>
  </div>
);

const OEEView = () => (
  <div>
    <div className="bim-metric-grid bim-metric-grid--double">
      <MetricCard
        label="实际OEE(MES)" value={OEE_DATA.actual} unit="%" variant="warning" featured large
        icon={<FundOutlined />}
        valueStyle={{ color: OEE_DATA.actual >= OEE_DATA.target ? '#10B981' : '#F59E0B' }}
        footer={<>目标 {OEE_DATA.target}%<span className="bim-metric-compare bim-metric-compare--down" style={{ marginLeft: 8 }}><FallOutlined /> -{OEE_DATA.target - OEE_DATA.actual}%</span></>}
      />
    </div>
    <div className="bim-metric-grid bim-metric-grid--double">
      <MetricCard label="时间稼动率" value={OEE_DATA.timeRate} unit="%" variant="primary" icon={<ClockCircleOutlined />} footer={`${OEE_DATA.operationTime}/${OEE_DATA.loadTime} min`} />
      <MetricCard label="性能稼动率" value={OEE_DATA.performanceRate} unit="%" variant="success" icon={<ThunderboltOutlined />} footer={<span className="bim-metric-compare bim-metric-compare--up"><RiseOutlined /> +1.2%</span>} />
      <MetricCard label="负荷时间" value={OEE_DATA.loadTime} unit="min" variant="primary" icon={<FieldTimeOutlined />} />
      <MetricCard label="非计划停机" value={OEE_DATA.downtime} unit="min" variant="error" icon={<AlertOutlined />} />
    </div>
    <ChartSection title="OEE 走势图" subtitle="EOL站 / 下线站" icon={<LineChartOutlined />}>
      <OEEChart />
    </ChartSection>
  </div>
);

const FTTView = () => (
  <div>
    <div className="bim-metric-grid bim-metric-grid--double">
      <MetricCard
        label="实际FTT(下线)" value={FTT_DATA.actual} unit="%" variant="info" featured large
        icon={<CheckCircleOutlined />}
        footer={<>目标 {FTT_DATA.target}%<span className="bim-metric-compare bim-metric-compare--down" style={{ marginLeft: 8 }}><FallOutlined /> -{(FTT_DATA.target - FTT_DATA.actual).toFixed(2)}%</span></>}
      />
      <MetricCard label="今日合格" value="1,238" unit="件" variant="success" icon={<CheckCircleOutlined />} />
      <MetricCard label="不良品" value={8} unit="件" variant="error" icon={<WarningOutlined />} footer="焊接3、尺寸2" />
    </div>
    <ChartSection title="FTT 趋势" subtitle="近30天" icon={<LineChartOutlined />}>
      <FTTChart />
    </ChartSection>
  </div>
);

const RateView = () => (
  <div>
    <div className="bim-metric-grid bim-metric-grid--double">
      <MetricCard label="达产率" value={PRODUCTION_RATE_DATA.actual} unit="%" variant="primary" icon={<BarChartOutlined />} footer={`目标 ${PRODUCTION_RATE_DATA.target}%`} />
      <MetricCard label="今日产量" value={462} unit="台" variant="success" icon={<ThunderboltOutlined />} footer="计划 480" />
    </div>
    <ChartSection title="达产率趋势" icon={<BarChartOutlined />}>
      <RateChart />
    </ChartSection>
    <div className="bim-data-list">
      <div className="bim-data-list-header">
        <span className="bim-data-list-title">
          <span className="bim-data-list-title-icon"><FundOutlined /></span>
          达产率明细
        </span>
      </div>
      {PRODUCTION_RATE_DATA.details.slice(0, 7).map(r => (
        <div className="bim-list-item" key={r.key}>
          <div className="bim-list-item-top">
            <span className="bim-list-item-title">{r.date}</span>
            <Tag color={r.rate >= 95 ? 'success' : r.rate >= 85 ? 'warning' : 'error'}>{r.rate}%</Tag>
          </div>
          <div className="bim-list-item-meta">
            <span className="bim-list-item-meta-item">计划 {r.plan}</span>
            <span className="bim-list-item-meta-item">实际 {r.actual}</span>
            <span className="bim-list-item-meta-item" style={{ color: r.actual >= r.plan ? '#52c41a' : '#ff4d4f' }}>差 {r.actual - r.plan > 0 ? '+' : ''}{r.actual - r.plan}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CycleTimeView = () => {
  const avgTakt = (CYCLE_TIME_DATA.reduce((s, d) => s + d.actual, 0) / CYCLE_TIME_DATA.length).toFixed(1);
  const anomalyCount = CYCLE_TIME_DATA.filter(d => Math.abs(d.actual - d.standard) > 3).length;
  return (
    <div>
      <div className="bim-metric-grid bim-metric-grid--double">
        <MetricCard label="平衡率" value={86} unit="%" variant="primary" icon={<DashboardOutlined />} />
        <MetricCard label="平均节拍" value={avgTakt} unit="s" variant="success" icon={<FieldTimeOutlined />} />
        <MetricCard label="异常工位" value={anomalyCount} unit="个" variant="error" icon={<AlertOutlined />} />
        <MetricCard label="瓶颈工序" value="OP30" unit=" 攻丝" variant="warning" icon={<WarningOutlined />} valueStyle={{ fontSize: 18 }} />
      </div>
      <div className="bim-balance-bar-wrap">
        <div className="bim-balance-header">
          <span className="bim-balance-label"><ThunderboltOutlined /> 产线平衡率</span>
          <span className="bim-balance-value">86%</span>
        </div>
        <div className="bim-balance-track"><div className="bim-balance-fill" style={{ width: '86%', background: 'linear-gradient(90deg, #458EF8 0%, #6BAFFF 50%, #10B981 100%)' }} /></div>
        <div className="bim-balance-marks"><span>0%</span><span>目标 90%</span><span>100%</span></div>
      </div>
      <div className="bim-data-list">
        <div className="bim-data-list-header">
          <span className="bim-data-list-title">
            <span className="bim-data-list-title-icon"><FieldTimeOutlined /></span>
            工位节拍明细
          </span>
        </div>
        {CYCLE_TIME_DATA.map(d => (
          <div className={`bim-station-card${d.bottleneck ? ' bim-station-card--bottleneck' : ''}`} key={d.key}>
            <div className="bim-station-top">
              <div className="bim-station-name"><span className="bim-station-id">{d.station}</span>{d.name}</div>
              {d.bottleneck ? <span className="bim-tag-bottleneck"><WarningOutlined /> 瓶颈</span> : Math.abs(d.actual - d.standard) > 3 ? <span className="bim-tag-anomaly"><WarningOutlined /> 异常</span> : <span className="bim-tag-normal">正常</span>}
            </div>
            <div className="bim-station-stats">
              <div className="bim-station-stat"><div className="bim-station-stat-label">标准</div><div className="bim-station-stat-value">{d.standard}s</div></div>
              <div className="bim-station-stat"><div className="bim-station-stat-label">实际</div><div className={`bim-station-stat-value ${Math.abs(d.actual - d.standard) > 3 ? 'bim-station-stat-value--danger' : ''}`}>{d.actual}s</div></div>
              <div className="bim-station-stat"><div className="bim-station-stat-label">平衡率</div><div className={`bim-station-stat-value ${d.balance >= 95 && d.balance <= 105 ? 'bim-station-stat-value--success' : ''}`}>{d.balance}%</div></div>
              <div className="bim-station-stat"><div className="bim-station-stat-label">过站数</div><div className="bim-station-stat-value">{d.count.toLocaleString()}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExceptionView = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const data = filter ? EXCEPTION_DATA.filter(d => d.type === filter) : EXCEPTION_DATA;
  const types = ['设备故障', '物料短缺', '品质异常', '换型停机'] as const;
  const statusBadge: Record<string, 'success' | 'processing' | 'warning'> = { '已解决': 'success', '处理中': 'processing', '待处理': 'warning' };
  return (
    <div>
      <div className="bim-filter-bar">
        <span className="bim-filter-label"><SwapOutlined /> 筛选</span>
        {types.map(t => {
          const cfg = EXCEPTION_TYPE_CONFIG[t];
          return (
            <span
              key={t}
              className={`bim-filter-tag bim-filter-tag--${cfg.cls} ${filter === t ? 'bim-filter-tag--active' : ''}`}
              onClick={() => setFilter(filter === t ? null : t)}
            >
              {cfg.icon} {t}
            </span>
          );
        })}
      </div>
      <div className="bim-data-list">
        {data.map(d => {
          const cfg = EXCEPTION_TYPE_CONFIG[d.type] || { cls: 'fault', icon: <AlertOutlined /> };
          return (
            <div className={`bim-exception-card bim-exception-card--${cfg.cls}`} key={d.key}>
              <div className="bim-exception-header">
                <span className="bim-exception-type">
                  <span className="bim-exception-type-icon">{cfg.icon}</span>
                  {d.type}
                </span>
                <Badge status={statusBadge[d.status]} text={d.status} />
              </div>
              <div className="bim-exception-desc">{d.desc}</div>
              <div className="bim-exception-footer">
                <span className="bim-exception-meta"><ClockCircleOutlined /> {d.time}</span>
                <span className="bim-exception-meta"><EnvironmentOutlined /> {d.line}</span>
                <span className="bim-exception-meta">停机 {d.duration}min</span>
                <span className="bim-exception-meta">{d.handler}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OperationsView = () => (
  <div>
    <div className="bim-metric-grid">
      <div className="bim-metric-card bim-metric-card--primary"><div className="bim-metric-label">负荷时间</div><div className="bim-metric-value">{OEE_DATA.loadTime}<span className="bim-metric-unit">min</span></div><div className="bim-metric-footer">8h标准班次</div></div>
      <div className="bim-metric-card bim-metric-card--success"><div className="bim-metric-label">稼动时间</div><div className="bim-metric-value">{OEE_DATA.operationTime}<span className="bim-metric-unit">min</span></div><div className="bim-metric-footer">稼动率 {OEE_DATA.timeRate}%</div></div>
    </div>
    <div className="bim-metric-grid">
      <div className="bim-metric-card bim-metric-card--error"><div className="bim-metric-label">非计划停机</div><div className="bim-metric-value">{OEE_DATA.downtime}<span className="bim-metric-unit">min</span></div><div className="bim-metric-footer">占比 {((OEE_DATA.downtime / OEE_DATA.loadTime) * 100).toFixed(1)}%</div></div>
      <div className="bim-metric-card bim-metric-card--warning"><div className="bim-metric-label">计划停机</div><div className="bim-metric-value">35<span className="bim-metric-unit">min</span></div><div className="bim-metric-footer">换型+保养</div></div>
    </div>
    <div className="bim-chart-section">
      <div className="bim-chart-title">运营趋势<span className="bim-chart-subtitle">近14天</span></div>
      <OpTrendChart />
    </div>
  </div>
);

const EnvironmentView = () => {
  const [envData, setEnvData] = useState(ENV_DATA);
  const [editKey, setEditKey] = useState<number | null>(null);
  const [form] = Form.useForm();

  const handleSave = (key: number) => {
    form.validateFields().then(v => {
      setEnvData(envData.map(d => d.key === key ? { ...d, ...v } : d));
      setEditKey(null);
    });
  };

  return (
    <div>
      <div className="bim-metric-grid">
        <div className="bim-metric-card bim-metric-card--error"><div className="bim-metric-label">平均温度</div><div className="bim-metric-value">25.4<span className="bim-metric-unit">℃</span></div><div className="bim-metric-footer">标准 20-28℃</div></div>
        <div className="bim-metric-card bim-metric-card--primary"><div className="bim-metric-label">平均湿度</div><div className="bim-metric-value">54.6<span className="bim-metric-unit">%</span></div><div className="bim-metric-footer">标准 40-65%</div></div>
      </div>
      <div className="bim-metric-grid">
        <div className="bim-metric-card bim-metric-card--success"><div className="bim-metric-label">今日能耗</div><div className="bim-metric-value">2,847<span className="bim-metric-unit">kWh</span></div><div className="bim-metric-footer"><span className="bim-metric-compare bim-metric-compare--down"><FallOutlined /> -3.2%</span></div></div>
        <div className="bim-metric-card bim-metric-card--warning"><div className="bim-metric-label">月累计</div><div className="bim-metric-value">38.5<span className="bim-metric-unit">MWh</span></div><div className="bim-metric-footer">预算 42</div></div>
      </div>
      <div className="bim-chart-section">
        <div className="bim-chart-title">温湿度趋势<span className="bim-chart-subtitle">今日</span></div>
        <TempHumChart />
      </div>
      <div className="bim-data-list">
        <div className="bim-data-list-header">
          <span className="bim-data-list-title">温湿度明细</span>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { const k = Date.now(); setEnvData([...envData, { key: k, checkTime: '--:--', position: '新增点', shift: '早班', temperature: 0, humidity: 0 }]); setEditKey(k); form.setFieldsValue({ temperature: 0, humidity: 0 }); }}>新增</Button>
        </div>
        <Form form={form} component={false}>
          {envData.map(d => (
            <div className="bim-env-record" key={d.key}>
              <div className="bim-env-record-left">
                <div className="bim-env-record-pos">{d.position}</div>
                <div className="bim-env-record-info">
                  <span>{d.checkTime}</span>
                  <Tag style={{ margin: 0, fontSize: 10 }}>{d.shift}</Tag>
                </div>
              </div>
              <div className="bim-env-record-right">
                {editKey === d.key ? (
                  <Space size={4}>
                    <Form.Item name="temperature" style={{ margin: 0 }}><InputNumber size="small" defaultValue={d.temperature} step={0.1} style={{ width: 60 }} /></Form.Item>
                    <Form.Item name="humidity" style={{ margin: 0 }}><InputNumber size="small" defaultValue={d.humidity} step={0.1} style={{ width: 60 }} /></Form.Item>
                    <Button type="link" size="small" onClick={() => handleSave(d.key)}>OK</Button>
                  </Space>
                ) : (
                  <>
                    <div className="bim-env-value-block"><div className="bim-env-value-num">{d.temperature}</div><div className="bim-env-value-label">℃</div></div>
                    <div className="bim-env-value-block"><div className="bim-env-value-num">{d.humidity}</div><div className="bim-env-value-label">%</div></div>
                    <Space size={0} direction="vertical">
                      <Button type="link" size="small" onClick={() => { setEditKey(d.key); form.setFieldsValue({ temperature: d.temperature, humidity: d.humidity }); }} style={{ fontSize: 11, padding: 0 }}>编辑</Button>
                      <Popconfirm title="删除?" onConfirm={() => setEnvData(envData.filter(x => x.key !== d.key))}><Button type="link" size="small" danger style={{ fontSize: 11, padding: 0 }}>删除</Button></Popconfirm>
                    </Space>
                  </>
                )}
              </div>
            </div>
          ))}
        </Form>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const TOP_TABS = [
  { key: 'home', label: '运营数据' },
  { key: 'oee', label: 'OEE明细' }, { key: 'ftt', label: 'FTT明细' }, { key: 'rate', label: '达产率明细' },
  { key: 'exception', label: '产线异常明细' }, { key: 'takt', label: '产线节拍明细' },
];

const BOTTOM_NAV = [
  { key: 'data', label: '产线数据', icon: <HomeOutlined /> },
  { key: 'device', label: '设备管理', icon: <ToolOutlined />, badge: 12 },
  { key: 'problem', label: '问题管理', icon: <WarningOutlined />, badge: 5 },
  { key: 'me', label: '我的', icon: <UserOutlined /> },
];

const TAB_CONTENT: Record<string, React.ReactNode> = {
  home: null, // 首页单独处理
  oee: <OEEView />, ftt: <FTTView />, rate: <RateView />,
  exception: <ExceptionView />, takt: <CycleTimeView />,
};

const Component: React.FC = () => {
  const [activeLine, setActiveLine] = useState('ed1');
  const [topTab, setTopTab] = useState('home');
  const [bottomNav, setBottomNav] = useState('data');
  const [lineSelectorVisible, setLineSelectorVisible] = useState(false);
  const [timeSelectorVisible, setTimeSelectorVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const lineLabel = PRODUCTION_LINES.find(l => l.value === activeLine)?.label || '电驱一线';
  const now = new Date();
  const dateTitle = selectedDate
    ? selectedDate.format('YYYY年M月D日')
    : `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const dateChip = selectedDate ? selectedDate.format('MM/DD') : '今日';

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#458EF8', borderRadius: 10, fontSize: 14 } }}>
      <div className="bi-mobile">
        <header className="bim-header">
          <div className="bim-header-left">
            <div className="bim-header-back"><ArrowLeftOutlined /></div>
            <div className="bim-header-logo"><DashboardOutlined /></div>
            <div className="bim-header-title-wrap">
              <div className="bim-header-title">产线数字管理平台</div>
              <div className="bim-header-subtitle">BI 数据管理平台</div>
            </div>
          </div>
          <div className="bim-header-right">
            <div className="bim-header-btn">
              <BellOutlined style={{ fontSize: 17 }} />
              <span className="bim-bell-dot" />
            </div>
            <div className="bim-header-btn"><MoreOutlined style={{ fontSize: 17 }} /></div>
          </div>
        </header>

        {bottomNav === 'data' && (
          <div className="bim-context-bar">
            <span className="bim-context-chip bim-context-chip--line" onClick={() => setLineSelectorVisible(true)}>
              <EnvironmentOutlined className="bim-context-chip-icon" />
              {lineLabel}
            </span>
            <span className="bim-context-chip bim-context-chip--date" onClick={() => setTimeSelectorVisible(true)}>
              <CalendarOutlined className="bim-context-chip-icon" />
              {dateChip}
            </span>
            <span className="bim-context-chip bim-context-chip--status">
              <CheckCircleOutlined className="bim-context-chip-icon" />
              运行中
            </span>
          </div>
        )}

        <div className={`bim-top-tabs${bottomNav === 'data' ? ' bim-top-tabs--offset' : ''}`}>
          {TOP_TABS.map(t => (
            <div key={t.key} className={`bim-top-tab-item ${topTab === t.key ? 'bim-top-tab-item--active' : ''}`} onClick={() => setTopTab(t.key)}>{t.label}</div>
          ))}
        </div>

        <main className="bim-content">
          {bottomNav === 'data' && topTab === 'home' ? (
            <HomeView
              onShowLineSelector={() => setLineSelectorVisible(true)}
              onShowTimeSelector={() => setTimeSelectorVisible(true)}
              lineLabel={lineLabel}
              dateTitle={dateTitle}
            />
          ) : bottomNav === 'data' ? (
            TAB_CONTENT[topTab]
          ) : (
            <div className="bim-empty">
              <div className="bim-empty-icon"><ToolOutlined /></div>
              <div className="bim-empty-title">功能开发中</div>
              <Text type="secondary">该模块正在建设中，敬请期待</Text>
            </div>
          )}
        </main>

        <nav className="bim-bottom-nav">
          {BOTTOM_NAV.map(item => (
            <div key={item.key} className={`bim-bottom-item ${bottomNav === item.key ? 'bim-bottom-item--active' : ''}`} onClick={() => setBottomNav(item.key)}>
              <div className="bim-bottom-item-icon-wrap">
                <div className="bim-bottom-item-icon">{item.icon}</div>
              </div>
              <div className="bim-bottom-item-label">{item.label}</div>
              {item.badge && <span className="bim-bottom-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <Modal title="选择产地" open={lineSelectorVisible} onCancel={() => setLineSelectorVisible(false)} footer={null}>
          <div className="bim-line-selector">
            {PRODUCTION_LINES.map(line => (
              <div key={line.value} className={`bim-line-option ${activeLine === line.value ? 'bim-line-option--active' : ''}`} onClick={() => { setActiveLine(line.value); setLineSelectorVisible(false); }}>
                {line.label}
                {activeLine === line.value && <CheckOutlined className="bim-line-option-check" />}
              </div>
            ))}
          </div>
        </Modal>

        {/* 选择时间弹窗 */}
        <Modal title="选择时间" open={timeSelectorVisible} onCancel={() => setTimeSelectorVisible(false)} footer={null}>
          <div className="bim-time-selector">
            <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ width: '100%' }} placeholder="选择日期" />
            <Button block type="primary" style={{ marginTop: 16 }} onClick={() => setTimeSelectorVisible(false)}>确定</Button>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Component;
