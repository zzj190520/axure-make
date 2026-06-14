/**
 * @name BI数据管理平台
 *
 * 产线日常数据可视化平台，覆盖OEE、FTT、达产率、产线节拍、异常管理、运营数据及环境能耗等核心维度。
 *
 * 参考资料：
 * - /rules/development-standards.md
 * - /rules/design-guide.md
 * - /src/themes/antd-new/designToken.json
 * - /skills/third-party/interface-design/SKILL.md
 */

import './style.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import {
  ConfigProvider, Select, Tabs, Card, Row, Col, Table, Tag, Space, Button,
  InputNumber, Form, Popconfirm, Typography, Tooltip, Badge, message,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, DashboardOutlined, ThunderboltOutlined,
  ClockCircleOutlined, WarningOutlined, EnvironmentOutlined, FieldTimeOutlined,
  CheckCircleOutlined, RiseOutlined, FallOutlined, ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;

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

const OEE_DATA = {
  actual: 86, target: 90,
  loadTime: 480, operationTime: 412.8, downtime: 67.2,
  timeRate: 86, performanceRate: 95.2, productionRate: 93.5,
  trendActual: genData(84, 8), trendTarget: Array(30).fill(90),
  eolActual: genData(87, 6), eolTarget: Array(30).fill(90),
};

const FTT_DATA = {
  actual: 99.38, target: 99.5,
  trendActual: genData(99.3, 0.6), trendTarget: Array(30).fill(99.5),
};

