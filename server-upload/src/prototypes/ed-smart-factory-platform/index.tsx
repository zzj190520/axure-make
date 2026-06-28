/**
 * @name 产线数字管理平台
 *
 * 新能源汽车电驱行业智能制造工厂一体化管控平台，
 * 覆盖数字孪生驾驶舱、APS/MES/QMS/WMS/SCADA/EMS 八大业务系统及数据中台。
 *
 * 参考资料：
 * - /rules/development-standards.md
 * - /rules/design-guide.md
 * - /src/themes/antd-new/designToken.json
 * - /skills/third-party/interface-design/SKILL.md
 */

import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  ConfigProvider, Input, Button, Tag, Table, Select, Space,
  Badge, Tabs, Card, Typography, Progress, Tooltip, Drawer, Timeline, Row, Col, DatePicker,
} from 'antd';
import {
  DashboardOutlined, ScheduleOutlined, BuildOutlined, SafetyCertificateOutlined,
  InboxOutlined, MonitorOutlined, ThunderboltOutlined, DatabaseOutlined,
  SearchOutlined, BellOutlined, UserOutlined, FullscreenOutlined,
  RiseOutlined, FallOutlined, RobotOutlined, WarningOutlined,
  CheckCircleOutlined, ScanOutlined, ToolOutlined, BulbOutlined, ApiOutlined,
  EnvironmentOutlined, CloudOutlined, LineChartOutlined, FundOutlined,
  SyncOutlined, ClockCircleOutlined, CarOutlined, ExperimentOutlined,
  NodeIndexOutlined, FileTextOutlined, ApartmentOutlined, DeploymentUnitOutlined,
} from '@ant-design/icons';

// 导入可配置数据
import * as defaultData from './data';

// ==================== 外部数据注入机制 ====================
// 在 Axure 页面中通过 <script> 标签定义全局变量:
// <script>
//   window.__ED_FACTORY_DATA__ = {
//     opsData: [...],  // 自定义数据
//     deviceList: [...]
//   };
// </script>
declare global {
  interface Window {
    __ED_FACTORY_DATA__?: Record<string, any>;
  }
}

// 数据加载函数:优先使用外部注入数据,否则使用默认数据
function getData<K extends keyof typeof defaultData>(key: K): typeof defaultData[K] {
  if (typeof window !== 'undefined' && window.__ED_FACTORY_DATA__ && window.__ED_FACTORY_DATA__[key]) {
    console.log(`[数据注入] 使用外部数据: ${key}`);
    return window.__ED_FACTORY_DATA__[key] as typeof defaultData[K];
  }
  return defaultData[key];
}

// 导出所有数据(支持外部覆盖)
const ZONE_DETAILS = getData('ZONE_DETAILS');
const ZONES = getData('ZONES');
const EQUIPMENTS = getData('EQUIPMENTS');
const MAINT_ORDERS = getData('MAINT_ORDERS');
const ALERT_TRACKING = getData('ALERT_TRACKING');
const COCKPIT_ALERTS = getData('COCKPIT_ALERTS');
const WORK_ORDERS = getData('WORK_ORDERS');
const STATUS_LABEL = getData('STATUS_LABEL');
const LINE_STATIONS = getData('LINE_STATIONS');
const lineOptions = getData('lineOptions');
const lineKpis = getData('lineKpis');
const keyStationIds = getData('keyStationIds');
const deviceList = getData('deviceList');
const statusColors = getData('statusColors');
const faultDetailData = getData('faultDetailData');
const alarmDetailData = getData('alarmDetailData');
const treeNodes = getData('treeNodes');
const envData = getData('envData');
const envAlerts = getData('envAlerts');
const topEnergyDevices = getData('topEnergyDevices');
const savingSuggestions = getData('savingSuggestions');
const scadaKpis = getData('scadaKpis');
const statusLegend = getData('statusLegend');
const maintTimeline = getData('maintTimeline');
const aiPredictions = getData('aiPredictions');
const oeeChartData = getData('oeeChartData');
const energyChartData = getData('energyChartData');
const qualityTrendData = getData('qualityTrendData');
const defectPieData = getData('defectPieData');
const energyTrendData = getData('energyTrendData');
const downtimePieData = getData('downtimePieData');
const dataFlowData = getData('dataFlowData');
const oeeWaterfallData = getData('oeeWaterfallData');
const emsKpis = getData('emsKpis');
const opsColumns = getData('opsColumns');
const opsData = getData('opsData');
const oeeColumns = getData('oeeColumns');
const oeeData = getData('oeeData');
const fttColumns = getData('fttColumns');
const fttData = getData('fttData');
const yieldColumns = getData('yieldColumns');
const yieldData = getData('yieldData');
const taktColumns = getData('taktColumns');
const taktData = getData('taktData');
const energyColumns = getData('energyColumns');
const energyData = getData('energyData');
const abnormalOverviewColumns = getData('abnormalOverviewColumns');
const abnormalOverviewData = getData('abnormalOverviewData');
const abnormalListColumns = getData('abnormalListColumns');
const abnormalListData = getData('abnormalListData');
const faultStatColumns = getData('faultStatColumns');
const faultStatData = getData('faultStatData');
const mttrMtbfColumns = getData('mttrMtbfColumns');
const mttrMtbfData = getData('mttrMtbfData');
const faultCategoryColumns = getData('faultCategoryColumns');
const faultCategoryData = getData('faultCategoryData');
const topFaultColumns = getData('topFaultColumns');
const topFaultData = getData('topFaultData');
const faultCollectColumns = getData('faultCollectColumns');
const faultCollectData = getData('faultCollectData');
const processMaintColumns = getData('processMaintColumns');
const processMaintData = getData('processMaintData');

const { Text } = Typography;

// ==================== Types ====================

export type NavKey = 'cockpit' | 'line-twin' | 'scada' | 'ems' | 'data' | 'line-daily' | 'line-overview' | 'mes-status';

export type EquipStatus = 'run' | 'idle' | 'fault' | 'maint' | 'stop';

export interface LineStation {
  key: string;
  id: string;
  name: string;
  zone: string;
  cycleTime: number; // 节拍(秒)
  shiftOutput: number; // 当班产出
  ftt: number; // 一次合格率
  wip: number; // 在制品数量
  downtimeMin: number; // 停机时间(min)
  downtimeCount: number; // 停机次数
  downtimeRatio: number; // 停机时间占比(%)
  equipment: string[]; // 关联设备
}

export interface Equipment {
  key: string;
  name: string;
  zone: string;
  status: EquipStatus;
  oee: number;
  param: string;
  model?: string;
  runtime?: string;
  nextMaint?: string;
  faultCode?: string;
  aiRisk?: number;
}

export interface ZoneDetail {
  id: string;
  name: string;
  devices: number;
  output: number;
  wip: number;
  ftt: number;
  status: 'run' | 'warn' | 'fault';
  env: { temp: number; humidity: number };
  equipList: string[];
}

export interface WorkOrder {
  key: string;
  id: string;
  model: string;
  qty: number;
  progress: number;
  line: string;
  delivery: string;
  status: string;
}

// ==================== Mock Data (已从 data.ts 导入) ====================

// ==================== Chart Hook ====================

const useChart = (getOption: () => echarts.EChartsOption, deps: unknown[] = []) => {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!inst.current) inst.current = echarts.init(ref.current);
    inst.current.setOption(getOption(), true);
    const ro = new ResizeObserver(() => inst.current?.resize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); inst.current?.dispose(); inst.current = null; };
  }, deps);
  return ref;
};

const OEEChart = ({ dark = false }: { dark?: boolean }) => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['时间稼动率', '性能达成率', '良品率', 'OEE'], top: 0, textStyle: { color: dark ? '#94a3b8' : '#64748b', fontSize: 11 } },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { color: dark ? '#64748b' : '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value', min: 60, max: 100, axisLabel: { color: dark ? '#64748b' : '#94a3b8', formatter: '{value}%', fontSize: 11 }, splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' } } },
    series: [
      { name: '时间稼动率', type: 'line', data: [92, 88, 90, 85, 91, 87, 89], smooth: true, itemStyle: { color: '#0ea5e9' } },
      { name: '性能达成率', type: 'line', data: [95, 93, 94, 92, 96, 93, 95], smooth: true, itemStyle: { color: '#10b981' } },
      { name: '良品率', type: 'line', data: [98, 97, 99, 96, 98, 97, 98], smooth: true, itemStyle: { color: '#8b5cf6' } },
      { name: 'OEE', type: 'line', data: [86, 80, 84, 75, 86, 79, 83], smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#f59e0b' } },
    ],
  }), [dark]);
  return <div ref={ref} style={{ height: 260, width: '100%' }} />;
};

const EnergyChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['老化柜', '测试台', '压装机', '绕线机', '其他'], top: 0 },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['00', '04', '08', '12', '16', '20'] },
    yAxis: { type: 'value', name: 'kWh' },
    series: [
      { name: '老化柜', type: 'bar', stack: 'e', data: [120, 80, 200, 280, 260, 180], itemStyle: { color: '#ef4444' } },
      { name: '测试台', type: 'bar', stack: 'e', data: [60, 40, 100, 140, 130, 90], itemStyle: { color: '#f59e0b' } },
      { name: '压装机', type: 'bar', stack: 'e', data: [40, 30, 80, 100, 90, 60], itemStyle: { color: '#0ea5e9' } },
      { name: '绕线机', type: 'bar', stack: 'e', data: [50, 35, 90, 110, 100, 70], itemStyle: { color: '#10b981' } },
      { name: '其他', type: 'bar', stack: 'e', data: [30, 25, 50, 60, 55, 40], itemStyle: { color: '#94a3b8' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 280, width: '100%' }} />;
};

const QualityTrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['FTT', '高压测试合格率', '气密性合格率'], top: 0 },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['6/7', '6/8', '6/9', '6/10', '6/11', '6/12', '6/13'] },
    yAxis: { type: 'value', min: 95, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'FTT', type: 'line', data: [99.2, 99.0, 99.4, 98.8, 99.1, 99.3, 99.2], smooth: true, itemStyle: { color: '#10b981' } },
      { name: '高压测试合格率', type: 'line', data: [99.8, 99.6, 99.9, 99.5, 99.7, 99.8, 99.6], smooth: true, itemStyle: { color: '#0ea5e9' } },
      { name: '气密性合格率', type: 'line', data: [98.5, 98.2, 98.8, 97.9, 98.4, 98.6, 98.3], smooth: true, itemStyle: { color: '#8b5cf6' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 260, width: '100%' }} />;
};

const DefectPieChart = ({ dark = false }: { dark?: boolean }) => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: dark ? '#94a3b8' : '#64748b', fontSize: 10 } },
    series: [{
      type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'],
      data: [
        { value: 35, name: '高压绝缘', itemStyle: { color: '#ef4444' } },
        { value: 28, name: '气密泄漏', itemStyle: { color: '#f59e0b' } },
        { value: 18, name: '压装偏差', itemStyle: { color: '#0ea5e9' } },
        { value: 12, name: '绕线瑕疵', itemStyle: { color: '#8b5cf6' } },
        { value: 7, name: '其他', itemStyle: { color: '#94a3b8' } },
      ],
      label: { color: dark ? '#cbd5e1' : '#64748b', fontSize: 10 },
    }],
  }), [dark]);
  return <div ref={ref} style={{ height: 220, width: '100%' }} />;
};

const EnergyTrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总能耗', '单台能耗', '目标'], top: 0 },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: [{ type: 'value', name: 'kWh' }, { type: 'value', name: 'kWh/台', min: 15, max: 22 }],
    series: [
      { name: '总能耗', type: 'bar', data: [820, 780, 850, 790, 810, 760], itemStyle: { color: '#0ea5e9' } },
      { name: '单台能耗', type: 'line', yAxisIndex: 1, data: [20.2, 19.8, 19.5, 19.2, 18.9, 18.6], smooth: true, itemStyle: { color: '#10b981' } },
      { name: '目标', type: 'line', yAxisIndex: 1, data: [19, 19, 19, 19, 19, 19], lineStyle: { type: 'dashed' }, itemStyle: { color: '#f59e0b' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 280, width: '100%' }} />;
};

const DowntimeChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: '65%',
      data: [
        { value: 42, name: '故障停机', itemStyle: { color: '#ef4444' } },
        { value: 28, name: '换型停机', itemStyle: { color: '#f59e0b' } },
        { value: 18, name: '待料停机', itemStyle: { color: '#0ea5e9' } },
        { value: 12, name: '维保停机', itemStyle: { color: '#8b5cf6' } },
      ],
      label: { fontSize: 11 },
    }],
  }), []);
  return <div ref={ref} style={{ height: 240, width: '100%' }} />;
};

const DataFlowChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['00', '04', '08', '12', '16', '20', '24'] },
    yAxis: { type: 'value', name: '条/分钟' },
    series: [{
      name: '数据吞吐', type: 'line', areaStyle: { color: 'rgba(14,165,233,0.15)' },
      data: [1200, 800, 2800, 3200, 2900, 2400, 1500], smooth: true, itemStyle: { color: '#0ea5e9' },
    }],
  }), []);
  return <div ref={ref} style={{ height: 200, width: '100%' }} />;
};

const OEEWaterfall = () => (
  <div className="edf-oee-waterfall">
    {[
      { l: '时间稼动率', v: 89, c: '#0ea5e9' },
      { l: '性能达成率', v: 95, c: '#10b981' },
      { l: '良品率', v: 98, c: '#8b5cf6' },
      { l: 'OEE', v: 83, c: '#f59e0b' },
    ].map(b => (
      <div key={b.l} className="edf-oee-bar">
        <div className="edf-oee-bar-pct" style={{ color: b.c }}>{b.v}%</div>
        <div className="edf-oee-bar-fill" style={{ height: `${b.v}%`, background: b.c }} />
        <div className="edf-oee-bar-label">{b.l}</div>
      </div>
    ))}
  </div>
);

// ==================== Views ====================

