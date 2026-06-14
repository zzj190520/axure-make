/**
 * @name 电驱智能工厂管理平台
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
import {
  ConfigProvider, Input, Button, Tag, Table, Select, Space,
  Badge, Tabs, Card, Typography, Progress, Tooltip, Drawer, Timeline, Row, Col,
} from 'antd';
import {
  DashboardOutlined, ScheduleOutlined, BuildOutlined, SafetyCertificateOutlined,
  InboxOutlined, MonitorOutlined, ThunderboltOutlined, DatabaseOutlined,
  SearchOutlined, BellOutlined, UserOutlined, FullscreenOutlined,
  RiseOutlined, FallOutlined, RobotOutlined, WarningOutlined,
  CheckCircleOutlined, ScanOutlined, ToolOutlined, BulbOutlined, ApiOutlined,
  EnvironmentOutlined, CloudOutlined, LineChartOutlined, FundOutlined,
  SyncOutlined, ClockCircleOutlined, CarOutlined, ExperimentOutlined,
  NodeIndexOutlined, FileTextOutlined, ApartmentOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// ==================== Types ====================

type NavKey = 'cockpit' | 'aps' | 'mes' | 'qms' | 'wms' | 'scada' | 'ems' | 'data';

type EquipStatus = 'run' | 'idle' | 'fault' | 'maint' | 'stop';

interface Equipment {
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

interface ZoneDetail {
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

interface WorkOrder {
  key: string;
  id: string;
  model: string;
  qty: number;
  progress: number;
  line: string;
  delivery: string;
  status: string;
}

// ==================== Mock Data ====================

const ZONE_DETAILS: ZoneDetail[] = [
  { id: 'stator', name: '定子加工区', devices: 8, output: 126, wip: 45, ftt: 99.5, status: 'fault', env: { temp: 24.2, humidity: 52 }, equipList: ['绕线机#01', '绕线机#02', '叠压机#01'] },
  { id: 'rotor', name: '转子压铸区', devices: 6, output: 118, wip: 38, ftt: 99.2, status: 'run', env: { temp: 26.8, humidity: 48 }, equipList: ['铸铝设备#01', '打磨机#02'] },
  { id: 'core', name: '铁芯叠压区', devices: 4, output: 132, wip: 22, ftt: 99.6, status: 'run', env: { temp: 23.5, humidity: 50 }, equipList: ['叠压机#02', '焊接机#01'] },
  { id: 'assembly', name: '精密装配区', devices: 12, output: 98, wip: 62, ftt: 98.8, status: 'run', env: { temp: 23.0, humidity: 55 }, equipList: ['压装机#03', '机器人#02', '动平衡机#01'] },
  { id: 'hvtest', name: '高压测试区', devices: 6, output: 105, wip: 28, ftt: 99.8, status: 'warn', env: { temp: 22.5, humidity: 45 }, equipList: ['高压测试台#02', '绝缘测试仪#01'] },
  { id: 'aging', name: '高温老化区', devices: 10, output: 86, wip: 86, ftt: 99.0, status: 'warn', env: { temp: 28.5, humidity: 42 }, equipList: ['老化柜#05', '老化柜#06', '老化柜#07'] },
  { id: 'calib', name: '整机标定区', devices: 5, output: 92, wip: 22, ftt: 99.6, status: 'run', env: { temp: 23.8, humidity: 50 }, equipList: ['EOL测试台', '标定台#01'] },
  { id: 'warehouse', name: '成品仓储区', devices: 3, output: 210, wip: 0, ftt: 100, status: 'run', env: { temp: 22.0, humidity: 48 }, equipList: ['AGV通道', '堆垛机#01'] },
];

const ZONES = ZONE_DETAILS;

const EQUIPMENTS: Equipment[] = [
  { key: '1', name: '高速绕线机 #01', zone: '定子加工区', status: 'run', oee: 88, param: '张力 12.5N · 转速 3200rpm', model: 'SW-3200X', runtime: '4,280h', nextMaint: '2026-06-20', aiRisk: 15 },
  { key: '2', name: '高速绕线机 #02', zone: '定子加工区', status: 'fault', oee: 0, param: '故障码 E-2047 断线报警', model: 'SW-3200X', runtime: '4,512h', faultCode: 'E-2047', aiRisk: 92 },
  { key: '3', name: '转子铸铝设备 #01', zone: '转子压铸区', status: 'run', oee: 82, param: '温度 685°C · 压力 45MPa', model: 'DC-850', runtime: '3,100h', nextMaint: '2026-06-25', aiRisk: 28 },
  { key: '4', name: '精密压装机 #03', zone: '精密装配区', status: 'run', oee: 91, param: '压力 28.5kN · 位移 12.3mm', model: 'PR-280', runtime: '2,850h', aiRisk: 22 },
  { key: '5', name: '动平衡机 #01', zone: '精密装配区', status: 'maint', oee: 0, param: '精度校准中', model: 'DB-120', runtime: '1,920h', nextMaint: '进行中', aiRisk: 45 },
  { key: '6', name: '高压测试台 #02', zone: '高压测试区', status: 'run', oee: 85, param: '耐压 2500V · 绝缘 500MΩ', model: 'HV-2500', runtime: '5,600h', aiRisk: 18 },
  { key: '7', name: '老化测试柜 #05', zone: '高温老化区', status: 'run', oee: 78, param: '温度 85°C · 时长 4h', model: 'AG-480', runtime: '8,200h', nextMaint: '2026-07-01', aiRisk: 35 },
  { key: '8', name: 'EOL综合测试台', zone: '整机标定区', status: 'idle', oee: 45, param: '待机 · 等待上料', model: 'EOL-Pro', runtime: '3,400h', aiRisk: 8 },
  { key: '9', name: '六轴装配机器人 #02', zone: '精密装配区', status: 'run', oee: 93, param: '节拍 42s · 定位精度 ±0.02mm', model: 'KUKA-KR6', runtime: '6,100h', aiRisk: 12 },
  { key: '10', name: '老化测试柜 #06', zone: '高温老化区', status: 'run', oee: 76, param: '温度 85°C · 批次 3/5', model: 'AG-480', runtime: '7,800h', aiRisk: 38 },
  { key: '11', name: '匝间测试仪 #01', zone: '高压测试区', status: 'run', oee: 90, param: '测试电压 1500V · 合格', model: 'TT-1500', runtime: '2,200h', aiRisk: 10 },
  { key: '12', name: '气密性测试仪 #01', zone: '高压测试区', status: 'run', oee: 87, param: '泄漏量 0.8Pa · 合格', model: 'LM-200', runtime: '1,800h', aiRisk: 25 },
];

const MAINT_ORDERS = [
  { key: '1', id: 'MO-0613-01', equip: '高速绕线机#02', type: '故障维修', priority: '紧急', handler: '张维保', status: '处理中', deadline: '2026-06-13 18:00' },
  { key: '2', id: 'MO-0613-02', equip: '动平衡机#01', type: '精度校准', priority: '重要', handler: '李工', status: '进行中', deadline: '2026-06-13 16:00' },
  { key: '3', id: 'MO-0614-01', equip: '老化柜#05', type: '月度保养', priority: '一般', handler: '王维保', status: '待执行', deadline: '2026-06-14 08:00' },
  { key: '4', id: 'MO-0615-01', equip: '绕线机#01', type: '周保养', priority: '一般', handler: '赵工', status: '已计划', deadline: '2026-06-15 10:00' },
];

const ALERT_TRACKING = [
  { level: 'urgent', title: '绕线机#02断线故障', zone: '定子加工区', owner: '张维保', status: '处理中', deadline: '2h' },
  { level: 'important', title: '老化工序产能饱和', zone: '高温老化区', owner: '生产调度', status: '已派单', deadline: '4h' },
  { level: 'important', title: '气密性CPK下降趋势', zone: '高压测试区', owner: '质量工程师', status: '分析中', deadline: '8h' },
  { level: 'normal', title: '车间B区湿度偏高', zone: '精密装配区', owner: '环境管理', status: '已通知', deadline: '24h' },
];

const COCKPIT_ALERTS = [
  { level: 'urgent', text: '【紧急】高速绕线机#02 断线故障(E-2047)，定子工序停产，滞留WIP 45台，已推送维保组' },
  { level: 'important', text: '【重要】高温老化区产能负荷95%，未来48h预计积压18台在制品，建议插单调整' },
  { level: 'important', text: '【重要】气密性测试CPK=0.92低于1.33，AI预判批量泄漏风险，已推送质量工程师' },
  { level: 'normal', text: '【一般】精密装配区湿度62%接近上限(65%)，定子绕线工序建议开启除湿' },
];

const WORK_ORDERS: WorkOrder[] = [
  { key: '1', id: 'WO-2026-0613-001', model: '三合一电驱总成 ED-300', qty: 200, progress: 72, line: '总成一线', delivery: '2026-06-18', status: '生产中' },
  { key: '2', id: 'WO-2026-0613-002', model: '驱动电机 EM-180', qty: 500, progress: 45, line: '电机二线', delivery: '2026-06-20', status: '生产中' },
  { key: '3', id: 'WO-2026-0612-003', model: '电机控制器 ECU-V3.2', qty: 300, progress: 88, line: '电控产线', delivery: '2026-06-15', status: '生产中' },
  { key: '4', id: 'WO-2026-0611-004', model: '减速器 GR-120', qty: 150, progress: 100, line: '减速器线', delivery: '2026-06-14', status: '已完工' },
  { key: '5', id: 'WO-2026-0610-005', model: '三合一电驱总成 ED-280', qty: 80, progress: 15, line: '总成一线', delivery: '2026-06-25', status: '试制' },
];

const STATUS_LABEL: Record<EquipStatus, string> = {
  run: '运行', idle: '待机', fault: '故障', maint: '维保', stop: '停机',
};

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

const SCADAView = () => {
  const [tab, setTab] = useState('monitor');
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null);

  return (
    <div>
      <div className="edf-page-title"><MonitorOutlined style={{ color: '#0ea5e9', marginRight: 8 }} />智能设备运维 (SCADA+CMMS)</div>
      <div className="edf-page-desc">
        精密设备7×24实时监控 · 全生命周期电子台账 · 预防性智能维保 · AI故障预测 · OEE精细化分析
        <span className="edf-ai-tag"><RobotOutlined /> AI预测性维护</span>
      </div>
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
    </div>
  );
};

const EMSView = () => {
  const [emsTab, setEmsTab] = useState('realtime');
  const [emsNode, setEmsNode] = useState('plant');

  const treeNodes = [
    { key: 'plant', label: '全厂', kwh: '28,470', children: [
      { key: 'workshop-a', label: 'A车间(装配)', kwh: '12,800' },
      { key: 'workshop-b', label: 'B车间(测试老化)', kwh: '10,200' },
      { key: 'workshop-c', label: 'C车间(零部件)', kwh: '5,470' },
    ]},
  ];

  return (
    <div>
      <div className="edf-page-title"><ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 8 }} />EMS 精细化能耗管理</div>
      <div className="edf-page-desc">
        厂区/车间/产线/设备四级采集 · 单产品能耗精准核算 · 峰谷平分析 · 空转识别 · AI节能优化
        <span className="edf-ai-tag"><RobotOutlined /> AI节能</span>
      </div>

      <div className="edf-carbon-bar">
        <CloudOutlined style={{ fontSize: 24, color: '#10b981' }} />
        <div>
          <div style={{ fontWeight: 600 }}>今日碳排放估算：235.8 tCO₂</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>碳排放强度 8.2 kg/台 · 较上月下降 2.1%</div>
        </div>
      </div>

      <div className="edf-kpi-grid--6 edf-kpi-grid">
        {[
          { l: '今日用电', v: '28,470', u: 'kWh' },
          { l: '单台能耗', v: '18.6', u: 'kWh/台' },
          { l: '老化柜占比', v: '38%', u: '' },
          { l: '空转浪费', v: '4.2%', u: '' },
          { l: '压缩空气', v: '1,280', u: 'm³' },
          { l: '用水量', v: '42', u: 'm³' },
        ].map(k => (
          <div key={k.l} className="edf-kpi-card">
            <div className="edf-kpi-label">{k.l}</div>
            <div className="edf-kpi-value" style={{ fontSize: 22 }}>{k.v}<span style={{ fontSize: 12 }}>{k.u}</span></div>
          </div>
        ))}
      </div>

      <div className="edf-peak-valley">
        <div className="edf-peak-card edf-peak-card--peak"><div style={{ fontSize: 11, color: '#991b1b' }}>峰时段 (10-14点)</div><div style={{ fontSize: 20, fontWeight: 700 }}>9,820 kWh</div><div style={{ fontSize: 10, color: '#64748b' }}>占比 34.5%</div></div>
        <div className="edf-peak-card edf-peak-card--flat"><div style={{ fontSize: 11, color: '#0369a1' }}>平时段</div><div style={{ fontSize: 20, fontWeight: 700 }}>12,450 kWh</div><div style={{ fontSize: 10, color: '#64748b' }}>占比 43.7%</div></div>
        <div className="edf-peak-card edf-peak-card--valley"><div style={{ fontSize: 11, color: '#047857' }}>谷时段 (0-6点)</div><div style={{ fontSize: 20, fontWeight: 700 }}>6,200 kWh</div><div style={{ fontSize: 10, color: '#64748b' }}>占比 21.8%</div></div>
      </div>

      <Tabs activeKey={emsTab} onChange={setEmsTab} items={[
        {
          key: 'realtime', label: '实时监测',
          children: (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
              <div className="edf-ems-tree">
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#64748b' }}>能耗层级树</div>
                {treeNodes.map(n => (
                  <div key={n.key}>
                    <div className={`edf-ems-tree-node${emsNode === n.key ? ' edf-ems-tree-node--active' : ''}`} onClick={() => setEmsNode(n.key)}>
                      <span>{n.label}</span><span>{n.kwh} kWh</span>
                    </div>
                    {n.children?.map(c => (
                      <div key={c.key} className={`edf-ems-tree-node edf-ems-tree-child${emsNode === c.key ? ' edf-ems-tree-node--active' : ''}`} onClick={() => setEmsNode(c.key)}>
                        <span>{c.label}</span><span>{c.kwh}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="edf-chart-card" style={{ margin: 0 }}><div className="edf-chart-title">分时能耗分布 · 高能耗工序拆解</div><EnergyChart /></div>
            </div>
          ),
        },
        {
          key: 'product', label: '单产品核算',
          children: (
            <div className="edf-ems-product-grid">
              {[
                { m: '三合一电驱总成 ED-300', kwh: '22.4', aging: '8.5', test: '6.2' },
                { m: '驱动电机 EM-180', kwh: '15.8', aging: '5.2', test: '4.1' },
                { m: '电机控制器 ECU-V3.2', kwh: '8.6', aging: '2.8', test: '3.5' },
                { m: '减速器 GR-120', kwh: '12.2', aging: '0', test: '2.1' },
              ].map(p => (
                <div key={p.m} className="edf-ems-product-card">
                  <div className="edf-ems-product-name">{p.m}</div>
                  <div className="edf-ems-product-kwh">{p.kwh}<span className="edf-ems-product-unit"> kWh/台</span></div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>老化 {p.aging} · 测试 {p.test} kWh</div>
                </div>
              ))}
            </div>
          ),
        },
        {
          key: 'trend', label: '趋势分析',
          children: <div className="edf-chart-card"><div className="edf-chart-title">月度能耗趋势 · 单台能耗目标线</div><EnergyTrendChart /></div>,
        },
        {
          key: 'ai', label: 'AI节能优化',
          children: (
            <div>
              <Card title="AI 识别的能耗浪费场景" extra={<span className="edf-ai-tag"><RobotOutlined /> 智能分析</span>}>
                {[
                  { s: '老化柜空载运行', waste: '1,200 kWh/日', save: '12%', action: '合并3批次老化任务，批量启停' },
                  { s: '测试台高峰并行', waste: '680 kWh/日', save: '8%', action: '10-14点减少并行测试台至60%' },
                  { s: '绕线机#02故障待机供电', waste: '已切断', save: '—', action: '故障停机自动切断待机电源' },
                  { s: '压装机空转等待', waste: '320 kWh/日', save: '5%', action: '优化上料节拍，减少空转等待' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{item.s}</span>
                    <span style={{ color: '#ef4444' }}>{item.waste}</span>
                    <Tag color="green">{item.save}</Tag>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{item.action}</span>
                  </div>
                ))}
              </Card>
              <Card title="能耗异常预警" style={{ marginTop: 16 }}>
                <Table size="small" pagination={false} dataSource={[
                  { key: '1', target: '老化柜#05', type: '单设备能耗超标', value: '+18%', time: '14:32' },
                  { key: '2', target: 'B车间', type: '时段能耗突增', value: '+25%', time: '10:15' },
                  { key: '3', target: '测试台区域', type: '空转能耗过高', value: '4.2%', time: '09:00' },
                ]} columns={[
                  { title: '对象', dataIndex: 'target' },
                  { title: '异常类型', dataIndex: 'type' },
                  { title: '偏差', dataIndex: 'value', width: 80 },
                  { title: '时间', dataIndex: 'time', width: 70 },
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
                { name: '成本预估模型', desc: '单位制造成本趋势预测', acc: '88%', status: '训练中' },
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

// ==================== Navigation ====================

const NAV: { group: string; items: { key: NavKey; label: string; icon: React.ReactNode; badge?: number }[] }[] = [
  { group: '可视化', items: [{ key: 'cockpit', label: '数字孪生驾驶舱', icon: <DashboardOutlined /> }] },
  { group: '业务应用', items: [
    { key: 'aps', label: 'APS 智能排产', icon: <ScheduleOutlined /> },
    { key: 'mes', label: 'MES 生产执行', icon: <BuildOutlined /> },
    { key: 'qms', label: 'QMS 质量管理', icon: <SafetyCertificateOutlined /> },
    { key: 'wms', label: 'WMS 仓储物流', icon: <InboxOutlined /> },
    { key: 'scada', label: '智能设备运维', icon: <MonitorOutlined /> },
    { key: 'ems', label: 'EMS 能耗管理', icon: <ThunderboltOutlined /> },
  ]},
  { group: '平台底座', items: [{ key: 'data', label: '数据中台', icon: <DatabaseOutlined /> }] },
];

const PAGE_TITLES: Record<NavKey, string> = {
  cockpit: '数字孪生驾驶舱', aps: 'APS 智能排产', mes: 'MES 生产执行',
  qms: 'QMS 质量管理', wms: 'WMS 仓储物流', scada: '智能设备运维 (SCADA+CMMS)',
  ems: 'EMS 精细化能耗管理', data: '数据中台与智能分析',
};

// ==================== Main ====================

const Component: React.FC = () => {
  const [nav, setNav] = useState<NavKey>('cockpit');

  const content = () => {
    switch (nav) {
      case 'cockpit': return <CockpitView />;
      case 'aps': return <APSView />;
      case 'mes': return <MESView />;
      case 'qms': return <QMSView />;
      case 'wms': return <WMSView />;
      case 'scada': return <SCADAView />;
      case 'ems': return <EMSView />;
      case 'data': return <DataPlatformView />;
      default: return <CockpitView />;
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#0ea5e9', borderRadius: 8 } }}>
      <div className="ed-factory-platform">
        <aside className="edf-sidebar">
          <div className="edf-sidebar-brand">
            <div className="edf-sidebar-logo">SMF</div>
            <div className="edf-sidebar-title">电驱智能工厂<br />管理平台</div>
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
                <Input prefix={<SearchOutlined />} placeholder="搜索工单、设备、产品码..." style={{ width: 260 }} />
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