const PRODUCTION_RATE_DATA = {
  actual: 93.5, target: 95,
  trend: genData(92, 8),
  details: DATE_LABELS.slice(-14).map((d, i) => ({
    key: i, date: d, plan: Math.round(450 + Math.random() * 50),
    actual: Math.round(420 + Math.random() * 60), rate: +(88 + Math.random() * 10).toFixed(1),
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
  { key: 1, time: '2026-06-13 08:23', line: '电驱一线', type: '设备故障', desc: 'OP30攻丝机主轴异常振动', duration: 45, status: '已解决', handler: '张工' },
  { key: 2, time: '2026-06-13 09:15', line: '电驱三线', type: '物料短缺', desc: '轴承物料B-2047库存不足', duration: 30, status: '处理中', handler: '李工' },
  { key: 3, time: '2026-06-12 14:30', line: '电控产线', type: '品质异常', desc: 'PCB板焊接不良率超标(2.3%)', duration: 60, status: '已解决', handler: '王工' },
  { key: 4, time: '2026-06-12 16:45', line: '电驱二线', type: '设备故障', desc: 'OP50磨削机冷却液温度过高', duration: 25, status: '已解决', handler: '赵工' },
  { key: 5, time: '2026-06-11 10:00', line: '油泵产线', type: '换型停机', desc: '型号切换 OP-A32 → OP-B18', duration: 90, status: '已解决', handler: '孙工' },
  { key: 6, time: '2026-06-11 13:20', line: '压缩机产线', type: '设备故障', desc: 'OP70装配工位气动夹具漏气', duration: 35, status: '待处理', handler: '周工' },
  { key: 7, time: '2026-06-10 08:50', line: '定转子产线', type: '品质异常', desc: '转子动平衡测试不合格(批次)', duration: 120, status: '已解决', handler: '吴工' },
  { key: 8, time: '2026-06-10 15:10', line: '电驱四线', type: '计划停机', desc: '设备定期保养维护', duration: 180, status: '已解决', handler: '郑工' },
];

const ENV_INIT_DATA = [
  { key: 1, checkTime: '2026-06-13 06:00', position: '车间A区', shift: '早班', temperature: 23.5, humidity: 55.2 },
  { key: 2, checkTime: '2026-06-13 06:00', position: '车间B区', shift: '早班', temperature: 24.1, humidity: 53.8 },
  { key: 3, checkTime: '2026-06-13 06:00', position: '仓储区', shift: '早班', temperature: 22.8, humidity: 58.1 },
  { key: 4, checkTime: '2026-06-13 14:00', position: '车间A区', shift: '中班', temperature: 26.3, humidity: 52.4 },
  { key: 5, checkTime: '2026-06-13 14:00', position: '车间B区', shift: '中班', temperature: 27.0, humidity: 50.6 },
  { key: 6, checkTime: '2026-06-13 14:00', position: '仓储区', shift: '中班', temperature: 24.5, humidity: 56.3 },
  { key: 7, checkTime: '2026-06-13 22:00', position: '车间A区', shift: '晚班', temperature: 22.1, humidity: 60.5 },
  { key: 8, checkTime: '2026-06-13 22:00', position: '车间B区', shift: '晚班', temperature: 22.8, humidity: 59.2 },
  { key: 9, checkTime: '2026-06-13 22:00', position: '仓储区', shift: '晚班', temperature: 21.5, humidity: 62.0 },
];

// ==================== Chart Components ====================

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

const OEETrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#f0f0f0', textStyle: { color: '#333', fontSize: 12 } },
    legend: { data: ['实际OEE(EOL站)', '实际OEE(下线站)', '目标OEE'], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#999', fontSize: 11, interval: 4 } },
    yAxis: { type: 'value', min: 70, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 11, formatter: '{value}%' } },
    series: [
      { name: '实际OEE(EOL站)', type: 'line', data: OEE_DATA.eolActual, smooth: true, symbol: 'none', lineStyle: { width: 2.5, color: '#1677ff' }, itemStyle: { color: '#1677ff' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,119,255,0.15)' }, { offset: 1, color: 'rgba(22,119,255,0.02)' }] } } },
      { name: '实际OEE(下线站)', type: 'line', data: OEE_DATA.trendActual, smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#52c41a' }, itemStyle: { color: '#52c41a' } },
      { name: '目标OEE', type: 'line', data: OEE_DATA.trendTarget, symbol: 'none', lineStyle: { width: 1.5, color: '#ff4d4f', type: 'dashed' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 340, width: '100%' }} />;
};

const FTTTrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#f0f0f0', textStyle: { color: '#333', fontSize: 12 } },
    legend: { data: ['实际FTT', '目标FTT'], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#999', fontSize: 11, interval: 4 } },
    yAxis: { type: 'value', min: 98, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 11, formatter: '{value}%' } },
    series: [
      { name: '实际FTT', type: 'line', data: FTT_DATA.trendActual, smooth: true, symbol: 'none', lineStyle: { width: 2.5, color: '#722ed1' }, itemStyle: { color: '#722ed1' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(114,46,209,0.12)' }, { offset: 1, color: 'rgba(114,46,209,0.01)' }] } } },
      { name: '目标FTT', type: 'line', data: FTT_DATA.trendTarget, symbol: 'none', lineStyle: { width: 1.5, color: '#ff4d4f', type: 'dashed' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 340, width: '100%' }} />;
};

const ProductionRateChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#f0f0f0', textStyle: { color: '#333', fontSize: 12 } },
    legend: { data: ['达产率'], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#999', fontSize: 11, interval: 4 } },
    yAxis: { type: 'value', min: 75, max: 110, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 11, formatter: '{value}%' } },
    series: [
      { name: '达产率', type: 'bar', data: PRODUCTION_RATE_DATA.trend, barWidth: '50%', itemStyle: { color: (p: any) => p.value >= 95 ? '#52c41a' : p.value >= 85 ? '#faad14' : '#ff4d4f', borderRadius: [3, 3, 0, 0] } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 340, width: '100%' }} />;
};

const TempHumidityChart = () => {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#f0f0f0', textStyle: { color: '#333', fontSize: 12 } },
    legend: { data: ['温度(℃)', '湿度(%)'], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#999', fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '温度(℃)', min: 18, max: 32, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 11 } },
      { type: 'value', name: '湿度(%)', min: 40, max: 70, axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#999', fontSize: 11 } },
    ],
    series: [
      { name: '温度(℃)', type: 'line', data: [23.5, 24.2, 25.8, 26.5, 27.1, 26.3, 24.8, 23.2, 22.1], smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2.5, color: '#fa541c' }, itemStyle: { color: '#fa541c' } },
      { name: '湿度(%)', type: 'line', yAxisIndex: 1, data: [55.2, 53.8, 51.5, 49.8, 50.6, 52.1, 54.3, 57.8, 60.5], smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2.5, color: '#13c2c2' }, itemStyle: { color: '#13c2c2' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 320, width: '100%' }} />;
};

const OperationTrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#f0f0f0', textStyle: { color: '#333', fontSize: 12 } },
    legend: { data: ['负荷时间', '稼动时间', '非计划停机'], top: 4, textStyle: { fontSize: 12 } },
    grid: { top: 40, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: DATE_LABELS.slice(-14), axisLine: { lineStyle: { color: '#e8e8e8' } }, axisLabel: { color: '#999', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 11, formatter: '{value} min' } },
    series: [
      { name: '负荷时间', type: 'bar', stack: 'time', data: genData(480, 20, 14), barWidth: '40%', itemStyle: { color: '#1677ff', borderRadius: [0, 0, 0, 0] } },
      { name: '稼动时间', type: 'bar', stack: 'time', data: genData(400, 30, 14), itemStyle: { color: '#52c41a' } },
      { name: '非计划停机', type: 'line', data: genData(55, 40, 14), smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2, color: '#ff4d4f' }, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 340, width: '100%' }} />;
};

// ==================== Tab: OEE 明细 ====================

const OEETab = () => (
  <div>
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12} md={6}>
        <div className="bi-metric-card bi-metric-card--warning">
          <div className="bi-metric-label">实际OEE(MES)</div>
          <div className="bi-metric-value bi-metric-value--large" style={{ color: OEE_DATA.actual >= OEE_DATA.target ? '#52c41a' : '#faad14' }}>{OEE_DATA.actual}<span className="bi-metric-unit">%</span></div>
          <div className="bi-metric-footer"><span>目标 {OEE_DATA.target}%</span><span className="bi-metric-compare bi-metric-compare--down"><FallOutlined /> -{OEE_DATA.target - OEE_DATA.actual}%</span></div>
        </div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div className="bi-metric-card bi-metric-card--primary">
          <div className="bi-metric-label">时间稼动率</div>
          <div className="bi-metric-value">{OEE_DATA.timeRate}<span className="bi-metric-unit">%</span></div>
          <div className="bi-metric-footer"><span>稼动 {OEE_DATA.operationTime}min / 负荷 {OEE_DATA.loadTime}min</span></div>
        </div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div className="bi-metric-card bi-metric-card--success">
          <div className="bi-metric-label">性能稼动率</div>
          <div className="bi-metric-value">{OEE_DATA.performanceRate}<span className="bi-metric-unit">%</span></div>
          <div className="bi-metric-footer"><span className="bi-metric-compare bi-metric-compare--up"><RiseOutlined /> +1.2%</span><span>较昨日</span></div>
        </div>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <div className="bi-metric-card bi-metric-card--info">
          <div className="bi-metric-label">达产率</div>
          <div className="bi-metric-value">{OEE_DATA.productionRate}<span className="bi-metric-unit">%</span></div>
          <div className="bi-metric-footer"><span>目标 95%</span><span className="bi-metric-compare bi-metric-compare--down"><FallOutlined /> -1.5%</span></div>
        </div>
      </Col>
    </Row>
    <div className="bi-chart-card">
      <div className="bi-chart-title">OEE 走势图<span className="bi-chart-subtitle">按 EOL站 / 下线站统计，近30天</span></div>
      <OEETrendChart />
    </div>
    <Row gutter={16} style={{ marginTop: 16 }}>
      <Col span={8}><div className="bi-metric-card bi-metric-card--primary"><div className="bi-metric-label">负荷时间</div><div className="bi-metric-value">{OEE_DATA.loadTime}<span className="bi-metric-unit">min</span></div></div></Col>
      <Col span={8}><div className="bi-metric-card bi-metric-card--success"><div className="bi-metric-label">稼动时间</div><div className="bi-metric-value">{OEE_DATA.operationTime}<span className="bi-metric-unit">min</span></div></div></Col>
      <Col span={8}><div className="bi-metric-card bi-metric-card--error"><div className="bi-metric-label">非计划停机时间</div><div className="bi-metric-value">{OEE_DATA.downtime}<span className="bi-metric-unit">min</span></div></div></Col>
    </Row>
  </div>
);

// ==================== Tab: FTT 明细 ====================

const FTTTab = () => (
  <div>
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12} md={8}>
        <div className="bi-metric-card bi-metric-card--info">
          <div className="bi-metric-label">实际FTT(下线)</div>
          <div className="bi-metric-value bi-metric-value--large">{FTT_DATA.actual}<span className="bi-metric-unit">%</span></div>
          <div className="bi-metric-footer"><span>目标 {FTT_DATA.target}%</span><span className="bi-metric-compare bi-metric-compare--down"><FallOutlined /> -{(FTT_DATA.target - FTT_DATA.actual).toFixed(2)}%</span></div>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <div className="bi-metric-card bi-metric-card--success">
          <div className="bi-metric-label">今日合格数</div>
          <div className="bi-metric-value">1,238<span className="bi-metric-unit">件</span></div>
          <div className="bi-metric-footer"><span>总检测 1,246 件</span></div>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <div className="bi-metric-card bi-metric-card--error">
          <div className="bi-metric-label">不良品数</div>
          <div className="bi-metric-value">8<span className="bi-metric-unit">件</span></div>
          <div className="bi-metric-footer"><span>主要不良：焊接虚焊 3件、尺寸超差 2件</span></div>
        </div>
      </Col>
    </Row>
    <div className="bi-chart-card">
      <div className="bi-chart-title">FTT 趋势图<span className="bi-chart-subtitle">实际FTT vs 目标FTT，近30天</span></div>
      <FTTTrendChart />
    </div>
  </div>
);

// ==================== Tab: 达产率明细 ====================

const ProductionRateTab = () => {
  const columns: ColumnsType<typeof PRODUCTION_RATE_DATA.details[0]> = [
    { title: '日期', dataIndex: 'date', width: 100 },
    { title: '计划产量', dataIndex: 'plan', width: 100, sorter: (a, b) => a.plan - b.plan },
    { title: '实际产量', dataIndex: 'actual', width: 100, sorter: (a, b) => a.actual - b.actual },
    { title: '达产率', dataIndex: 'rate', width: 100, sorter: (a, b) => a.rate - b.rate,
      render: (v: number) => <Tag color={v >= 95 ? 'success' : v >= 85 ? 'warning' : 'error'}>{v}%</Tag> },
    { title: '差异', width: 100, render: (_, r) => <Text type={r.actual >= r.plan ? 'success' : 'danger'}>{r.actual - r.plan > 0 ? '+' : ''}{r.actual - r.plan}</Text> },
  ];
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="bi-metric-card bi-metric-card--primary"><div className="bi-metric-label">当前达产率</div><div className="bi-metric-value bi-metric-value--large">{PRODUCTION_RATE_DATA.actual}<span className="bi-metric-unit">%</span></div><div className="bi-metric-footer"><span>目标 {PRODUCTION_RATE_DATA.target}%</span></div></div>
        </Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--success"><div className="bi-metric-label">今日实际产量</div><div className="bi-metric-value">462<span className="bi-metric-unit">台</span></div><div className="bi-metric-footer"><span>计划 480 台</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--warning"><div className="bi-metric-label">月累计产量</div><div className="bi-metric-value">5,847<span className="bi-metric-unit">台</span></div><div className="bi-metric-footer"><span>月计划 6,200 台</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--info"><div className="bi-metric-label">月达产率</div><div className="bi-metric-value">94.3<span className="bi-metric-unit">%</span></div><div className="bi-metric-footer"><span className="bi-metric-compare bi-metric-compare--up"><RiseOutlined /> +0.8%</span><span>较上月</span></div></div></Col>
      </Row>
      <div className="bi-chart-card" style={{ marginBottom: 20 }}>
        <div className="bi-chart-title">达产率趋势<span className="bi-chart-subtitle">近30天柱状图</span></div>
        <ProductionRateChart />
      </div>
      <div className="bi-chart-card">
        <div className="bi-chart-title">达产率明细</div>
        <div className="bi-table-wrap"><Table columns={columns} dataSource={PRODUCTION_RATE_DATA.details} pagination={false} size="middle" /></div>
      </div>
    </div>
  );
};

// ==================== Tab: 产线节拍明细 ====================

const CycleTimeTab = () => {
  const avgTakt = (CYCLE_TIME_DATA.reduce((s, d) => s + d.actual, 0) / CYCLE_TIME_DATA.length).toFixed(1);
  const anomalyCount = CYCLE_TIME_DATA.filter(d => Math.abs(d.actual - d.standard) > 3).length;
  const columns: ColumnsType<typeof CYCLE_TIME_DATA[0]> = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '工位号', dataIndex: 'station', width: 80, render: (v: string) => <Text strong style={{ fontFamily: "'SF Mono', Monaco, monospace" }}>{v}</Text> },
    { title: '工位名称', dataIndex: 'name', width: 120 },
    { title: '过站总产品数', dataIndex: 'count', width: 120, render: (v: number) => v.toLocaleString() },
    { title: '标准节拍(s)', dataIndex: 'standard', width: 100, sorter: (a, b) => a.standard - b.standard },
    { title: '实际节拍(s)', dataIndex: 'actual', width: 100, sorter: (a, b) => a.actual - b.actual,
      render: (v: number, r) => <Text type={Math.abs(v - r.standard) > 3 ? 'danger' : undefined} strong>{v}</Text> },
    { title: '平衡率(%)', dataIndex: 'balance', width: 100, sorter: (a, b) => a.balance - b.balance,
      render: (v: number) => <Tag color={v >= 95 && v <= 105 ? 'success' : v >= 85 ? 'warning' : 'error'}>{v.toFixed(1)}%</Tag> },
    { title: '标识', width: 100, render: (_, r) => r.bottleneck ? <span className="bi-bottleneck-tag"><WarningOutlined /> 瓶颈工序</span> : Math.abs(r.actual - r.standard) > 3 ? <span className="bi-anomaly-tag"><WarningOutlined /> 异常</span> : <Tag color="success">正常</Tag> },
  ];
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <div className="bi-metric-card bi-metric-card--primary">
            <div className="bi-metric-label">产线平衡率</div>
            <div className="bi-metric-value bi-metric-value--large">86<span className="bi-metric-unit">%</span></div>
            <div className="bi-metric-footer"><span>良好区间: 70%-80%</span></div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--success"><div className="bi-metric-label">平均实际节拍</div><div className="bi-metric-value">{avgTakt}<span className="bi-metric-unit">s</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--error"><div className="bi-metric-label">节拍异常产品数</div><div className="bi-metric-value">{anomalyCount}<span className="bi-metric-unit">个工位</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--warning"><div className="bi-metric-label">瓶颈工序</div><div className="bi-metric-value">OP30<span className="bi-metric-unit">攻丝</span></div><div className="bi-metric-footer"><span>实际 41s / 标准 35s</span></div></div></Col>
      </Row>
      <div className="bi-balance-indicator">
        <div className="bi-balance-label">产线平衡率</div>
        <div className="bi-balance-bar"><div className="bi-balance-bar-fill" style={{ width: '86%', background: 'linear-gradient(90deg, #1677ff 0%, #52c41a 100%)' }} /></div>
        <div className="bi-balance-value">86%</div>
      </div>
      <div className="bi-chart-card">
        <div className="bi-chart-title">工位节拍平衡分析表</div>
        <div className="bi-table-wrap"><Table columns={columns} dataSource={CYCLE_TIME_DATA} pagination={false} size="middle" rowClassName={(r) => r.bottleneck ? 'ant-table-row-selected' : ''} /></div>
      </div>
    </div>
  );
};