const CockpitView = () => {
  const [tab, setTab] = useState('workshop');
  const [selectedZone, setSelectedZone] = useState<string>('stator');
  const [lineMix, setLineMix] = useState('all');

  const zone = ZONE_DETAILS.find(z => z.id === selectedZone) || ZONE_DETAILS[0];

  const kpis = tab === 'workshop'
    ? [
      { label: '实时产能', value: '126', unit: '台/h', cls: '' },
      { label: '在制总量', value: '386', unit: '台', cls: '' },
      { label: '设备运行', value: '42/48', unit: '', cls: '' },
      { label: 'FTT', value: '99.2%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
      { label: '安灯异常', value: '3', unit: '起', cls: 'edf-cockpit-kpi-value--warn' },
      { label: 'OEE', value: '83.5%', unit: '', cls: '' },
      { label: '今日用电', value: '28.5', unit: 'MWh', cls: '' },
      { label: '预警待闭环', value: '4', unit: '条', cls: 'edf-cockpit-kpi-value--warn' },
    ]
    : tab === 'manager'
      ? [
        { label: '计划达成率', value: '94.2%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
        { label: '交付准时率', value: '91.8%', unit: '', cls: '' },
        { label: '物料齐套率', value: '96.5%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
        { label: '工序不良率', value: '0.8%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
        { label: '非计划停机', value: '2.3', unit: 'h', cls: 'edf-cockpit-kpi-value--bad' },
        { label: '换型耗时', value: '45', unit: 'min', cls: '' },
        { label: '老化瓶颈WIP', value: '86', unit: '台', cls: 'edf-cockpit-kpi-value--warn' },
        { label: '返修率', value: '1.2%', unit: '', cls: '' },
      ]
      : [
        { label: '月产能', value: '12,800', unit: '台', cls: '' },
        { label: '单位制造成本', value: '¥3,280', unit: '', cls: 'edf-cockpit-kpi-value--good' },
        { label: '单位能耗', value: '18.6', unit: 'kWh/台', cls: '' },
        { label: '质量成本率', value: '1.2%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
        { label: '产能负荷', value: '87%', unit: '', cls: 'edf-cockpit-kpi-value--warn' },
        { label: '碳排放强度', value: '8.2', unit: 'kg/台', cls: '' },
        { label: 'AI预警', value: '6', unit: '条', cls: '' },
        { label: '投资回报率', value: '18.5%', unit: '', cls: 'edf-cockpit-kpi-value--good' },
      ];

  return (
    <div className="edf-content--cockpit">
      <div className="edf-cockpit-header">
        <div className="edf-cockpit-title">
          <DashboardOutlined style={{ marginRight: 8, color: '#38bdf8' }} />
          电驱工厂数字孪生驾驶舱
          <Tag color="cyan" style={{ marginLeft: 12, fontSize: 10 }}>1:1 三维镜像 · 毫秒级刷新</Tag>
        </div>
        <div className="edf-cockpit-tabs">
          {[{ k: 'workshop', l: '车间现场看板' }, { k: 'manager', l: '中层管理看板' }, { k: 'executive', l: '高层决策看板' }].map(t => (
            <div key={t.k} className={`edf-cockpit-tab${tab === t.k ? ' edf-cockpit-tab--active' : ''}`} onClick={() => setTab(t.k)}>{t.l}</div>
          ))}
        </div>
        <Space>
          <Text style={{ color: '#64748b', fontSize: 11 }}>2026-06-13 15:42:08</Text>
          <Tag color="processing">实时</Tag>
          <Button type="text" icon={<FullscreenOutlined />} style={{ color: '#94a3b8' }} />
        </Space>
      </div>

      <div className="edf-cockpit-body">
        {COCKPIT_ALERTS.slice(0, 2).map((a, i) => (
          <div key={i} className={`edf-alert-bar edf-alert-bar--${a.level}`}>
            <WarningOutlined />{a.text}
          </div>
        ))}

        <div className="edf-cockpit-kpi" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {kpis.map(k => (
            <div key={k.label} className="edf-cockpit-kpi-item">
              <div className="edf-cockpit-kpi-label">{k.label}</div>
              <div className={`edf-cockpit-kpi-value ${k.cls}`}>{k.value}<span style={{ fontSize: 11, marginLeft: 2 }}>{k.unit}</span></div>
            </div>
          ))}
        </div>

        {/* 混线产线切换 */}
        <div className="edf-line-mix">
          {[
            { k: 'all', l: '全厂', v: '126/h' },
            { k: 'motor', l: '电机产线', v: '52/h' },
            { k: 'ecu', l: '电控产线', v: '38/h' },
            { k: 'assembly', l: '三合一总成', v: '36/h' },
          ].map(l => (
            <div key={l.k} className={`edf-line-chip${lineMix === l.k ? ' edf-line-chip--active' : ''}`} onClick={() => setLineMix(l.k)}>
              <div className="edf-line-chip-label">{l.l}</div>
              <div className="edf-line-chip-value">{l.v}</div>
            </div>
          ))}
        </div>

        {/* 数字孪生车间平面图 + 区域穿透面板 */}
        <div className="edf-twin-layout">
          <div className="edf-twin-floor">
            <div className="edf-twin-floor-title"><ApartmentOutlined /> 电驱车间 1:1 功能区域孪生地图 · 点击穿透查询</div>
            <div className="edf-twin-floor-grid">
              {ZONE_DETAILS.map(z => (
                <div
                  key={z.id}
                  className={`edf-twin-zone edf-twin-zone--${z.status}${selectedZone === z.id ? ' edf-twin-zone--selected' : ''}`}
                  onClick={() => setSelectedZone(z.id)}
                >
                  <div className="edf-twin-zone-name">{z.name}</div>
                  <div className="edf-twin-zone-output">{z.output}</div>
                  <div className="edf-twin-zone-meta">设备{z.devices} · WIP {z.wip} · FTT {z.ftt}%</div>
                </div>
              ))}
            </div>
            <div className="edf-twin-agv" style={{ left: '45%', top: '60%' }} title="AGV-03 配送中" />
            <div className="edf-twin-agv" style={{ left: '72%', top: '35%', animationDelay: '1s' }} title="AGV-07" />
          </div>

          <div className="edf-twin-sidepanel">
            <div className="edf-twin-panel-title">{zone.name} · 实时穿透</div>
            <div className="edf-twin-metric-row"><span>当班产量</span><span className="edf-twin-metric-val">{zone.output} 台</span></div>
            <div className="edf-twin-metric-row"><span>在制品滞留</span><span className="edf-twin-metric-val" style={{ color: zone.wip > 60 ? '#fbbf24' : '#fff' }}>{zone.wip} 台</span></div>
            <div className="edf-twin-metric-row"><span>一次合格率</span><span className="edf-twin-metric-val">{zone.ftt}%</span></div>
            <div className="edf-twin-metric-row"><span>环境温度</span><span className="edf-twin-metric-val">{zone.env.temp}°C</span></div>
            <div className="edf-twin-metric-row"><span>环境湿度</span><span className="edf-twin-metric-val" style={{ color: zone.env.humidity > 60 ? '#fbbf24' : '#fff' }}>{zone.env.humidity}%</span></div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>关联设备</div>
            {zone.equipList.map(e => (
              <Tag key={e} color="blue" style={{ fontSize: 10, marginBottom: 4 }}>{e}</Tag>
            ))}
            <Button type="primary" size="small" block style={{ marginTop: 12 }} icon={<NodeIndexOutlined />}>一键溯源</Button>
          </div>
        </div>

        {/* 质量 + 环境 + 能耗 */}
        <div className="edf-cockpit-row-3">
          <div className="edf-chart-card edf-chart-card--dark">
            <div className="edf-chart-title edf-chart-title--light">电驱质量缺陷维度拆解</div>
            <DefectPieChart dark />
          </div>
          <div className="edf-chart-card edf-chart-card--dark">
            <div className="edf-chart-title edf-chart-title--light"><EnvironmentOutlined /> 生产环境监控</div>
            <div className="edf-env-grid">
              {[
                { l: '温度', v: '24.2°C', w: false }, { l: '湿度', v: '62%', w: true },
                { l: '洁净度', v: 'Class 8', w: false }, { l: '防静电', v: '1.2MΩ', w: false },
              ].map(e => (
                <div key={e.l} className="edf-env-item">
                  <div className="edf-env-label">{e.l}</div>
                  <div className={`edf-env-value${e.w ? ' edf-env-value--warn' : ''}`}>{e.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              精密工序要求：温度 20-26°C · 湿度 ≤65% · 超标将触发预警
            </div>
          </div>
          <div className="edf-chart-card edf-chart-card--dark">
            <div className="edf-chart-title edf-chart-title--light"><ThunderboltOutlined /> 能耗实时</div>
            <div className="edf-env-grid">
              {[
                { l: '当前功率', v: '1,280kW' }, { l: '今日用电', v: '28.5MWh' },
                { l: '单台能耗', v: '18.6kWh' }, { l: '老化柜占比', v: '38%' },
              ].map(e => (
                <div key={e.l} className="edf-env-item">
                  <div className="edf-env-label">{e.l}</div>
                  <div className="edf-env-value">{e.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 预警闭环追踪 */}
        <div className="edf-chart-title edf-chart-title--light" style={{ marginBottom: 10 }}>分级预警闭环追踪</div>
        <div className="edf-alert-track">
          <div className="edf-alert-track-item" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
            <span>等级</span><span>预警内容</span><span>责任人</span><span>时限</span>
          </div>
          {ALERT_TRACKING.map((a, i) => (
            <div key={i} className="edf-alert-track-item">
              <Tag color={a.level === 'urgent' ? 'red' : a.level === 'important' ? 'orange' : 'blue'} style={{ fontSize: 10 }}>{a.level === 'urgent' ? '紧急' : a.level === 'important' ? '重要' : '一般'}</Tag>
              <span>{a.title} · {a.zone}</span>
              <span>{a.owner}</span>
              <Tag color={a.status === '处理中' ? 'processing' : 'default'} style={{ fontSize: 10 }}>{a.deadline}</Tag>
            </div>
          ))}
        </div>

        <div className="edf-two-col" style={{ marginTop: 20 }}>
          <div className="edf-chart-card edf-chart-card--dark">
            <div className="edf-chart-title edf-chart-title--light">OEE 趋势 · 目标85%</div>
            <OEEChart dark />
          </div>
          <div className="edf-chart-card edf-chart-card--dark">
            <div className="edf-chart-title edf-chart-title--light">核心设备实时状态 (SCADA)</div>
            {EQUIPMENTS.filter(e => e.status === 'fault' || e.status === 'maint').concat(EQUIPMENTS.filter(e => e.status === 'run').slice(0, 4)).map(e => (
              <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.status === 'run' ? '#22c55e' : e.status === 'fault' ? '#ef4444' : '#f59e0b' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{e.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{e.param}</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>OEE {e.oee}%</span>
                <Tag color={e.status === 'run' ? 'success' : e.status === 'fault' ? 'error' : 'warning'} style={{ fontSize: 10 }}>{STATUS_LABEL[e.status]}</Tag>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 数字孪生产线视图 ====================

const LineTwinView = () => {
  const [selectedStation, setSelectedStation] = useState<LineStation | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'key'>('all'); // 全部工位/重点工位
  const [timeMode, setTimeMode] = useState<'shift' | 'day'>('shift'); // 班维度/日维度
  const [shiftType, setShiftType] = useState<'day' | 'night'>('day'); // 白班/夜班
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-13');
  const [lineName, setLineName] = useState<string>('三合一电驱产线'); // 产线名称

  // lineOptions, lineKpis, keyStationIds 已从 data.ts 导入

  // 根据视图模式过滤工位
  const displayStations = viewMode === 'all' 
    ? LINE_STATIONS 
    : LINE_STATIONS.filter(s => keyStationIds.includes(s.id));

  return (
    <div className="edf-content--cockpit">
      <div className="edf-cockpit-header">
        <div className="edf-cockpit-title">
          <DeploymentUnitOutlined style={{ marginRight: 8, color: '#38bdf8' }} />
          三合一电驱产线 · 数字孪生映射
          <Tag color="cyan" style={{ marginLeft: 12, fontSize: 10 }}>8 工位 · 全量数据</Tag>
        </div>
        <Button type="text" icon={<FullscreenOutlined />} style={{ color: '#94a3b8' }} />
      </div>

      {/* 时间维度控制 */}
      <div className="edf-line-time-bar">
        <div className="edf-line-select-wrapper">
          <Select
            value={lineName}
            onChange={(val) => setLineName(val)}
            options={lineOptions}
            size="small"
            className="edf-line-select"
            popupClassName="edf-line-select-dropdown"
            suffixIcon={<span style={{ color: '#0ea5e9', fontSize: 10 }}>▼</span>}
          />
        </div>
        <div className="edf-line-time-toggle">
          <div className={`edf-line-time-pill${timeMode === 'shift' ? ' edf-line-time-pill--active' : ''}`} onClick={() => setTimeMode('shift')}>班维度</div>
          <div className={`edf-line-time-pill${timeMode === 'day' ? ' edf-line-time-pill--active' : ''}`} onClick={() => setTimeMode('day')}>日维度</div>
        </div>
        {timeMode === 'shift' && (
          <div className="edf-line-shift-toggle">
            <div className={`edf-line-shift-pill${shiftType === 'day' ? ' edf-line-shift-pill--active' : ''}`} onClick={() => setShiftType('day')}>白班</div>
            <div className={`edf-line-shift-pill${shiftType === 'night' ? ' edf-line-shift-pill--active' : ''}`} onClick={() => setShiftType('night')}>夜班</div>
          </div>
        )}
        <div className="edf-line-date-picker">
          <DatePicker
            size="small"
            value={dayjs(selectedDate)}
            onChange={(date) => {
              if (date) {
                setSelectedDate(date.format('YYYY-MM-DD'));
              }
            }}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      <div className="edf-cockpit-body">
        <div className="edf-cockpit-kpi" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {lineKpis.map(k => (
            <div key={k.label} className="edf-cockpit-kpi-item">
              <div className="edf-cockpit-kpi-label">{k.label}</div>
              <div className={`edf-cockpit-kpi-value ${k.cls}`}>{k.value}<span style={{ fontSize: 11, marginLeft: 2 }}>{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="edf-line-twin-map">
          <div className="edf-line-twin-header">
            <div className="edf-line-twin-title"><DeploymentUnitOutlined /> 三合一电驱产线 · 3D 映射拓扑</div>
            <div className="edf-line-view-toggle">
              <div className={`edf-line-pill${viewMode === 'all' ? ' edf-line-pill--active' : ''}`} onClick={() => setViewMode('all')}>全部工位</div>
              <div className={`edf-line-pill${viewMode === 'key' ? ' edf-line-pill--active' : ''}`} onClick={() => setViewMode('key')}>重点工位</div>
            </div>
          </div>
          <div className="edf-line-stations">
            {displayStations.map((station, idx) => {
              return (
                <div key={station.key}>
                  <div
                    className={`edf-line-station${selectedStation?.key === station.key ? ' edf-line-station--selected' : ''}`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <div className="edf-line-station-header">
                      <div className="edf-line-station-id">{station.id}</div>
                    </div>
                    <div className="edf-line-station-name">{station.name}</div>
                    <div className="edf-line-station-metrics">
                      <div className="edf-line-station-metric">
                        <div className="edf-line-station-metric-label">实际节拍</div>
                        <div className="edf-line-station-metric-value">{station.cycleTime > 0 ? `${station.cycleTime}s` : '-'}</div>
                      </div>
                      <div className="edf-line-station-metric">
                        <div className="edf-line-station-metric-label">产出</div>
                        <div className="edf-line-station-metric-value">{station.shiftOutput}</div>
                      </div>
                      <div className="edf-line-station-metric">
                        <div className="edf-line-station-metric-label">FTT</div>
                        <div className="edf-line-station-metric-value" style={{ color: station.ftt >= 99 ? '#22c55e' : station.ftt >= 98 ? '#f59e0b' : '#ef4444' }}>
                          {station.ftt > 0 ? `${station.ftt}%` : '-'}
                        </div>
                      </div>
                      <div className="edf-line-station-metric">
                        <div className="edf-line-station-metric-label">OEE</div>
                        <div className="edf-line-station-metric-value" style={{ color: station.ftt >= 85 ? '#22c55e' : station.ftt >= 75 ? '#f59e0b' : '#ef4444' }}>
                          {station.ftt > 0 ? `${Math.round(station.ftt * 0.88)}%` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {idx < displayStations.length - 1 && (
                    <div className="edf-line-connector">
                      <div className="edf-line-connector-line" />
                      <div className="edf-line-connector-arrow">→</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedStation && (
          <div className="edf-line-station-detail">
            <div className="edf-line-detail-header">
              <div className="edf-line-detail-title">
                <DeploymentUnitOutlined style={{ marginRight: 8 }} />
                {selectedStation.name} · 实时数据
              </div>
              <Button type="text" onClick={() => setSelectedStation(null)} style={{ color: '#94a3b8' }}>关闭</Button>
            </div>

            <div className="edf-line-detail-grid">
              <div className="edf-line-detail-card">
                <div className="edf-line-detail-card-title">核心指标</div>
                <div className="edf-line-detail-metrics">
                  <div className="edf-line-detail-metric">
                    <div className="edf-line-detail-metric-label">实际节拍</div>
                    <div className="edf-line-detail-metric-value" style={{ fontSize: 28, color: selectedStation.cycleTime > 0 ? '#38bdf8' : '#94a3b8' }}>
                      {selectedStation.cycleTime > 0 ? `${selectedStation.cycleTime}s` : '停机'}
                    </div>
                    {selectedStation.cycleTime > 0 && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>目标 300s · 达成率 {(300/selectedStation.cycleTime*100).toFixed(1)}%</div>
                    )}
                  </div>
                  <div className="edf-line-detail-metric">
                    <div className="edf-line-detail-metric-label">当班产出</div>
                    <div className="edf-line-detail-metric-value" style={{ fontSize: 28, color: '#22c55e' }}>{selectedStation.shiftOutput}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>目标 96 台 · 达成率 {(selectedStation.shiftOutput/96*100).toFixed(1)}%</div>
                  </div>
                  <div className="edf-line-detail-metric">
                    <div className="edf-line-detail-metric-label">FTT（下线）</div>
                    <div className="edf-line-detail-metric-value" style={{ fontSize: 28, color: selectedStation.ftt >= 99 ? '#22c55e' : selectedStation.ftt >= 98 ? '#f59e0b' : '#ef4444' }}>
                      {selectedStation.ftt > 0 ? `${selectedStation.ftt}%` : '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>目标 99% · {selectedStation.ftt >= 99 ? '达标' : '未达标'}</div>
                  </div>
                  <div className="edf-line-detail-metric">
                    <div className="edf-line-detail-metric-label">OEE（下线）</div>
                    <div className="edf-line-detail-metric-value" style={{ fontSize: 28, color: selectedStation.ftt >= 85 ? '#22c55e' : selectedStation.ftt >= 75 ? '#f59e0b' : '#ef4444' }}>
                      {selectedStation.ftt > 0 ? `${Math.round(selectedStation.ftt * 0.88)}%` : '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>目标 85% · {selectedStation.ftt * 0.88 >= 85 ? '达标' : '未达标'}</div>
                  </div>
                </div>
              </div>

              <div className="edf-line-detail-card">
                <div className="edf-line-detail-card-title">设备运行参数</div>
                <div className="edf-line-detail-params">
                  <div className="edf-line-detail-param">
                    <div className="edf-line-detail-param-label">停机时间</div>
                    <div className="edf-line-detail-param-value">
                      <span style={{ fontSize: 18, fontWeight: 600, color: selectedStation.downtimeMin > 0 ? '#ef4444' : '#22c55e' }}>
                        {selectedStation.downtimeMin}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>min</span>
                    </div>
                  </div>
                  <div className="edf-line-detail-param">
                    <div className="edf-line-detail-param-label">停机次数</div>
                    <div className="edf-line-detail-param-value">
                      <span style={{ fontSize: 18, fontWeight: 600, color: selectedStation.downtimeCount > 0 ? '#f59e0b' : '#22c55e' }}>
                        {selectedStation.downtimeCount}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>次</span>
                    </div>
                  </div>
                  <div className="edf-line-detail-param">
                    <div className="edf-line-detail-param-label">停机时间占比</div>
                    <div className="edf-line-detail-param-value">
                      <span style={{ fontSize: 18, fontWeight: 600, color: selectedStation.downtimeRatio > 10 ? '#ef4444' : selectedStation.downtimeRatio > 5 ? '#f59e0b' : '#22c55e' }}>
                        {selectedStation.downtimeRatio}%
                      </span>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 6 }}>
                        <div style={{ width: `${Math.min(selectedStation.downtimeRatio, 100)}%`, height: '100%', background: selectedStation.downtimeRatio > 10 ? '#ef4444' : selectedStation.downtimeRatio > 5 ? '#f59e0b' : '#22c55e', borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedStation.downtimeMin > 30 && (
              <div className="edf-line-detail-alert">
                <WarningOutlined style={{ marginRight: 8, fontSize: 18 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>异常详情</div>
                  <div style={{ fontSize: 13 }}>该工位停机时间超过30分钟，请及时处理</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>已通知相关责任人，正在处理中</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const APSView = () => (
  <div>
    <div className="edf-page-title"><ScheduleOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />APS 智能排产</div>
    <div className="edf-page-desc">多约束有限产能排程 · AI 遗传优化算法 · 动态插单与瓶颈预判 <span className="edf-ai-tag"><RobotOutlined /> AI赋能</span></div>
    <div className="edf-kpi-grid">
      <div className="edf-kpi-card"><div className="edf-kpi-label">待排订单</div><div className="edf-kpi-value">12</div></div>
      <div className="edf-kpi-card edf-kpi-card--smart"><div className="edf-kpi-label">计划达成率</div><div className="edf-kpi-value" style={{ color: '#10b981' }}>94.2%</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">瓶颈工序</div><div className="edf-kpi-value" style={{ fontSize: 18 }}>高温老化</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">换型次数(今日)</div><div className="edf-kpi-value">5</div></div>
    </div>
    <Card title="生产工单排程" extra={<Space><Button>插单模拟</Button><Button type="primary" className="edf-ai-btn">AI 优化排程</Button></Space>}>
      <Table
        dataSource={WORK_ORDERS}
        columns={[
          { title: '工单号', dataIndex: 'id', width: 160 },
          { title: '产品型号', dataIndex: 'model' },
          { title: '数量', dataIndex: 'qty', width: 70 },
          { title: '产线', dataIndex: 'line', width: 100 },
          { title: '进度', dataIndex: 'progress', width: 140, render: (v: number) => <Progress percent={v} size="small" /> },
          { title: '交期', dataIndex: 'delivery', width: 110 },
          { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={s === '已完工' ? 'success' : s === '试制' ? 'purple' : 'processing'}>{s}</Tag> },
        ]}
        pagination={false}
      />
    </Card>
    <div className="edf-two-col" style={{ marginTop: 20 }}>
      <Card title="未来7天产能负荷预测" extra={<span className="edf-ai-tag"><RobotOutlined /> AI预判</span>}>
        <div style={{ padding: '20px 0' }}>
          {['定子绕线', '精密装配', '高压测试', '高温老化', '整机标定'].map((p, i) => (
            <div key={p} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>{p}</span><span style={{ color: [72, 85, 68, 95, 60][i] > 90 ? '#ef4444' : '#64748b' }}>{[72, 85, 68, 95, 60][i]}%</span>
              </div>
              <Progress percent={[72, 85, 68, 95, 60][i]} strokeColor={[72, 85, 68, 95, 60][i] > 90 ? '#ef4444' : '#0ea5e9'} showInfo={false} size="small" />
            </div>
          ))}
        </div>
      </Card>
      <Card title="排程约束条件">
        <Space direction="vertical" style={{ width: '100%' }}>
          {['设备产能约束', '工艺先后顺序', '物料齐套校验', '人员持证排班', '交期优先级', '换型最小化'].map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />{c}
            </div>
          ))}
        </Space>
      </Card>
    </div>
  </div>
);

const MESView = () => (
  <div>
    <div className="edf-page-title"><BuildOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />MES 生产执行</div>
    <div className="edf-page-desc">工序全适配管控 · 智能防错 · 在制品追踪 · ANDON 异常呼叫</div>
    <div className="edf-kpi-grid--6 edf-kpi-grid" style={{ marginBottom: 20 }}>
      {[
        { l: '在制总量', v: '386' }, { l: '今日产出', v: '1,247' }, { l: '工序一次合格率', v: '99.1%' },
        { l: '防错拦截', v: '8' }, { l: '安灯异常', v: '3' }, { l: '有效工时率', v: '87.5%' },
      ].map(k => (
        <div key={k.l} className="edf-kpi-card"><div className="edf-kpi-label">{k.l}</div><div className="edf-kpi-value" style={{ fontSize: 22 }}>{k.v}</div></div>
      ))}
    </div>
    <Card title="ANDON 智能异常呼叫" style={{ marginBottom: 20 }}>
      <div className="edf-andon-grid">
        {[
          { t: '设备故障', c: 'edf-andon-btn--fault', icon: <ToolOutlined /> },
          { t: '物料短缺', c: 'edf-andon-btn--material', icon: <InboxOutlined /> },
          { t: '质量缺陷', c: 'edf-andon-btn--quality', icon: <SafetyCertificateOutlined /> },
          { t: '工艺异常', c: 'edf-andon-btn--process', icon: <ApiOutlined /> },
        ].map(a => (
          <div key={a.t} className={`edf-andon-btn ${a.c}`}>{a.icon}<div style={{ marginTop: 8 }}>{a.t}</div></div>
        ))}
      </div>
    </Card>
    <div className="edf-two-col">
      <Card title="工序流转看板">
        <Table size="small" pagination={false} dataSource={[
          { key: '1', step: '定子绕线', wip: 45, rate: 99.5, status: '正常' },
          { key: '2', step: '转子压铸', wip: 38, rate: 99.2, status: '正常' },
          { key: '3', step: '精密装配', wip: 62, rate: 98.8, status: '积压' },
          { key: '4', step: '高压测试', wip: 28, rate: 99.8, status: '正常' },
          { key: '5', step: '高温老化', wip: 86, rate: 99.0, status: '瓶颈' },
          { key: '6', step: '整机标定', wip: 22, rate: 99.6, status: '正常' },
        ]} columns={[
          { title: '工序', dataIndex: 'step' },
          { title: '在制', dataIndex: 'wip', width: 60 },
          { title: '合格率', dataIndex: 'rate', width: 80, render: (v: number) => `${v}%` },
          { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '瓶颈' ? 'red' : s === '积压' ? 'orange' : 'green'}>{s}</Tag> },
        ]} />
      </Card>
      <Card title="智能防错记录(今日)">
        <Table size="small" pagination={false} dataSource={[
          { key: '1', type: '物料防错', desc: '工位OP30 错料拦截-轴承型号不匹配', time: '09:23' },
          { key: '2', type: '参数防错', desc: '压装机#03 压力超阈值自动锁机', time: '10:45' },
          { key: '3', type: '工序防错', desc: '跳工序拦截-未完工高压测试', time: '11:12' },
          { key: '4', type: '人员防错', desc: '无证人员操作高压测试被拒绝', time: '14:30' },
        ]} columns={[
          { title: '类型', dataIndex: 'type', width: 90 },
          { title: '描述', dataIndex: 'desc' },
          { title: '时间', dataIndex: 'time', width: 60 },
        ]} />
      </Card>
    </div>
  </div>
);

const QMSView = () => (
  <div>
    <div className="edf-page-title"><SafetyCertificateOutlined style={{ color: '#10b981', marginRight: 8 }} />QMS 质量管理</div>
    <div className="edf-page-desc">IATF16949 合规 · 四级质检 · SPC 管控 · 一机一码全生命周期溯源 <span className="edf-ai-tag"><RobotOutlined /> AI缺陷分析</span></div>
    <div className="edf-kpi-grid">
      <div className="edf-kpi-card edf-kpi-card--smart"><div className="edf-kpi-label">FTT 直通率</div><div className="edf-kpi-value" style={{ color: '#10b981' }}>99.2%</div><div className="edf-kpi-footer"><RiseOutlined style={{ color: '#10b981' }} /> 目标 99%</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">IQC 来料合格率</div><div className="edf-kpi-value">98.6%</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">高压测试合格率</div><div className="edf-kpi-value">99.6%</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">今日不良品</div><div className="edf-kpi-value" style={{ color: '#ef4444' }}>10</div></div>
    </div>
    <div className="edf-chart-card"><div className="edf-chart-title">质量趋势</div><QualityTrendChart /></div>
    <div className="edf-two-col">
      <Card title="产品溯源查询" extra={<ScanOutlined />}>
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input placeholder="输入产品唯一码 / 扫码查询" prefix={<SearchOutlined />} defaultValue="ED-2026-0613-00847" />
          <Button type="primary">溯源</Button>
        </Space.Compact>
        <div style={{ fontSize: 13, lineHeight: 2, color: '#64748b' }}>
          <div><Text strong>产品码：</Text>ED-2026-0613-00847</div>
          <div><Text strong>型号：</Text>三合一电驱总成 ED-300</div>
          <div><Text strong>定子批次：</Text>ST-B2026-0610 · 绕线机#01 · 张工</div>
          <div><Text strong>压装参数：</Text>28.5kN / 12.3mm · 合格</div>
          <div><Text strong>高压测试：</Text>2500V / 绝缘 520MΩ · 合格</div>
          <div><Text strong>老化测试：</Text>85°C × 4h · 合格</div>
          <div><Text strong>EOL标定：</Text>功率 150kW · 扭矩 320Nm · 合格</div>
        </div>
      </Card>
      <Card title="SPC 过程能力 (CPK)" extra={<span className="edf-ai-tag"><RobotOutlined /> AI监控</span>}>
        {[
          { p: '绕线张力', cpk: 1.45, status: '受控' },
          { p: '压装压力', cpk: 1.32, status: '受控' },
          { p: '绝缘电阻', cpk: 1.68, status: '受控' },
          { p: '气密泄漏量', cpk: 0.92, status: '预警' },
        ].map(s => (
          <div key={s.p} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{s.p}</span>
              <span>CPK={s.cpk} <Tag color={s.status === '受控' ? 'green' : 'orange'} style={{ fontSize: 10 }}>{s.status}</Tag></span>
            </div>
            <Progress percent={Math.min(s.cpk / 2 * 100, 100)} strokeColor={s.cpk >= 1.33 ? '#10b981' : '#f59e0b'} showInfo={false} size="small" />
          </div>
        ))}
      </Card>
    </div>
  </div>
);

const WMSView = () => (
  <div>
    <div className="edf-page-title"><InboxOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />WMS 仓储物流</div>
    <div className="edf-page-desc">精密物料分级管控 · AGV 无人配送 · 智能盘点与库存预警</div>
    <div className="edf-kpi-grid">
      <div className="edf-kpi-card"><div className="edf-kpi-label">库存SKU</div><div className="edf-kpi-value">1,286</div></div>
      <div className="edf-kpi-card edf-kpi-card--smart"><div className="edf-kpi-label">物料齐套率</div><div className="edf-kpi-value" style={{ color: '#10b981' }}>96.5%</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">AGV 在途</div><div className="edf-kpi-value">4</div></div>
      <div className="edf-kpi-card"><div className="edf-kpi-label">缺料预警</div><div className="edf-kpi-value" style={{ color: '#f59e0b' }}>2</div></div>
    </div>
    <div className="edf-two-col">
      <Card title="库区状态">
        {[
          { zone: '原材料精密库', usage: 78, temp: '22°C / 55%' },
          { zone: '电子元器件恒温库', usage: 65, temp: '25°C / 45%' },
          { zone: '在制品缓存区', usage: 82, temp: '-' },
          { zone: '成品合规库', usage: 45, temp: '23°C / 50%' },
          { zone: '不良品隔离库', usage: 12, temp: '-' },
        ].map(z => (
          <div key={z.zone} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{z.zone}</span><span style={{ color: '#94a3b8', fontSize: 11 }}>{z.temp}</span>
            </div>
            <Progress percent={z.usage} strokeColor={z.usage > 80 ? '#f59e0b' : '#0ea5e9'} size="small" />
          </div>
        ))}
      </Card>
      <Card title="AGV 配送任务">
        <Table size="small" pagination={false} dataSource={[
          { key: '1', agv: 'AGV-03', from: '原材料库', to: '定子加工区 OP10', status: '配送中', eta: '3min' },
          { key: '2', agv: 'AGV-07', from: '装配区 OP70', to: '高压测试区', status: '配送中', eta: '5min' },
          { key: '3', agv: 'AGV-01', from: '成品库', to: '出货月台', status: '待命', eta: '-' },
          { key: '4', agv: 'AGV-05', from: '在制品缓存', to: '老化测试区', status: '充电中', eta: '12min' },
        ]} columns={[
          { title: 'AGV', dataIndex: 'agv', width: 70 },
          { title: '起点', dataIndex: 'from' },
          { title: '终点', dataIndex: 'to' },
          { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '配送中' ? 'processing' : 'default'}>{s}</Tag> },
          { title: 'ETA', dataIndex: 'eta', width: 60 },
        ]} />
      </Card>
    </div>
  </div>
);

// ==================== 设备状态分析视图 ====================

const OEEGaugeChart = () => {
  const ref = useChart(() => ({
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      radius: '90%',
      center: ['50%', '55%'],
      itemStyle: { color: '#22c55e' },
      progress: { show: true, width: 14, roundCap: true },
      pointer: { show: true, length: '60%', width: 4, itemStyle: { color: '#0f172a' } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#e2e8f0']] } },
      axisTick: { distance: -18, length: 6, lineStyle: { color: '#94a3b8', width: 1 } },
      splitLine: { distance: -18, length: 12, lineStyle: { color: '#94a3b8', width: 1 } },
      axisLabel: { distance: -40, color: '#64748b', fontSize: 10 },
      title: { show: false },
      detail: { valueAnimation: true, formatter: '{value}%', color: '#0f172a', fontSize: 28, fontWeight: 700, offsetCenter: [0, '60%'] },
      data: [{ value: 86 }],
    }],
  }), []);
  return <div ref={ref} style={{ height: 200, width: '100%' }} />;
};

const RuntimePieChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 60, name: '运行', itemStyle: { color: '#22c55e' } },
        { value: 20, name: '故障', itemStyle: { color: '#ef4444' } },
        { value: 15, name: '空闲', itemStyle: { color: '#eab308' } },
        { value: 5, name: '停机', itemStyle: { color: '#94a3b8' } },
      ],
    }],
  }), []);
  return <div ref={ref} style={{ height: 220, width: '100%' }} />;
};

const FaultTop20Chart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 24, left: 8, right: 8, bottom: 24, containLabel: true },
    xAxis: { type: 'category', data: ['选择性波峰焊', '控制器涂密封胶', '程序烧录1', '相机检测', '激光线扫', '陶瓷垫片安装', '氦气回收', '顶盖装配', '反电动势测试', '轴与转子压装', '磁轴承压装', '机壳加热', '定子入壳', '气密检测', '性能测试', '噪音测试', '外观检查', '包装入库', '抽检', '出货'], axisLabel: { color: '#64748b', fontSize: 9, rotate: 30 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    series: [
      { name: '运行', type: 'bar', stack: 'total', data: [12, 10, 10, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6, 5, 5, 4, 3, 2, 2, 1], itemStyle: { color: '#22c55e' }, barWidth: '50%' },
      { name: '故障', type: 'bar', stack: 'total', data: [8, 9, 9, 8, 8, 7, 6, 6, 6, 7, 6, 5, 5, 5, 4, 3, 2, 2, 1, 1], itemStyle: { color: '#ef4444' } },
      { name: '空闲', type: 'bar', stack: 'total', data: [0, 1, 1, 3, 4, 5, 6, 3, 4, 0, 4, 3, 4, 2, 3, 4, 5, 4, 5, 3], itemStyle: { color: '#eab308' } },
      { name: '停机', type: 'bar', stack: 'total', data: [0, 0, 0, 0, 0, 0, 0, 5, 3, 6, 4, 6, 5, 8, 3, 9, 10, 12, 12, 15], itemStyle: { color: '#94a3b8' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 240, width: '100%' }} />;
};

const DeviceStatusAnalysisView = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('fault');
  const [selectedDevice, setSelectedDevice] = useState<typeof deviceList[0] | null>(null);
  const [timeMode, setTimeMode] = useState<'shift' | 'day'>('shift');
  const [shiftType, setShiftType] = useState<'day' | 'night'>('day');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-13');
  const [lineName, setLineName] = useState<string>('三合一电驱产线');
  const [remark] = useState<string>(() => {
    if (typeof window !== 'undefined' && (window as any).__ED_FACTORY_DATA__?.remark) {
      return (window as any).__ED_FACTORY_DATA__.remark;
    }
    return '';
  });

  // lineOptions, deviceList, statusColors, faultDetailData, alarmDetailData 已从 data.ts 导入

  const handleTimeClick = (device: typeof deviceList[0]) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
  };

  return (
    <div>
      {/* 时间维度控制 */}
      <div className="edf-line-time-bar">
        <div className="edf-line-select-wrapper">
          <Select
            value={lineName}
            onChange={(val) => setLineName(val)}
            options={lineOptions}
            size="small"
            className="edf-line-select"
            popupClassName="edf-line-select-dropdown"
            suffixIcon={<span style={{ color: '#0ea5e9', fontSize: 10 }}>▼</span>}
          />
        </div>
        <div className="edf-line-time-toggle">
          <div className={`edf-line-time-pill${timeMode === 'shift' ? ' edf-line-time-pill--active' : ''}`} onClick={() => setTimeMode('shift')}>班维度</div>
          <div className={`edf-line-time-pill${timeMode === 'day' ? ' edf-line-time-pill--active' : ''}`} onClick={() => setTimeMode('day')}>日维度</div>
        </div>
        {timeMode === 'shift' && (
          <div className="edf-line-shift-toggle">
            <div className={`edf-line-shift-pill${shiftType === 'day' ? ' edf-line-shift-pill--active' : ''}`} onClick={() => setShiftType('day')}>白班</div>
            <div className={`edf-line-shift-pill${shiftType === 'night' ? ' edf-line-shift-pill--active' : ''}`} onClick={() => setShiftType('night')}>夜班</div>
          </div>
        )}
        <div className="edf-line-date-picker">
          <DatePicker
            size="small"
            value={dayjs(selectedDate)}
            onChange={(date) => {
              if (date) {
                setSelectedDate(date.format('YYYY-MM-DD'));
              }
            }}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* 三个图表卡片 */}
      <div className="dsa-chart-grid">
        {/* OEE仪表盘 */}
        <div className="dsa-chart-card">
          <div className="dsa-chart-header">
            <div className="dsa-chart-title-bar" />
            <span className="dsa-chart-title-text">产线设备综合效率OEE</span>
          </div>
          <div className="dsa-oee-body">
            <div className="dsa-oee-gauge">
              <OEEGaugeChart />
            </div>
            <div className="dsa-oee-indicators">
              {[
                { label: '时间稼动率', value: '88%', icon: '⏱', color: '#22c55e' },
                { label: '性能稼动率', value: '88%', icon: '⚡', color: '#22c55e' },
                { label: '产品良率', value: '78%', icon: '✓', color: '#eab308ff' },
              ].map(item => (
                <div key={item.label} className="dsa-oee-indicator">
                  <div className="dsa-oee-indicator-icon" style={{ color: item.color }}>{item.icon}</div>
                  <div className="dsa-oee-indicator-info">
                    <div className="dsa-oee-indicator-label">{item.label}</div>
                    <div className="dsa-oee-indicator-value" style={{ color: item.color }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 设备运行时间统计 */}
        <div className="dsa-chart-card">
          <div className="dsa-chart-header">
            <div className="dsa-chart-title-bar" />
            <span className="dsa-chart-title-text">设备运行时间统计</span>
          </div>
          <div className="dsa-runtime-body">
            <RuntimePieChart />
            <div className="dsa-runtime-list">
            {[
              { name: '运行', value: 14.4, pct: 60, color: '#22c55e' },
              { name: '故障', value: 4.8, pct: 20, color: '#ef4444' },
              { name: '空闲', value: 3.6, pct: 15, color: '#eab308' },
              { name: '停机', value: 1.2, pct: 5, color: '#94a3b8' },
            ].map(item => (
              <div key={item.name} className="dsa-runtime-item">
                <div className="dsa-runtime-info">
                  <div className="dsa-runtime-dot" style={{ background: item.color }} />
                  <span className="dsa-runtime-name">{item.name}</span>
                </div>
                <div className="dsa-runtime-num">
                  <span className="dsa-runtime-value">{item.value}h</span>
                  <span className="dsa-runtime-pct" style={{ color: item.color }}>{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* 设备故障Top20 */}
        <div className="dsa-chart-card">
          <div className="dsa-chart-header">
            <div className="dsa-chart-title-bar" />
            <span className="dsa-chart-title-text">设备故障Top20统计</span>
          </div>
          <FaultTop20Chart />
        </div>
      </div>

      {/* 原型备注说明这是描述说明框 */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', margin: '12px 0', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>原型备注说明
          这是描述说明的点点滴滴的点点滴滴哒哒哒哒哒哒顶顶顶顶</div>
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {remark}
        </div>
      </div>

      {/* 设备状态统计分析表格 */}
      <div className="dsa-table-card">
        <div className="dsa-table-header">
          <div className="dsa-chart-header">
            <div className="dsa-chart-title-bar" />
            <span className="dsa-chart-title-text">2026年6月21日 全天/白班/夜班 设备状态明细</span>
          </div>
        </div>
        <Table
          size="small"
          pagination={false}
          dataSource={deviceList}
          columns={[
            { title: '序号', dataIndex: 'key', width: 50, align: 'center' },
            { title: '设备工序号', dataIndex: 'code', width: 120, align: 'center', render: (v: string, r: typeof deviceList[0]) => (
              <div>
                <div style={{ fontWeight: 500 }}>{v}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.name}</div>
              </div>
            )},
            { title: '设备OEE', dataIndex: 'oee', width: 100, align: 'center', render: (v: number) => (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="5" strokeDasharray={`${v * 1.13} 113`} strokeLinecap="round" transform="rotate(-90 22 22)" />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{v}%</div>
                </div>
              </div>
            )},
            { title: '运行时长', dataIndex: 'runTime', width: 100, align: 'center', render: (v: string) => <span style={{ color: '#22c55e', fontWeight: 500 }}>{v}</span> },
            { title: '故障时长', dataIndex: 'faultTime', width: 100, align: 'center', render: (v: string, r: typeof deviceList[0]) => <span className="dsa-time-link" style={{ color: '#ef4444', fontWeight: 500 }} onClick={() => handleTimeClick(r)}>{v}</span> },
            { title: '空闲时长', dataIndex: 'idleTime', width: 100, align: 'center', render: (v: string) => <span style={{ color: '#eab308', fontWeight: 500 }}>{v}</span> },
            { title: '停机时长', dataIndex: 'offTime', width: 100, align: 'center', render: (v: string) => <span style={{ color: '#94a3b8', fontWeight: 500 }}>{v}</span> },
            { title: '设备状态切片图', key: 'timeline', render: (_: unknown, r: typeof deviceList[0]) => (
              <div>
                <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', background: '#f1f5f9' }}>
                  <div style={{ width: `${r.runPct}%`, background: statusColors.run }} />
                  <div style={{ width: `${r.faultPct}%`, background: statusColors.fault }} />
                  <div style={{ width: `${r.idlePct}%`, background: statusColors.idle }} />
                  <div style={{ width: `${r.offPct}%`, background: statusColors.off }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#94a3b8' }}>
                  <span>07:00</span><span>08:00</span><span>09:00</span><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span><span>15:00</span><span>16:00</span><span>17:00</span><span>18:00</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10 }}>
                  <span style={{ color: statusColors.run }}>● 设备运行 ({r.runPct}%)</span>
                  <span style={{ color: statusColors.fault }}>● 设备故障 ({r.faultPct}%)</span>
                  <span style={{ color: statusColors.idle }}>● 设备空闲 ({r.idlePct}%)</span>
                  <span style={{ color: statusColors.off }}>● 设备停机 ({r.offPct}%)</span>
                </div>
              </div>
            )},
          ]}
        />
      </div>

      {/* 右侧抽屉 - 故障明细数据 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#f59e0b' }} />
            <span>故障明细数据</span>
            {selectedDevice && (
              <Tag size="small" style={{ fontSize: 12 }}>{selectedDevice.name}</Tag>
            )}
          </div>
        }
        placement="right"
        width={1100}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bodyStyle={{ padding: 0, background: '#f8fafc' }}
        headerStyle={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}
      >
        <div className="dsa-drawer-body">
          <Tabs
            activeKey={drawerTab}
            onChange={setDrawerTab}
            className="dsa-drawer-tabs"
            items={[
              {
                key: 'fault',
                label: '设备故障明细',
                children: (
                  <div className="dsa-drawer-table-wrap">
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={faultDetailData}
                      scroll={{ y: 'calc(100vh - 220px)' }}
                      columns={[
                        { title: '序号', dataIndex: 'key', width: 50, align: 'center' },
                        { title: '工位号', dataIndex: 'stationNo', width: 90, align: 'center' },
                        { title: '工位名称', dataIndex: 'stationName', width: 120, align: 'center' },
                        { title: '数据类型', dataIndex: 'dataType', width: 110, align: 'center' },
                        { title: '开始时间', dataIndex: 'startTime', width: 160, align: 'center' },
                        { title: '结束时间', dataIndex: 'endTime', width: 160, align: 'center' },
                        { title: '持续时长', dataIndex: 'duration', width: 80, align: 'center', render: (v: number) => (
                          <span style={{ fontWeight: 600 }}>{v}</span>
                        )},
                        { title: '故障现象', dataIndex: 'phenomenon', width: 120, align: 'center' },
                        { title: '故障原因', dataIndex: 'reason', width: 140, align: 'center' },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'alarm',
                label: '设备报警明细',
                children: (
                  <div className="dsa-drawer-table-wrap">
                    <Table
                      size="small"
                      pagination={false}
                      dataSource={alarmDetailData}
                      scroll={{ y: 'calc(100vh - 220px)' }}
                      columns={[
                        { title: '序号', dataIndex: 'key', width: 50, align: 'center' },
                        { title: '工位号', dataIndex: 'stationNo', width: 90, align: 'center' },
                        { title: '工位名称', dataIndex: 'stationName', width: 120, align: 'center' },
                        { title: '报警内容', dataIndex: 'alarmContent', align: 'center', render: (v: string) => (
                          <span style={{ fontSize: 12 }}>{v}</span>
                        )},
                        { title: '累计报警次数', dataIndex: 'alarmCount', width: 110, align: 'center', render: (v: number) => (
                          <span style={{ fontWeight: 600 }}>{v}</span>
                        )},
                        { title: '累计报警时长（秒）', dataIndex: 'alarmDuration', width: 140, align: 'center', render: (v: number) => (
                          <span style={{ fontWeight: 600 }}>{v}</span>
                        )},
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Drawer>
    </div>
  );
};

const SCADAView = () => {
  const [tab, setTab] = useState('monitor');
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null);

  return (
    <div>
      {/* 二级导航 */}
      <div className="edf-page-title"><MonitorOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />智能设备运维 (SCADA+CMMS)</div>
      <div className="edf-page-desc">
        精密设备7×24实时监控 · 全生命周期电子台账 · 预防性智能维保 · AI故障预测 · OEE精细化分析
        <span className="edf-ai-tag"><RobotOutlined /> AI预测性维护</span>
      </div>
      <>
          <div className="edf-kpi-grid--6 edf-kpi-grid">
            {[
              { l: '全厂 OEE', v: '83.5%', c: '#10b981', f: '目标 85%' },
              { l: '运行/总数', v: '42/48', c: '', f: '' },
              { l: '故障设备', v: '1', c: '#ef4444', f: '绕线机#02' },
              { l: '维保中', v: '2', c: '#f59e0b', f: '' },
              { l: '非计划停机', v: '2.3h', c: '#ef4444', f: '今日累计' },
              { l: 'AI高风险', v: '3', c: '#8b5cf6', f: '台设备' },
            ].map(k => (
              <div key={k.l} className="edf-kpi-card edf-kpi-card--smart">
                <div className="edf-kpi-label">{k.l}</div>
                <div className="edf-kpi-value" style={{ fontSize: 22, color: k.c || undefined }}>{k.v}</div>
                {k.f && <div className="edf-kpi-footer">{k.f}</div>}
              </div>
            ))}
          </div>

          <div className="edf-status-legend">
            {[{ c: '#22c55e', l: '运行' }, { c: '#94a3b8', l: '待机' }, { c: '#ef4444', l: '故障' }, { c: '#f59e0b', l: '维保' }, { c: '#475569', l: '停机' }].map(s => (
              <div key={s.l} className="edf-status-legend-item"><div className="edf-status-dot" style={{ background: s.c }} />{s.l}</div>
            ))}
          </div>

          <Tabs className="edf-scada-tabs" activeKey={tab} onChange={setTab} items={[
            {
              key: 'monitor', label: 'SCADA实时监控',
              children: (
                <>
                  <div className="edf-equip-grid" style={{ marginBottom: 20 }}>
                    {EQUIPMENTS.map(e => (
                      <div key={e.key} className={`edf-equip-card edf-equip-card--${e.status}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedEquip(e)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="edf-equip-name">{e.name}</div>
                          {e.aiRisk && e.aiRisk > 60 && <Tag color="purple" style={{ fontSize: 10 }}>AI风险{e.aiRisk}%</Tag>}
                        </div>
                        <div className={`edf-equip-status edf-equip-status--${e.status}`}>{STATUS_LABEL[e.status]} · OEE {e.oee}%</div>
                        <div className="edf-equip-param">{e.zone}</div>
                        <div className="edf-equip-param">{e.param}</div>
                        {e.faultCode && <Tag color="error" style={{ marginTop: 6, fontSize: 10 }}>故障码 {e.faultCode}</Tag>}
                      </div>
                    ))}
                  </div>
                  <Drawer title={selectedEquip?.name} open={!!selectedEquip} onClose={() => setSelectedEquip(null)} width={480}>
                    {selectedEquip && (
                      <div>
                        <Space style={{ marginBottom: 16 }}><Tag>{selectedEquip.model}</Tag><Tag color="blue">{selectedEquip.zone}</Tag></Space>
                        <div className="edf-equip-detail-grid">
                          {[
                            { l: '运行时长', v: selectedEquip.runtime || '-' },
                            { l: 'OEE', v: `${selectedEquip.oee}%` },
                            { l: '下次维保', v: selectedEquip.nextMaint || '-' },
                            { l: 'AI风险', v: `${selectedEquip.aiRisk || 0}%`, w: (selectedEquip.aiRisk || 0) > 60 },
                          ].map(p => (
                            <div key={p.l} className={`edf-param-box${p.w ? ' edf-param-box--warn' : ''}`}>
                              <div className="edf-param-label">{p.l}</div>
                              <div className="edf-param-value">{p.v}</div>
                            </div>
                          ))}
                        </div>
                        <Card size="small" title="实时工艺参数" style={{ marginTop: 16 }}>{selectedEquip.param}</Card>
                        {selectedEquip.aiRisk && selectedEquip.aiRisk > 50 && (
                          <div className="edf-ai-predict-card" style={{ marginTop: 16 }}>
                            <div className="edf-ai-predict-title"><RobotOutlined /> AI 故障预测</div>
                            <div style={{ fontSize: 13 }}>基于历史运行数据，预测 <strong>{selectedEquip.name}</strong> 在未来72h内发生隐性故障概率 <strong>{selectedEquip.aiRisk}%</strong></div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>建议：提前检查导轮磨损、校准张力传感器</div>
                          </div>
                        )}
                      </div>
                    )}
                  </Drawer>
                </>
              ),
            },
            {
              key: 'maint', label: '预防性维保',
              children: (
                <div className="edf-two-col">
                  <Card title="维保工单" extra={<Button type="primary" size="small">派发工单</Button>}>
                    <Table size="small" dataSource={MAINT_ORDERS} pagination={false} columns={[
                      { title: '工单号', dataIndex: 'id', width: 110 },
                      { title: '设备', dataIndex: 'equip' },
                      { title: '类型', dataIndex: 'type', width: 90 },
                      { title: '优先级', dataIndex: 'priority', width: 70, render: (p: string) => <Tag color={p === '紧急' ? 'red' : p === '重要' ? 'orange' : 'default'}>{p}</Tag> },
                      { title: '处理人', dataIndex: 'handler', width: 80 },
                      { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === '处理中' ? 'processing' : 'default'}>{s}</Tag> },
                    ]} />
                  </Card>
                  <Card title="维保计划时间线">
                    <div className="edf-maint-timeline">
                      {[
                        { t: '绕线机#01 周保养', d: '2026-06-15', s: '已计划' },
                        { t: '动平衡机#01 精度校准', d: '2026-06-13', s: '进行中' },
                        { t: '老化柜#05 月度保养', d: '2026-06-14', s: '待执行' },
                        { t: '高压测试台 季度检定', d: '2026-06-20', s: '已计划' },
                        { t: '绕线机#02 故障维修', d: '2026-06-13', s: '逾期风险' },
                      ].map((m, i) => (
                        <div key={i} className={`edf-maint-item${m.s === '进行中' ? '' : m.s === '逾期风险' ? ' edf-maint-item--overdue' : ' edf-maint-item--done'}`}>
                          <div><div style={{ fontWeight: 500, fontSize: 13 }}>{m.t}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{m.d} · {m.s}</div></div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ),
            },
            {
              key: 'ai', label: 'AI故障预测',
              children: (
                <div>
                  {[
                    { e: '高速绕线机#02', risk: 92, cause: '导轮磨损导致断线', action: '更换导轮组件 + 校准张力', cases: '历史3起相似故障' },
                    { e: '老化测试柜#06', risk: 68, cause: '温控传感器漂移', action: '提前校准温控系统', cases: '历史2起' },
                    { e: '气密性测试仪#01', risk: 55, cause: '密封件老化泄漏', action: '更换密封件', cases: '历史1起' },
                  ].map(a => (
                    <div key={a.e} className="edf-ai-predict-card">
                      <div className="edf-ai-predict-title"><RobotOutlined /> {a.e} · 故障概率 {a.risk}%</div>
                      <div style={{ fontSize: 13, marginBottom: 4 }}><strong>预测根因：</strong>{a.cause}</div>
                      <div style={{ fontSize: 13, marginBottom: 4 }}><strong>推荐措施：</strong>{a.action}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>佐证：{a.cases}</div>
                      <Progress percent={a.risk} strokeColor={a.risk > 80 ? '#ef4444' : '#f59e0b'} size="small" style={{ marginTop: 8 }} />
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: 'oee', label: 'OEE分析',
              children: (
                <div className="edf-two-col">
                  <Card title="OEE 三维度拆解">
                    <OEEWaterfall />
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 12 }}>OEE = 时间稼动率(89%) × 性能达成率(95%) × 良品率(98%) = 83%</div>
                  </Card>
                  <Card title="停机原因分析">
                    <DowntimeChart />
                  </Card>
                  <div style={{ gridColumn: '1 / -1' }} className="edf-chart-card">
                    <div className="edf-chart-title">OEE 周趋势 · 目标85%</div>
                    <OEEChart />
                  </div>
                </div>
              ),
            },
          ]} />
      </>
    </div>
  );
};

const EMSView = () => {
  const [emsTab, setEmsTab] = useState('collection'); // 数据采集/环境管控/节能分析
  const [emsNode, setEmsNode] = useState('plant');

  // 能耗采集树节点
  const treeNodes = [
    { key: 'plant', label: '全厂', kwh: '28,470', water: '42', air: '1,280', children: [
      { key: 'workshop-a', label: '电驱一线', kwh: '8,200', water: '15', air: '420' },
      { key: 'workshop-b', label: '电驱二线', kwh: '6,800', water: '12', air: '380' },
      { key: 'workshop-c', label: '电驱三线', kwh: '7,200', water: '10', air: '350' },
      { key: 'workshop-d', label: '测试老化区', kwh: '6,270', water: '5', air: '130' },
    ]},
  ];

  // 环境监控数据
  const envData = [
    { zone: '精密装配区', temp: 23.0, humidity: 55, cleanliness: 'ISO 7', pm25: 35, status: 'normal' },
    { zone: '绝缘测试区', temp: 22.5, humidity: 48, cleanliness: 'ISO 8', pm25: 42, status: 'normal' },
    { zone: '高温老化区', temp: 125, humidity: 38, cleanliness: '-', pm25: '-', status: 'warning' },
    { zone: '定子绕线区', temp: 24.2, humidity: 52, cleanliness: '-', pm25: 68, status: 'warning' },
    { zone: '转子压铸区', temp: 26.8, humidity: 48, cleanliness: '-', pm25: 95, status: 'normal' },
    { zone: '仓储区', temp: 22.0, humidity: 50, cleanliness: '-', pm25: 28, status: 'normal' },
  ];

  // 环境预警
  const envAlerts = [
    { level: 'warning', zone: '高温老化区', param: '温度', value: '125°C', threshold: '80-150°C', time: '14:32' },
    { level: 'warning', zone: '定子绕线区', param: '粉尘浓度', value: '68μg/m³', threshold: '<75μg/m³', time: '13:15' },
  ];

  // 高能耗设备TOP10
  const topEnergyDevices = [
    { rank: 1, name: '老化柜#05', kwh: '3,850', ratio: '13.5%', efficiency: '78%' },
    { rank: 2, name: '老化柜#06', kwh: '3,620', ratio: '12.7%', efficiency: '82%' },
    { rank: 3, name: '高压测试台#02', kwh: '2,940', ratio: '10.3%', efficiency: '85%' },
    { rank: 4, name: 'EOL综合测试台', kwh: '2,680', ratio: '9.4%', efficiency: '78%' },
    { rank: 5, name: '空压机#01', kwh: '2,150', ratio: '7.6%', efficiency: '72%' },
    { rank: 6, name: '高速绕线机#01', kwh: '1,980', ratio: '6.9%', efficiency: '78%' },
    { rank: 7, name: '精密压装机#03', kwh: '1,750', ratio: '6.1%', efficiency: '91%' },
    { rank: 8, name: '铸铝设备#01', kwh: '1,520', ratio: '5.3%', efficiency: '82%' },
    { rank: 9, name: '动平衡机#01', kwh: '1,280', ratio: '4.5%', efficiency: '86%' },
    { rank: 10, name: '叠压机#01', kwh: '1,120', ratio: '3.9%', efficiency: '90%' },
  ];

  // 节能优化建议
  const savingSuggestions = [
    { 
      type: '峰谷电价优化', 
      icon: '⏰',
      desc: '建议将老化柜批次任务移至谷时段(0:00-6:00)运行',
      saving: '1,850 kWh/月',
      cost: '¥1,480/月',
      carbon: '1.08 tCO₂/月',
      priority: 'high'
    },
    { 
      type: '设备启停优化', 
      icon: '🔄',
      desc: '非生产时段自动切断绕线机#02待机电源',
      saving: '960 kWh/月',
      cost: '¥768/月',
      carbon: '0.56 tCO₂/月',
      priority: 'high'
    },
    { 
      type: '空压机群控', 
      icon: '💨',
      desc: '优化压力带至0.65-0.75MPa，检测并修复泄漏点',
      saving: '2,400 kWh/月',
      cost: '¥1,920/月',
      carbon: '1.39 tCO₂/月',
      priority: 'medium'
    },
    { 
      type: '老化柜节能', 
      icon: '🔥',
      desc: '合并3批次老化任务，优化温度曲线至80°C→120°C阶梯升温',
      saving: '3,600 kWh/月',
      cost: '¥2,880/月',
      carbon: '2.09 tCO₂/月',
      priority: 'high'
    },
  ];

  return (
    <div>
      <div className="edf-page-title"><ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 8 }} />EMS 精细化能耗管理</div>
      <div className="edf-page-desc">
        三级能耗采集(车间/产线/设备) · 环境参数管控(温湿度/洁净度/粉尘) · AI节能优化
        <span className="edf-ai-tag"><RobotOutlined /> AI节能</span>
      </div>

      {/* 碳排放条 */}
      <div className="edf-carbon-bar">
        <CloudOutlined style={{ fontSize: 24, color: '#10b981' }} />
        <div>
          <div style={{ fontWeight: 600 }}>今日碳排放估算：235.8 tCO₂</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>碳排放强度 8.2 kgCO₂/台 · 较上月下降 2.1% · 年度目标完成率 68%</div>
        </div>
      </div>

      {/* KPI指标 */}
      <div className="edf-kpi-grid--6 edf-kpi-grid">
        {[
          { l: '单位产品能耗', v: '18.6', u: 'kWh/台', trend: '-3.2%' },
          { l: '能耗成本占比', v: '7.2', u: '%', trend: '-0.5%' },
          { l: '谷电占比', v: '35.8', u: '%', trend: '+2.1%' },
          { l: '设备空载率', v: '4.2', u: '%', trend: '-0.8%' },
          { l: '环境达标率', v: '99.6', u: '%', trend: '+0.1%' },
          { l: '节能目标完成率', v: '68', u: '%', trend: '' },
        ].map(k => (
          <div key={k.l} className="edf-kpi-card">
            <div className="edf-kpi-label">{k.l}</div>
            <div className="edf-kpi-value" style={{ fontSize: 22 }}>
              {k.v}<span style={{ fontSize: 12 }}>{k.u}</span>
              {k.trend && (
                <span style={{ 
                  fontSize: 11, 
                  marginLeft: 6, 
                  color: k.trend.startsWith('+') ? (k.trend.includes('-') ? '#ef4444' : '#22c55e') : '#22c55e' 
                }}>
                  {k.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 三Tab页签 */}
      <Tabs activeKey={emsTab} onChange={setEmsTab} items={[
        {
          key: 'collection', 
          label: <span><ThunderboltOutlined />能耗数据采集</span>,
          children: (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
              {/* 左侧：采集树 */}
              <div className="edf-ems-tree">
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: '#64748b' }}>能耗采集层级</div>
                {treeNodes.map(n => (
                  <div key={n.key}>
                    <div 
                      className={`edf-ems-tree-node${emsNode === n.key ? ' edf-ems-tree-node--active' : ''}`} 
                      onClick={() => setEmsNode(n.key)}
                      style={{ padding: '10px 12px' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        电 {n.kwh} kWh · 水 {n.water} m³ · 气 {n.air} m³
                      </div>
                    </div>
                    {n.children?.map(c => (
                      <div 
                        key={c.key} 
                        className={`edf-ems-tree-node edf-ems-tree-child${emsNode === c.key ? ' edf-ems-tree-node--active' : ''}`} 
                        onClick={() => setEmsNode(c.key)}
                        style={{ padding: '8px 12px', marginLeft: 20 }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{c.label}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                          电 {c.kwh} kWh · 水 {c.water} m³ · 气 {c.air} m³
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 右侧：实时曲线和统计 */}
              <div>
                <div className="edf-chart-card" style={{ marginBottom: 16 }}>
                  <div className="edf-chart-title">24小时实时能耗曲线</div>
                  <EnergyChart />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="edf-peak-card edf-peak-card--peak">
                    <div style={{ fontSize: 11, color: '#991b1b' }}>峰时段用电</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>9,820 kWh</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>占比 34.5%</div>
                  </div>
                  <div className="edf-peak-card edf-peak-card--flat">
                    <div style={{ fontSize: 11, color: '#0369a1' }}>平时段用电</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>12,450 kWh</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>占比 43.7%</div>
                  </div>
                  <div className="edf-peak-card edf-peak-card--valley">
                    <div style={{ fontSize: 11, color: '#047857' }}>谷时段用电</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>6,200 kWh</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>占比 21.8%</div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: 'environment', 
          label: <span><EnvironmentOutlined />环境参数管控</span>,
          children: (
            <div>
              {/* 环境参数网格 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {envData.map(env => (
                  <div key={env.zone} className="edf-kpi-card" style={{ 
                    borderLeft: `4px solid ${env.status === 'warning' ? '#f59e0b' : '#22c55e'}` 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{env.zone}</div>
                      <Tag color={env.status === 'warning' ? 'warning' : 'success'}>
                        {env.status === 'warning' ? '预警' : '正常'}
                      </Tag>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>温度</div>
                        <div style={{ fontWeight: 600 }}>{env.temp}{env.temp > 100 ? '°C' : '°C'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>湿度</div>
                        <div style={{ fontWeight: 600 }}>{env.humidity}%RH</div>
                      </div>
                      {env.cleanliness !== '-' && (
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: 10 }}>洁净度</div>
                          <div style={{ fontWeight: 600 }}>{env.cleanliness}</div>
                        </div>
                      )}
                      {env.pm25 !== '-' && (
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: 10 }}>PM2.5</div>
                          <div style={{ fontWeight: 600, color: env.pm25 > 75 ? '#ef4444' : '#22c55e' }}>{env.pm25} μg/m³</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 环境预警列表 */}
              <Card title="环境预警列表" extra={<Badge count={envAlerts.length} style={{ backgroundColor: '#f59e0b' }} />}>
                <Table 
                  size="small" 
                  pagination={false} 
                  dataSource={envAlerts} 
                  columns={[
                    { 
                      title: '预警级别', 
                      dataIndex: 'level',
                      width: 100,
                      render: (v) => <Tag color={v === 'warning' ? 'warning' : 'error'}>{v === 'warning' ? '警告' : '紧急'}</Tag>
                    },
                    { title: '区域', dataIndex: 'zone' },
                    { title: '参数', dataIndex: 'param' },
                    { title: '当前值', dataIndex: 'value' },
                    { title: '标准阈值', dataIndex: 'threshold' },
                    { title: '触发时间', dataIndex: 'time', width: 100 },
                  ]} 
                />
              </Card>
            </div>
          ),
        },
        {
          key: 'saving', 
          label: <span><BulbOutlined />节能分析优化</span>,
          children: (
            <div>
              {/* TOP10高能耗设备 */}
              <Card title="高能耗设备TOP10" style={{ marginBottom: 16 }}>
                <Table 
                  size="small" 
                  pagination={false} 
                  dataSource={topEnergyDevices} 
                  columns={[
                    { 
                      title: '排名', 
                      dataIndex: 'rank',
                      width: 60,
                      render: (v) => (
                        <span style={{ 
                          fontWeight: 700, 
                          color: v <= 3 ? '#ef4444' : '#64748b',
                          fontSize: v <= 3 ? 16 : 13 
                        }}>
                          #{v}
                        </span>
                      )
                    },
                    { title: '设备名称', dataIndex: 'name' },
                    { 
                      title: '日能耗', 
                      dataIndex: 'kwh',
                      sorter: (a, b) => parseFloat(a.kwh) - parseFloat(b.kwh)
                    },
                    { 
                      title: '占比', 
                      dataIndex: 'ratio',
                      render: (v) => <Tag color="blue">{v}</Tag>
                    },
                    { 
                      title: '能耗效率', 
                      dataIndex: 'efficiency',
                      render: (v) => (
                        <span style={{ color: parseFloat(v) >= 85 ? '#22c55e' : parseFloat(v) >= 75 ? '#f59e0b' : '#ef4444' }}>
                          {v}
                        </span>
                      )
                    },
                  ]} 
                />
              </Card>

              {/* AI节能优化建议 */}
              <Card 
                title="AI节能优化建议" 
                extra={<span className="edf-ai-tag"><RobotOutlined /> 智能分析</span>}
                style={{ marginBottom: 16 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {savingSuggestions.map((item, i) => (
                    <div key={i} style={{ 
                      padding: 16, 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 8,
                      borderLeft: `4px solid ${item.priority === 'high' ? '#ef4444' : '#f59e0b'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {item.icon} {item.type}
                        </div>
                        <Tag color={item.priority === 'high' ? 'error' : 'warning'}>
                          {item.priority === 'high' ? '高优先级' : '中优先级'}
                        </Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{item.desc}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11 }}>
                        <div>
                          <div style={{ color: '#94a3b8' }}>预计节能</div>
                          <div style={{ fontWeight: 600, color: '#22c55e' }}>{item.saving}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8' }}>成本节约</div>
                          <div style={{ fontWeight: 600, color: '#0ea5e9' }}>{item.cost}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8' }}>碳减排</div>
                          <div style={{ fontWeight: 600, color: '#10b981' }}>{item.carbon}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 能耗异常预警 */}
              <Card title="能耗异常预警">
                <Table size="small" pagination={false} dataSource={[
                  { key: '1', target: '老化柜#05', type: '单设备能耗超标', value: '+18%', time: '14:32', status: '处理中' },
                  { key: '2', target: 'B车间', type: '时段能耗突增', value: '+25%', time: '10:15', status: '已解决' },
                  { key: '3', target: '测试台区域', type: '空转能耗过高', value: '4.2%', time: '09:00', status: '待处理' },
                ]} columns={[
                  { title: '对象', dataIndex: 'target' },
                  { title: '异常类型', dataIndex: 'type' },
                  { title: '偏差', dataIndex: 'value', width: 80, render: (v) => <span style={{ color: '#ef4444', fontWeight: 600 }}>{v}</span> },
                  { title: '时间', dataIndex: 'time', width: 70 },
                  { title: '状态', dataIndex: 'status', width: 80, render: (v) => <Tag color={v === '已解决' ? 'success' : v === '处理中' ? 'processing' : 'default'}>{v}</Tag> },
                ]} />
              </Card>
            </div>
          ),
        },
      ]} />
    </div>
  );
};

const DataPlatformView = () => {
  const [dataTab, setDataTab] = useState('overview');

  return (
    <div>
      <div className="edf-page-title"><DatabaseOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />数据中台与智能分析</div>
      <div className="edf-page-desc">IT/OT全域数据融合 · 电驱行业数据标准化治理 · AI预测算法 · 自定义报表 · 数据资产沉淀</div>

      <div className="edf-governance-grid">
        {[
          { v: '28', l: '接入数据源' }, { v: '2.8M', l: '日采集量(条)' },
          { v: '99.2%', l: '数据完整率' }, { v: '98.6%', l: '数据准确率' },
        ].map(g => (
          <div key={g.l} className="edf-gov-card"><div className="edf-gov-value">{g.v}</div><div className="edf-gov-label">{g.l}</div></div>
        ))}
      </div>

      <Tabs activeKey={dataTab} onChange={setDataTab} items={[
        {
          key: 'overview', label: '数据集成拓扑',
          children: (
            <div>
              <div className="edf-data-topology">
                {[
                  { icon: <ToolOutlined />, name: 'OT设备数据', count: '1.2M/日', hub: false },
                  { icon: <BuildOutlined />, name: 'MES生产', count: '380K/日', hub: false },
                  { icon: <SafetyCertificateOutlined />, name: 'QMS质量', count: '120K/日', hub: false },
                  { icon: <DatabaseOutlined />, name: '数据中台', count: '统一治理', hub: true },
                  { icon: <ThunderboltOutlined />, name: 'EMS能耗', count: '45K/日', hub: false },
                ].map((n, i) => (
                  <div key={i} className={`edf-data-node${n.hub ? ' edf-data-node--hub' : ''}`}>
                    <div className="edf-data-node-icon">{n.icon}</div>
                    <div className="edf-data-node-name">{n.name}</div>
                    <div className="edf-data-node-count">{n.count}</div>
                  </div>
                ))}
              </div>
              <div className="edf-arch-layers">
                {[
                  { n: 5, t: '可视化决策层', d: '数字孪生驾驶舱 · 三级看板 · AI决策辅助' },
                  { n: 4, t: '业务应用层', d: 'PLM · ERP · APS · MES · QMS · WMS · SCADA · EMS' },
                  { n: 3, t: '平台底座层', d: '物联网中台 · 数据中台 · 业务中台 · 安全中台' },
                  { n: 2, t: '数据采集层', d: '边缘网关 · OPC UA/Modbus/MQTT · 清洗预处理' },
                  { n: 1, t: '设备感知层', d: '绕线机 · 压装机 · 老化柜 · AGV · 传感器/PLC' },
                ].map(l => (
                  <div key={l.n} className="edf-arch-layer">
                    <div className="edf-arch-layer-num">{l.n}</div>
                    <div><div className="edf-arch-layer-title">{l.t}</div><div className="edf-arch-layer-desc">{l.d}</div></div>
                  </div>
                ))}
              </div>
              <Card title="实时数据吞吐">
                <DataFlowChart />
              </Card>
            </div>
          ),
        },
        {
          key: 'assets', label: '数据资产目录',
          children: (
            <Table dataSource={[
              { key: '1', name: '工艺参数数据集', domain: 'OT/MES', fields: '绕线张力/压装力/老化温度', records: '1.2M', quality: '99.1%' },
              { key: '2', name: '质量检测数据集', domain: 'QMS', fields: 'FTT/绝缘/气密性/EOL', records: '380K', quality: '99.5%' },
              { key: '3', name: '设备运行数据集', domain: 'SCADA', fields: 'OEE/故障码/运行参数', records: '520K', quality: '98.8%' },
              { key: '4', name: '能耗成本数据集', domain: 'EMS', fields: '用电/用水/单台能耗', records: '45K', quality: '99.0%' },
              { key: '5', name: '追溯全链路数据集', domain: 'MES/QMS', fields: 'VIN码/批次/工序/人员', records: '280K', quality: '99.8%' },
            ]} columns={[
              { title: '数据资产', dataIndex: 'name' },
              { title: '来源域', dataIndex: 'domain', width: 100 },
              { title: '核心字段', dataIndex: 'fields', ellipsis: true },
              { title: '记录数', dataIndex: 'records', width: 80 },
              { title: '质量分', dataIndex: 'quality', width: 80 },
            ]} pagination={false} />
          ),
        },
        {
          key: 'ai', label: 'AI模型注册',
          children: (
            <div className="edf-model-registry">
              {[
                { name: '产能负荷预测模型', desc: '基于订单+设备负荷预测7天产能瓶颈', acc: '92%', status: '运行中' },
                { name: '设备故障预测模型', desc: '绕线机/压装机/老化柜隐性故障预判', acc: '87%', status: '运行中' },
                { name: '质量缺陷预测模型', desc: 'SPC参数波动→批量不良风险预警', acc: '89%', status: '运行中' },
                { name: '能耗优化模型', desc: '空转/高峰/批次运行节能策略推荐', acc: '85%', status: '运行中' },
                { name: '交付周期预测模型', desc: '工单交期准时率AI预判', acc: '91%', status: '运行中' },
                { name: '成本预估模型', desc: '单位制造成本趋势预测', acc: '78%', status: '训练中' },
              ].map(m => (
                <div key={m.name} className="edf-model-card">
                  <div className="edf-model-icon"><RobotOutlined /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.desc}</div>
                    <Space style={{ marginTop: 6 }}>
                      <Tag color="green">准确率 {m.acc}</Tag>
                      <Tag color={m.status === '运行中' ? 'processing' : 'default'}>{m.status}</Tag>
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          key: 'predict', label: '智能预判看板',
          children: (
            <div>
              <div className="edf-three-col" style={{ marginBottom: 20 }}>
                {[
                  { t: '产能负荷预测', v: '未来7天老化工序饱和95%', c: 'warn', icon: <FundOutlined /> },
                  { t: '交付周期预测', v: 'WO-001 可按期交付(91%)', c: 'good', icon: <ClockCircleOutlined /> },
                  { t: '质量缺陷预测', v: '气密性CPK下降趋势', c: 'warn', icon: <SafetyCertificateOutlined /> },
                  { t: '设备故障预测', v: '绕线机#02 72h断线风险92%', c: 'bad', icon: <ToolOutlined /> },
                  { t: '能耗趋势预测', v: '下周能耗环比+5%', c: 'warn', icon: <ThunderboltOutlined /> },
                  { t: '成本预估', v: '月单位成本 ¥3,280(-2%)', c: 'good', icon: <LineChartOutlined /> },
                ].map(p => (
                  <div key={p.t} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, borderLeft: `4px solid ${p.c === 'good' ? '#10b981' : p.c === 'bad' ? '#ef4444' : '#f59e0b'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {p.icon}<span style={{ fontWeight: 600, fontSize: 13 }}>{p.t}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.v}</div>
                  </div>
                ))}
              </div>
              <Card title="工艺优化AI建议" extra={<span className="edf-ai-tag"><RobotOutlined /> 数据中台输出</span>}>
                {[
                  '基于3个月质量数据，建议将气密性测试标准阈值从1.2Pa收紧至1.0Pa，预计不良率降低0.3%',
                  '老化工序产能瓶颈：建议增加1台老化柜或优化批次调度，可释放15%产能',
                  '绕线机#02故障模式与导轮磨损强相关，建议将导轮更换周期从6个月缩短至4个月',
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13 }}>
                    <BulbOutlined style={{ color: '#0ea5e9', marginTop: 3 }} />{s}
                  </div>
                ))}
              </Card>
            </div>
          ),
        },
        {
          key: 'report', label: '自定义报表',
          children: (
            <div className="edf-two-col">
              <Card title="报表模板库">
                {['生产进度日报', 'OEE周报', '质量月报', '能耗成本分析', '设备故障统计', '交付达成报告'].map(r => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <span><FileTextOutlined style={{ marginRight: 8, color: '#0ea5e9' }} />{r}</span>
                    <Button type="link" size="small">预览</Button>
                  </div>
                ))}
              </Card>
              <Card title="报表预览 · 生产进度日报">
                <div className="edf-report-preview">
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>电驱工厂生产进度日报 · 2026-06-13</div>
                  <div style={{ fontSize: 13, lineHeight: 2, color: '#64748b' }}>
                    <div>计划产量：1,350台 · 实际产量：1,247台 · 达成率 92.4%</div>
                    <div>瓶颈工序：高温老化(WIP 86台) · 非计划停机 2.3h</div>
                    <div>质量：FTT 99.2% · 不良品 10台 · 主要缺陷：气密泄漏</div>
                    <div>设备：OEE 83.5% · 故障1台(绕线机#02) · 维保2台</div>
                    <div>能耗：28,470kWh · 单台18.6kWh · 空转浪费4.2%</div>
                  </div>
                </div>
              </Card>
            </div>
          ),
        },
      ]} />
    </div>
  );
};

// ==================== 产线日常数据 - Mock数据 (已从 data.ts 导入) ====================

// ==================== 产线数据视图 ====================

const LineDailyView = () => {
  const [activeTab, setActiveTab] = useState('ops');
  const [abnormalTab, setAbnormalTab] = useState('device-status');

  const abnormalItems = [
    { key: 'device-status', label: '设备状态分析', children: <DeviceStatusAnalysisView /> },
    { key: 'overview', label: '异常总览', children: <Table columns={abnormalOverviewColumns} dataSource={abnormalOverviewData} pagination={false} size="small" /> },
    { key: 'list', label: '异常清单', children: <Table columns={abnormalListColumns} dataSource={abnormalListData} pagination={false} size="small" /> },
    { key: 'fault-stat', label: '故障时间次数统计', children: <Table columns={faultStatColumns} dataSource={faultStatData} pagination={false} size="small" /> },
    { key: 'mttr-mtbf', label: '故障率&MTTR&MTBF', children: <Table columns={mttrMtbfColumns} dataSource={mttrMtbfData} pagination={false} size="small" /> },
    { key: 'category', label: '故障分类/频次占比', children: <Table columns={faultCategoryColumns} dataSource={faultCategoryData} pagination={false} size="small" /> },
    { key: 'top', label: 'TOP故障', children: <Table columns={topFaultColumns} dataSource={topFaultData} pagination={false} size="small" /> },
    { key: 'collect', label: '故障数采', children: <Table columns={faultCollectColumns} dataSource={faultCollectData} pagination={false} size="small" /> },
    { key: 'maint', label: '工序号维护', children: <Table columns={processMaintColumns} dataSource={processMaintData} pagination={false} size="small" /> },
  ];

  const tabItems = [
    { key: 'ops', label: '运营数据', children: <Table columns={opsColumns} dataSource={opsData} pagination={false} size="small" /> },
    { key: 'oee', label: 'OEE明细', children: <Table columns={oeeColumns} dataSource={oeeData} pagination={false} size="small" /> },
    { key: 'ftt', label: 'FTT明细', children: <Table columns={fttColumns} dataSource={fttData} pagination={false} size="small" /> },
    { key: 'yield', label: '达产率明细', children: <Table columns={yieldColumns} dataSource={yieldData} pagination={false} size="small" /> },
    { key: 'abnormal', label: '产线异常明细', children: (
      <Tabs activeKey={abnormalTab} onChange={setAbnormalTab} items={abnormalItems} type="card" size="small" style={{ marginTop: 8 }} />
    )},
    { key: 'takt', label: '产线节拍明细', children: <Table columns={taktColumns} dataSource={taktData} pagination={false} size="small" /> },
    { key: 'energy', label: '环境能耗数据', children: <Table columns={energyColumns} dataSource={energyData} pagination={false} size="small" /> },
  ];

  return (
    <div>
      <div className="edf-page-title"><LineChartOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />产线日常数据</div>
      <div className="edf-page-desc">产线设备运行状态实时监控 · OEE分析 · 故障明细追踪</div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} type="card" size="large" style={{ marginTop: 16 }} />
    </div>
  );
};

const LineOverviewView = () => (
  <div>
    <div className="edf-page-title"><FundOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />产线项目总览</div>
    <div className="edf-page-desc">产线项目进度追踪 · 产能规划 · 资源配置</div>
    <div style={{ background: '#fff', borderRadius: 12, padding: '80px 0', textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>
      <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
      <div style={{ fontSize: 16 }}>产线项目总览页面建设中</div>
      <div style={{ fontSize: 13, marginTop: 8 }}>敬请期待...</div>
    </div>
  </div>
);

const MESStatusView = () => (
  <div>
    <div className="edf-page-title"><ApiOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />MES服务器状态</div>
    <div className="edf-page-desc">MES系统服务器运行监控 · 数据库状态 · 接口健康检查</div>
    <div style={{ background: '#fff', borderRadius: 12, padding: '80px 0', textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>
      <CloudOutlined style={{ fontSize: 48, marginBottom: 16 }} />
      <div style={{ fontSize: 16 }}>MES服务器状态页面建设中</div>
      <div style={{ fontSize: 13, marginTop: 8 }}>敬请期待...</div>
    </div>
  </div>
);

// ==================== Navigation ====================

const NAV: { group: string; items: { key: NavKey; label: string; icon: React.ReactNode; badge?: number }[] }[] = [
  { group: '可视化', items: [
    { key: 'cockpit', label: '数字孪生驾驶舱', icon: <DashboardOutlined /> },
    { key: 'line-twin', label: '数字孪生产线', icon: <DeploymentUnitOutlined />, badge: 1 },
  ]},
  { group: '产线数据', items: [
    { key: 'line-daily', label: '产线日常数据', icon: <LineChartOutlined /> },
    { key: 'line-overview', label: '产线项目总览', icon: <FundOutlined /> },
    { key: 'mes-status', label: 'MES服务器状态', icon: <ApiOutlined /> },
  ]},
  { group: '业务应用', items: [
    { key: 'scada', label: '智能设备运维', icon: <MonitorOutlined /> },
    { key: 'ems', label: 'EMS 能耗管理', icon: <ThunderboltOutlined /> },
  ]},
  { group: '平台底座', items: [{ key: 'data', label: '数据中台', icon: <DatabaseOutlined /> }] },
];

const PAGE_TITLES: Record<NavKey, string> = {
  cockpit: '数字孪生驾驶舱', 'line-twin': '数字孪生产线',
  scada: '智能设备运维 (SCADA+CMMS)',
  ems: 'EMS 精细化能耗管理', data: '数据中台与智能分析',
  'line-daily': '产线日常数据', 'line-overview': '产线项目总览', 'mes-status': 'MES服务器状态',
};

// ==================== Main ====================

const Component: React.FC = () => {
  const [nav, setNav] = useState<NavKey>('line-daily');

  const content = () => {
    switch (nav) {
      case 'cockpit': return <CockpitView />;
      case 'line-twin': return <LineTwinView />;
      case 'scada': return <SCADAView />;
      case 'ems': return <EMSView />;
      case 'data': return <DataPlatformView />;
      case 'line-daily': return <LineDailyView />;
      case 'line-overview': return <LineOverviewView />;
      case 'mes-status': return <MESStatusView />;
      default: return <CockpitView />;
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#0ea5e9', borderRadius: 8 } }}>
      <div className="ed-factory-platform">
        <aside className="edf-sidebar">
          <div className="edf-sidebar-brand">
            <div className="edf-sidebar-logo">SMF</div>
            <div className="edf-sidebar-title">产线数字管理平台</div>
            <div className="edf-sidebar-subtitle">Smart Manufacturing Platform</div>
          </div>
          <nav className="edf-sidebar-nav">
            {NAV.map(g => (
              <div key={g.group}>
                <div className="edf-nav-group-title">{g.group}</div>
                {g.items.map(item => (
                  <div
                    key={item.key}
                    className={`edf-nav-item${nav === item.key ? ' edf-nav-item--active' : ''}${item.key === 'cockpit' ? ' edf-nav-item--cockpit' : ''}`}
                    onClick={() => setNav(item.key)}
                  >
                    <span className="edf-nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="edf-nav-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="edf-sidebar-footer">
            <div className="edf-arch-tag">五层架构 · 微服务 · IATF16949</div>
          </div>
        </aside>

        <div className="edf-main">
          {nav !== 'cockpit' && (
            <header className="edf-header">
              <div className="edf-header-title">{PAGE_TITLES[nav]}</div>
              <div className="edf-header-actions">
                <Input 
                  prefix={<SearchOutlined />} 
                  placeholder="搜索工单、设备、产品码..." 
                  className={nav === 'line-twin' ? 'edf-search-dark' : ''}
                  style={{ width: 260 }} 
                />
                <Badge count={3} size="small">
                  <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} onClick={() => setNav('cockpit')} />
                </Badge>
                <Button type="text" icon={<UserOutlined style={{ fontSize: 18 }} />}>工厂管理员</Button>
              </div>
            </header>
          )}
          <main className={nav === 'cockpit' ? 'edf-content--cockpit' : 'edf-content'}>{content()}</main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;