// ==================== Tab: 产线异常明细 ====================

const ExceptionTab = () => {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const filtered = typeFilter ? EXCEPTION_DATA.filter(d => d.type === typeFilter) : EXCEPTION_DATA;
  const statusColor: Record<string, string> = { '已解决': 'success', '处理中': 'processing', '待处理': 'warning' };
  const typeColor: Record<string, string> = { '设备故障': 'error', '物料短缺': 'warning', '品质异常': 'magenta', '换型停机': 'blue', '计划停机': 'default' };
  const columns: ColumnsType<typeof EXCEPTION_DATA[0]> = [
    { title: '异常时间', dataIndex: 'time', width: 150, sorter: (a, b) => a.time.localeCompare(b.time) },
    { title: '产线', dataIndex: 'line', width: 100 },
    { title: '类型', dataIndex: 'type', width: 100, filters: [...new Set(EXCEPTION_DATA.map(d => d.type))].map(t => ({ text: t, value: t })), onFilter: (v, r) => r.type === v,
      render: (v: string) => <Tag color={typeColor[v] || 'default'}>{v}</Tag> },
    { title: '异常描述', dataIndex: 'desc', ellipsis: true },
    { title: '停机(min)', dataIndex: 'duration', width: 90, sorter: (a, b) => a.duration - b.duration },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Badge status={statusColor[v] as any} text={v} /> },
    { title: '处理人', dataIndex: 'handler', width: 80 },
  ];
  return (
    <div>
      <div className="bi-filter-panel">
        <Text type="secondary">快速筛选:</Text>
        {['设备故障', '物料短缺', '品质异常', '换型停机', '计划停机'].map(t => (
          <Tag key={t} color={typeFilter === t ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => setTypeFilter(typeFilter === t ? undefined : t)}>{t}</Tag>
        ))}
        {typeFilter && <Button type="link" size="small" onClick={() => setTypeFilter(undefined)}>清除</Button>}
      </div>
      <div className="bi-table-wrap"><Table columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} size="middle" /></div>
    </div>
  );
};

// ==================== Tab: 运营数据 ====================

const OperationsTab = () => (
  <div>
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--primary"><div className="bi-metric-label">负荷时间</div><div className="bi-metric-value bi-metric-value--large">{OEE_DATA.loadTime}<span className="bi-metric-unit">min</span></div><div className="bi-metric-footer"><span>8h 标准班次</span></div></div></Col>
      <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--success"><div className="bi-metric-label">稼动时间</div><div className="bi-metric-value bi-metric-value--large">{OEE_DATA.operationTime}<span className="bi-metric-unit">min</span></div><div className="bi-metric-footer"><span>稼动率 {OEE_DATA.timeRate}%</span></div></div></Col>
      <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--error"><div className="bi-metric-label">非计划停机时间</div><div className="bi-metric-value bi-metric-value--large">{OEE_DATA.downtime}<span className="bi-metric-unit">min</span></div><div className="bi-metric-footer"><span>占比 {((OEE_DATA.downtime / OEE_DATA.loadTime) * 100).toFixed(1)}%</span></div></div></Col>
      <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--warning"><div className="bi-metric-label">计划停机时间</div><div className="bi-metric-value">35<span className="bi-metric-unit">min</span></div><div className="bi-metric-footer"><span>换型+保养</span></div></div></Col>
    </Row>
    <div className="bi-chart-card">
      <div className="bi-chart-title">运营数据趋势<span className="bi-chart-subtitle">近14天负荷/稼动/停机时间</span></div>
      <OperationTrendChart />
    </div>
  </div>
);

// ==================== Tab: 环境能耗数据 ====================

const EnvironmentTab = () => {
  const [envData, setEnvData] = useState(ENV_INIT_DATA);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [nextKey, setNextKey] = useState(10);

  const handleSave = (key: number) => {
    form.validateFields().then(values => {
      const newData = [...envData];
      const idx = newData.findIndex(d => d.key === key);
      if (idx > -1) { newData[idx] = { ...newData[idx], ...values }; setEnvData(newData); }
      setEditingKey(null);
    });
  };
  const handleAdd = () => {
    const newKey = nextKey;
    setNextKey(newKey + 1);
    setEnvData([...envData, { key: newKey, checkTime: '', position: '', shift: '早班', temperature: 0, humidity: 0 }]);
    setEditingKey(newKey);
    form.setFieldsValue({ checkTime: '', position: '', shift: '早班', temperature: 0, humidity: 0 });
  };
  const handleDelete = (key: number) => { setEnvData(envData.filter(d => d.key !== key)); };
  const handleEdit = (record: typeof ENV_INIT_DATA[0]) => { setEditingKey(record.key); form.setFieldsValue(record); };

  const columns: ColumnsType<typeof envData[0]> = [
    { title: '点检时间', dataIndex: 'checkTime', width: 160, render: (v, r) => editingKey === r.key ? <Form.Item name="checkTime" style={{ margin: 0 }}><input className="ant-input" defaultValue={v} /></Form.Item> : v },
    { title: '点检位置', dataIndex: 'position', width: 120, render: (v, r) => editingKey === r.key ? <Form.Item name="position" style={{ margin: 0 }}><input className="ant-input" defaultValue={v} /></Form.Item> : v },
    { title: '班次', dataIndex: 'shift', width: 80, render: (v, r) => editingKey === r.key ? <Form.Item name="shift" style={{ margin: 0 }}><Select defaultValue={v} options={[{ value: '早班' }, { value: '中班' }, { value: '晚班' }]} /></Form.Item> : <Tag>{v}</Tag> },
    { title: '温度(℃)', dataIndex: 'temperature', width: 100, render: (v, r) => editingKey === r.key ? <Form.Item name="temperature" style={{ margin: 0 }}><InputNumber defaultValue={v} step={0.1} /></Form.Item> : v },
    { title: '湿度(%)', dataIndex: 'humidity', width: 100, render: (v, r) => editingKey === r.key ? <Form.Item name="humidity" style={{ margin: 0 }}><InputNumber defaultValue={v} step={0.1} /></Form.Item> : v },
    { title: '操作', width: 120, render: (_, r) => editingKey === r.key ? <Space><Button type="link" size="small" onClick={() => handleSave(r.key)}>保存</Button><Button type="link" size="small" onClick={() => setEditingKey(null)}>取消</Button></Space> : <Space><Button type="link" size="small" onClick={() => handleEdit(r)}>编辑</Button><Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.key)}><Button type="link" size="small" danger>删除</Button></Popconfirm></Space> },
  ];
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--error"><div className="bi-metric-label">当前平均温度</div><div className="bi-metric-value">25.4<span className="bi-metric-unit">℃</span></div><div className="bi-metric-footer"><span>标准: 20-28℃</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--primary"><div className="bi-metric-label">当前平均湿度</div><div className="bi-metric-value">54.6<span className="bi-metric-unit">%</span></div><div className="bi-metric-footer"><span>标准: 40-65%</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--success"><div className="bi-metric-label">今日能耗</div><div className="bi-metric-value">2,847<span className="bi-metric-unit">kWh</span></div><div className="bi-metric-footer"><span className="bi-metric-compare bi-metric-compare--down"><FallOutlined /> -3.2%</span><span>较昨日</span></div></div></Col>
        <Col xs={24} sm={12} md={6}><div className="bi-metric-card bi-metric-card--warning"><div className="bi-metric-label">月累计能耗</div><div className="bi-metric-value">38.5<span className="bi-metric-unit">MWh</span></div><div className="bi-metric-footer"><span>预算: 42 MWh</span></div></div></Col>
      </Row>
      <div className="bi-chart-card" style={{ marginBottom: 20 }}>
        <div className="bi-chart-title">温湿度趋势<span className="bi-chart-subtitle">今日车间A区</span></div>
        <TempHumidityChart />
      </div>
      <div className="bi-chart-card">
        <div className="bi-chart-title" style={{ justifyContent: 'space-between' }}>温湿度明细 <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>新增记录</Button></div>
        <Form form={form} component={false}>
          <div className="bi-table-wrap bi-editable-table"><Table columns={columns} dataSource={envData} pagination={false} size="middle" /></div>
        </Form>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const TAB_ITEMS = [
  { key: 'oee', label: 'OEE明细', icon: <DashboardOutlined /> },
  { key: 'ftt', label: 'FTT明细', icon: <CheckCircleOutlined /> },
  { key: 'rate', label: '达产率明细', icon: <RiseOutlined /> },
  { key: 'takt', label: '产线节拍明细', icon: <FieldTimeOutlined /> },
  { key: 'exception', label: '产线异常明细', icon: <WarningOutlined /> },
  { key: 'ops', label: '运营数据', icon: <ThunderboltOutlined /> },
  { key: 'env', label: '环境能耗数据', icon: <EnvironmentOutlined /> },
];

const TAB_CONTENT: Record<string, React.ReactNode> = {
  oee: <OEETab />, ftt: <FTTTab />, rate: <ProductionRateTab />,
  takt: <CycleTimeTab />, exception: <ExceptionTab />, ops: <OperationsTab />, env: <EnvironmentTab />,
};

const Component: React.FC = () => {
  const [activeLine, setActiveLine] = useState('ed1');
  const [activeTab, setActiveTab] = useState('oee');

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6, fontSize: 14 } }}>
      <div className="bi-platform">
        <header className="bi-header">
          <div className="bi-header-brand">
            <div className="bi-header-logo">BI</div>
            <span className="bi-header-title">BI数据管理平台</span>
          </div>
          <Select value={activeLine} onChange={setActiveLine} style={{ width: 160 }} options={PRODUCTION_LINES} placeholder="选择产线" />
          <div className="bi-header-actions">
            <div className="bi-header-stats">
              <Tooltip title="设备管理 / 问题管理 / 我的">
                <span className="bi-stat-badge bi-stat-badge--pending"><ClockCircleOutlined /> 待办 12</span>
              </Tooltip>
              <span className="bi-stat-badge bi-stat-badge--done"><CheckCircleOutlined /> 已办 25</span>
              <span className="bi-stat-badge bi-stat-badge--all"><ToolOutlined /> 全部 100</span>
            </div>
          </div>
        </header>
        <main className="bi-main">
          <div className="bi-tabs-wrap">
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={TAB_ITEMS.map(t => ({ key: t.key, label: <span>{t.icon} {t.label}</span> }))} />
          </div>
          <div className="bi-content-panel">{TAB_CONTENT[activeTab]}</div>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default Component;
