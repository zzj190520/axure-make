/**
 * 产线数字管理平台 —— 可配置数据文件
 *
 * 修改此文件中的数据后，重新构建项目即可生效：
 *   $env:ENTRY_KEY="prototypes/ed-smart-factory-platform"; npx vite build
 */

import type { Equipment, LineStation, ZoneDetail, WorkOrder } from './index';
import React from 'react';
import { Tag } from 'antd';

// ==================== 驾驶舱 / 产线概览 ====================

export const ZONE_DETAILS: ZoneDetail[] = [
  { id: 'stator', name: '定子加工区', devices: 8, output: 126, wip: 45, ftt: 99.5, status: 'fault', env: { temp: 24.2, humidity: 52 }, equipList: ['绕线机#01', '绕线机#02', '叠压机#01'] },
  { id: 'rotor', name: '转子压铸区', devices: 6, output: 118, wip: 38, ftt: 99.2, status: 'run', env: { temp: 26.8, humidity: 48 }, equipList: ['铸铝设备#01', '打磨机#02'] },
  { id: 'core', name: '铁芯叠压区', devices: 4, output: 132, wip: 22, ftt: 99.6, status: 'run', env: { temp: 23.5, humidity: 50 }, equipList: ['叠压机#02', '焊接机#01'] },
  { id: 'assembly', name: '精密装配区', devices: 12, output: 98, wip: 62, ftt: 98.8, status: 'run', env: { temp: 23.0, humidity: 55 }, equipList: ['压装机#03', '机器人#02', '动平衡机#01'] },
  { id: 'hvtest', name: '高压测试区', devices: 6, output: 105, wip: 28, ftt: 99.8, status: 'warn', env: { temp: 22.5, humidity: 45 }, equipList: ['高压测试台#02', '绝缘测试仪#01'] },
  { id: 'aging', name: '高温老化区', devices: 10, output: 86, wip: 86, ftt: 99.0, status: 'warn', env: { temp: 28.5, humidity: 42 }, equipList: ['老化柜#05', '老化柜#06', '老化柜#07'] },
  { id: 'calib', name: '整机标定区', devices: 5, output: 92, wip: 22, ftt: 99.6, status: 'run', env: { temp: 23.8, humidity: 50 }, equipList: ['EOL测试台', '标定台#01'] },
  { id: 'warehouse', name: '成品仓储区', devices: 3, output: 210, wip: 0, ftt: 100, status: 'run', env: { temp: 22.0, humidity: 48 }, equipList: ['AGV通道', '堆垛机#01'] },
];

export const ZONES = ZONE_DETAILS;

export const EQUIPMENTS: Equipment[] = [
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

export const MAINT_ORDERS = [
  { key: '1', id: 'MO-0613-01', equip: '高速绕线机#02', type: '故障维修', priority: '紧急', handler: '张维保', status: '处理中', deadline: '2026-06-13 18:00' },
  { key: '2', id: 'MO-0613-02', equip: '动平衡机#01', type: '精度校准', priority: '重要', handler: '李工', status: '进行中', deadline: '2026-06-13 16:00' },
  { key: '3', id: 'MO-0614-01', equip: '老化柜#05', type: '月度保养', priority: '一般', handler: '王维保', status: '待执行', deadline: '2026-06-14 08:00' },
  { key: '4', id: 'MO-0615-01', equip: '绕线机#01', type: '周保养', priority: '一般', handler: '赵工', status: '已计划', deadline: '2026-06-15 10:00' },
];

export const ALERT_TRACKING = [
  { level: 'urgent', title: '绕线机#02断线故障', zone: '定子加工区', owner: '张维保', status: '处理中', deadline: '2h' },
  { level: 'important', title: '老化工序产能饱和', zone: '高温老化区', owner: '生产调度', status: '已派单', deadline: '4h' },
  { level: 'important', title: '气密性CPK下降趋势', zone: '高压测试区', owner: '质量工程师', status: '分析中', deadline: '8h' },
  { level: 'normal', title: '车间B区湿度偏高', zone: '精密装配区', owner: '环境管理', status: '已通知', deadline: '24h' },
];

export const COCKPIT_ALERTS = [
  { level: 'urgent', text: '【紧急】高速绕线机#02 断线故障(E-2047)，定子工序停产，滞留WIP 45台，已推送维保组' },
  { level: 'important', text: '【重要】高温老化区产能负荷95%，未来48h预计积压18台在制品，建议插单调整' },
  { level: 'important', text: '【重要】气密性测试CPK=0.92低于1.33，AI预判批量泄漏风险，已推送质量工程师' },
  { level: 'normal', text: '【一般】精密装配区湿度62%接近上限(65%)，定子绕线工序建议开启除湿' },
];

export const WORK_ORDERS: WorkOrder[] = [
  { key: '1', id: 'WO-2026-0613-001', model: '三合一电驱总成 ED-300', qty: 200, progress: 72, line: '总成一线', delivery: '2026-06-18', status: '生产中' },
  { key: '2', id: 'WO-2026-0613-002', model: '驱动电机 EM-180', qty: 500, progress: 45, line: '电机二线', delivery: '2026-06-20', status: '生产中' },
  { key: '3', id: 'WO-2026-0612-003', model: '电机控制器 ECU-V3.2', qty: 300, progress: 88, line: '电控产线', delivery: '2026-06-15', status: '生产中' },
  { key: '4', id: 'WO-2026-0611-004', model: '减速器 GR-120', qty: 150, progress: 100, line: '减速器线', delivery: '2026-06-14', status: '已完工' },
  { key: '5', id: 'WO-2026-0610-005', model: '三合一电驱总成 ED-280', qty: 80, progress: 15, line: '总成一线', delivery: '2026-06-25', status: '试制' },
];

export const STATUS_LABEL: Record<string, string> = {
  run: '运行', idle: '待机', fault: '故障', maint: '维保', stop: '停机',
};

// ==================== 数字孪生产线 ====================

export const LINE_STATIONS: LineStation[] = [
  { key: '1', id: 'PRE-01', name: '预处理区', zone: '三合一电驱产线', cycleTime: 45, shiftOutput: 126, ftt: 99.5, wip: 8, downtimeMin: 12, downtimeCount: 2, downtimeRatio: 2.5, equipment: ['清洗机#01', '烘干机#01'] },
  { key: '2', id: 'RED-ASM-01', name: '减速器装配工位', zone: '三合一电驱产线', cycleTime: 180, shiftOutput: 98, ftt: 98.8, wip: 12, downtimeMin: 28, downtimeCount: 1, downtimeRatio: 5.8, equipment: ['压装机#01', '机器人#01', '扭矩枪#03'] },
  { key: '3', id: 'MOT-ASM-01', name: '电机装配工位', zone: '三合一电驱产线', cycleTime: 0, shiftOutput: 0, ftt: 0, wip: 15, downtimeMin: 180, downtimeCount: 5, downtimeRatio: 37.5, equipment: ['压装机#02', '机器人#02', '动平衡机#01'] },
  { key: '4', id: 'MCU-WIRE-01', name: 'MCU 线束工位', zone: '三合一电驱产线', cycleTime: 120, shiftOutput: 115, ftt: 99.2, wip: 10, downtimeMin: 8, downtimeCount: 1, downtimeRatio: 1.7, equipment: ['焊接机#01', '测试仪#01'] },
  { key: '5', id: 'SEAL-TEST-01', name: '气密/耐压检测工位', zone: '三合一电驱产线', cycleTime: 90, shiftOutput: 120, ftt: 99.6, wip: 6, downtimeMin: 0, downtimeCount: 0, downtimeRatio: 0, equipment: ['气密测试仪#01', '高压测试台#01'] },
  { key: '6', id: 'BENCH-TEST-01', name: '台架测试工位', zone: '三合一电驱产线', cycleTime: 300, shiftOutput: 92, ftt: 99.8, wip: 18, downtimeMin: 15, downtimeCount: 1, downtimeRatio: 3.1, equipment: ['EOL测试台#01', '标定台#01'] },
  { key: '7', id: 'REPAIR-01', name: '返修区', zone: '三合一电驱产线', cycleTime: 600, shiftOutput: 8, ftt: 95.0, wip: 5, downtimeMin: 0, downtimeCount: 0, downtimeRatio: 0, equipment: ['返修工作台#01', '检测仪器#01'] },
  { key: '8', id: 'PACK-01', name: '包装工位', zone: '三合一电驱产线', cycleTime: 60, shiftOutput: 125, ftt: 100, wip: 0, downtimeMin: 5, downtimeCount: 1, downtimeRatio: 1.0, equipment: ['包装机#01', '贴标机#01'] },
];

export const lineOptions = [
  { value: '三合一电驱产线', label: '三合一电驱产线' },
  { value: '电机定子产线', label: '电机定子产线' },
  { value: '电机转子产线', label: '电机转子产线' },
  { value: '减速器总成产线', label: '减速器总成产线' },
  { value: 'MCU控制器产线', label: 'MCU控制器产线' },
];

export const lineKpis = [
  { label: '实际节拍', value: '312', unit: 's', cls: 'edf-cockpit-kpi-value--warn' },
  { label: '标准节拍', value: '300', unit: 's', cls: '' },
  { label: 'OEE', value: '85.2', unit: '%', cls: '' },
  { label: 'FTT', value: '98.9', unit: '%', cls: 'edf-cockpit-kpi-value--good' },
  { label: '累计排产计划', value: '1,248', unit: '台', cls: '' },
  { label: '累计报交入库', value: '1,186', unit: '台', cls: '' },
  { label: '计划达产率', value: '95.0', unit: '%', cls: 'edf-cockpit-kpi-value--good' },
  { label: '累计达产率', value: '92.8', unit: '%', cls: '' },
];

export const keyStationIds = ['RED-ASM-01', 'MOT-ASM-01', 'SEAL-TEST-01', 'BENCH-TEST-01'];

// ==================== 设备状态分析 ====================

export const deviceList = [
  { key: '1', code: 'ERR0001', name: '下壳体与定子装配设备', status: '运行', oee: 90, runTime: '19时03分', faultTime: '19时03分', idleTime: '19时03分', offTime: '19时03分', runPct: 60, faultPct: 20, idlePct: 10, offPct: 10 },
  { key: '2', code: 'ERR0002', name: '三相端子装配设备', status: '故障', oee: 60, runTime: '19时03分', faultTime: '19时03分', idleTime: '19时03分', offTime: '19时03分', runPct: 60, faultPct: 20, idlePct: 10, offPct: 10 },
  { key: '3', code: 'ERR0003', name: '三相端子螺栓拧紧设备', status: '空闲', oee: 80, runTime: '19时03分', faultTime: '19时03分', idleTime: '19时03分', offTime: '19时03分', runPct: 60, faultPct: 20, idlePct: 10, offPct: 10 },
  { key: '4', code: 'ERR0004', name: '电机绝缘耐压测试设备', status: '停机', oee: 70, runTime: '19时03分', faultTime: '19时03分', idleTime: '19时03分', offTime: '19时03分', runPct: 60, faultPct: 20, idlePct: 10, offPct: 10 },
];

export const statusColors = { run: '#22c55e', fault: '#ef4444', idle: '#eab308', off: '#94a3b8' };

export const faultDetailData = [
  { key: '1', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '2', stationNo: 'OP2010', stationName: '喷油环压装', status: '停机', dataType: '工艺调整', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '3', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '零部件不良', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '4', stationNo: 'OP2010', stationName: '喷油环压装', status: '停机', dataType: '物料短缺', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '5', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '6', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '7', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '8', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '9', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '10', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '11', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
  { key: '12', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', dataType: '设备故障', startTime: '2026/03/05 09:12:23', endTime: '2026/03/05 09:18:25', duration: 6, phenomenon: '设备不动作', reason: '生产-保养不当' },
];

export const alarmDetailData = [
  { key: '1', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX4.7：伺服X1轴网络节点故障', alarmCount: 12, alarmDuration: 560 },
  { key: '2', stationNo: 'OP2010', stationName: '喷油环压装', status: '停机', alarmContent: 'DB1005.DBX127.1 - TT01返修岔道进料停止器在上位传感器故障', alarmCount: 12, alarmDuration: 560 },
  { key: '3', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX2.7：HMI急停触发', alarmCount: 12, alarmDuration: 560 },
  { key: '4', stationNo: 'OP2010', stationName: '喷油环压装', status: '停机', alarmContent: 'DB1005.DBX4.4-网络节点73 加热机网络故障', alarmCount: 12, alarmDuration: 560 },
  { key: '5', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX103.5 - 取油封夹爪松开传感器信号丢失故障', alarmCount: 12, alarmDuration: 560 },
  { key: '6', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX2.7 - HMI操作箱急停触发', alarmCount: 12, alarmDuration: 560 },
  { key: '7', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX12.6 - RFID1 - FB功能块读写头错误', alarmCount: 12, alarmDuration: 560 },
  { key: '8', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX2.7 - I10.7HMI1操作盒急停触发', alarmCount: 12, alarmDuration: 560 },
  { key: '9', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX122.3 - B1012_2-I602.2-提升机2进托盘间隙检测超时', alarmCount: 12, alarmDuration: 560 },
  { key: '10', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX3.2 - I51.3主气阀气压故障', alarmCount: 12, alarmDuration: 560 },
  { key: '11', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX94.6 - B2023_6-I54.6/I53.6插销气缸1/2气缸伸出传感器信号丢失故障', alarmCount: 12, alarmDuration: 560 },
  { key: '12', stationNo: 'OP2010', stationName: '喷油环压装', status: '故障', alarmContent: 'DB1005.DBX100.5 -I57.4 壳体压紧气缸缩回传感器信号丢失故障', alarmCount: 12, alarmDuration: 560 },
];

// ==================== EMS 能耗管理 ====================

export const treeNodes = [
  { key: 'plant', label: '全厂', kwh: '28,470', water: '42', air: '1,280', children: [
    { key: 'workshop-a', label: '电驱一线', kwh: '8,200', water: '15', air: '420' },
    { key: 'workshop-b', label: '电驱二线', kwh: '6,800', water: '12', air: '380' },
    { key: 'workshop-c', label: '电驱三线', kwh: '7,200', water: '10', air: '350' },
    { key: 'workshop-d', label: '测试老化区', kwh: '6,270', water: '5', air: '130' },
  ]},
];

export const envData = [
  { zone: '精密装配区', temp: 23.0, humidity: 55, cleanliness: 'ISO 7', pm25: 35, status: 'normal' },
  { zone: '绝缘测试区', temp: 22.5, humidity: 48, cleanliness: 'ISO 8', pm25: 42, status: 'normal' },
  { zone: '高温老化区', temp: 125, humidity: 38, cleanliness: '-', pm25: '-', status: 'warning' },
  { zone: '定子绕线区', temp: 24.2, humidity: 52, cleanliness: '-', pm25: 68, status: 'warning' },
  { zone: '转子压铸区', temp: 26.8, humidity: 48, cleanliness: '-', pm25: 95, status: 'normal' },
  { zone: '仓储区', temp: 22.0, humidity: 50, cleanliness: '-', pm25: 28, status: 'normal' },
];

export const envAlerts = [
  { level: 'warning', zone: '高温老化区', param: '温度', value: '125°C', threshold: '80-150°C', time: '14:32' },
  { level: 'warning', zone: '定子绕线区', param: '粉尘浓度', value: '68μg/m³', threshold: '<75μg/m³', time: '13:15' },
];

export const topEnergyDevices = [
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

export const savingSuggestions = [
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

export const emsKpis = [
  { l: '单位产品能耗', v: '18.6', u: 'kWh/台', trend: '-3.2%' },
  { l: '能耗成本占比', v: '7.2', u: '%', trend: '-0.5%' },
  { l: '谷电占比', v: '35.8', u: '%', trend: '+2.1%' },
  { l: '设备空载率', v: '4.2', u: '%', trend: '-0.8%' },
  { l: '环境达标率', v: '99.6', u: '%', trend: '+0.1%' },
  { l: '节能目标完成率', v: '68', u: '%', trend: '' },
];

// ==================== SCADA / 设备运维 ====================

export const scadaKpis = [
  { l: '全厂 OEE', v: '83.5%', c: '#10b981', f: '目标 85%' },
  { l: '运行/总数', v: '42/48', c: '', f: '' },
  { l: '故障设备', v: '1', c: '#ef4444', f: '绕线机#02' },
  { l: '维保中', v: '2', c: '#f59e0b', f: '' },
  { l: '非计划停机', v: '2.3h', c: '#ef4444', f: '今日累计' },
  { l: 'AI高风险', v: '3', c: '#8b5cf6', f: '台设备' },
];

export const statusLegend = [
  { c: '#22c55e', l: '运行' },
  { c: '#94a3b8', l: '待机' },
  { c: '#ef4444', l: '故障' },
  { c: '#f59e0b', l: '维保' },
  { c: '#475569', l: '停机' },
];

export const maintTimeline = [
  { t: '绕线机#01 周保养', d: '2026-06-15', s: '已计划' },
  { t: '动平衡机#01 精度校准', d: '2026-06-13', s: '进行中' },
  { t: '老化柜#05 月度保养', d: '2026-06-14', s: '待执行' },
  { t: '高压测试台 季度检定', d: '2026-06-20', s: '已计划' },
  { t: '绕线机#02 故障维修', d: '2026-06-13', s: '逾期风险' },
];

export const aiPredictions = [
  { e: '高速绕线机#02', risk: 92, cause: '导轮磨损导致断线', action: '更换导轮组件 + 校准张力', cases: '历史3起相似故障' },
  { e: '老化测试柜#06', risk: 68, cause: '温控传感器漂移', action: '提前校准温控系统', cases: '历史2起' },
  { e: '气密性测试仪#01', risk: 55, cause: '密封件老化泄漏', action: '更换密封件', cases: '历史1起' },
];

// ==================== 图表数据 ====================

export const oeeChartData = {
  xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  series: [
    { name: '时间稼动率', data: [92, 88, 90, 85, 91, 87, 89] },
    { name: '性能达成率', data: [95, 93, 94, 92, 96, 93, 95] },
    { name: '良品率', data: [98, 97, 99, 96, 98, 97, 98] },
    { name: 'OEE', data: [86, 80, 84, 75, 86, 79, 83] },
  ],
};

export const energyChartData = {
  xAxis: ['00', '04', '08', '12', '16', '20'],
  series: [
    { name: '老化柜', data: [120, 80, 200, 280, 260, 180] },
    { name: '测试台', data: [60, 40, 100, 140, 130, 90] },
    { name: '压装机', data: [40, 30, 80, 100, 90, 60] },
    { name: '绕线机', data: [50, 35, 90, 110, 100, 70] },
    { name: '其他', data: [30, 25, 50, 60, 55, 40] },
  ],
};

export const qualityTrendData = {
  xAxis: ['6/7', '6/8', '6/9', '6/10', '6/11', '6/12', '6/13'],
  series: [
    { name: 'FTT', data: [99.2, 99.0, 99.4, 98.8, 99.1, 99.3, 99.2] },
    { name: '高压测试合格率', data: [99.8, 99.6, 99.9, 99.5, 99.7, 99.8, 99.6] },
    { name: '气密性合格率', data: [98.5, 98.2, 98.8, 97.9, 98.4, 98.6, 98.3] },
  ],
};

export const defectPieData = [
  { value: 35, name: '高压绝缘' },
  { value: 28, name: '气密泄漏' },
  { value: 18, name: '压装偏差' },
  { value: 12, name: '绕线瑕疵' },
  { value: 7, name: '其他' },
];

export const energyTrendData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '总能耗', data: [820, 780, 850, 790, 810, 760] },
    { name: '单台能耗', data: [20.2, 19.8, 19.5, 19.2, 18.9, 18.6] },
    { name: '目标', data: [19, 19, 19, 19, 19, 19] },
  ],
};

export const downtimePieData = [
  { value: 42, name: '故障停机' },
  { value: 28, name: '换型停机' },
  { value: 18, name: '待料停机' },
  { value: 12, name: '维保停机' },
];

export const dataFlowData = {
  xAxis: ['00', '04', '08', '12', '16', '20', '24'],
  data: [1200, 800, 2800, 3200, 2900, 2400, 1500],
};

export const oeeWaterfallData = [
  { l: '时间稼动率', v: 89, c: '#0ea5e9' },
  { l: '性能达成率', v: 95, c: '#10b981' },
  { l: '良品率', v: 98, c: '#8b5cf6' },
  { l: 'OEE', v: 83, c: '#f59e0b' },
];

// ==================== 产线日常数据 ====================

export const opsColumns = [{ title: '日期', dataIndex: 'date' }, { title: '班次', dataIndex: 'shift' }, { title: '计划产量', dataIndex: 'plan' }, { title: '实际产量', dataIndex: 'actual' }, { title: '良品数', dataIndex: 'good' }, { title: '达成率', dataIndex: 'rate', render: (v: number) => `${v}%` }];
export const opsData = [
  { key: '1', date: '2026-06-13', shift: '白班', plan: 1200, actual: 1150, good: 1120, rate: 95.8 },
  { key: '2', date: '2026-06-13', shift: '夜班', plan: 1200, actual: 1180, good: 1160, rate: 98.3 },
  { key: '3', date: '2026-06-14', shift: '白班', plan: 1200, actual: 1190, good: 1175, rate: 99.2 },
  { key: '4', date: '2026-06-14', shift: '夜班', plan: 1200, actual: 1100, good: 1080, rate: 91.7 },
  { key: '5', date: '2026-06-15', shift: '白班', plan: 1200, actual: 1210, good: 1195, rate: 100.8 },
];

export const oeeTrendData = {
  xAxis: ['06-01(白班)', '06-01(夜班)', '06-02(白班)', '06-02(夜班)', '06-03(白班)', '06-03(夜班)', '06-04(白班)', '06-04(夜班)'],
  series: [
    { name: '按EOL站统计OEE', data: [84.12, 99.12, 81.75, 94.56, 85.62, 91.4, 84.74, 67.37], color: '#0ea5e9', lineStyle: { width: 2 } },
    { name: '按下线站统计OEE', data: [83.92, 95.61, 82.38, 92.63, 84.57, 91.93, 83.15, 67.36], color: '#10b981', lineStyle: { width: 2 } },
    { name: 'OEE目标', data: [81.3, 81.3, 81.3, 81.3, 81.3, 81.3, 81.3, 81.3], color: '#f97316', lineStyle: { type: 'dashed', width: 2 } },
  ],
};

const oeeShifts = ['d0601d', 'd0601n', 'd0602d', 'd0602n', 'd0603d', 'd0603n', 'd0604d', 'd0604n'];
const oeeShiftLabels = ['06-01(白班)', '06-01(夜班)', '06-02(白班)', '06-02(夜班)', '06-03(白班)', '06-03(夜班)', '06-04(白班)', '06-04(夜班)'];

export const oeeDetailColumns = [
  { title: '类别', dataIndex: 'category', width: 110, fixed: 'left' },
  { title: '数据名称', dataIndex: 'name', width: 140, fixed: 'left' },
  { title: '数据名称类型', dataIndex: 'type', width: 140, fixed: 'left' },
  ...oeeShifts.map((k, i) => ({ title: oeeShiftLabels[i], dataIndex: k, width: 95, align: 'center' })),
];

export const oeeDetailData = [
  // 基础数据 (18行)
  { key: '1', category: '基础数据', categoryRowSpan: 18, name: '总投入时间/min', nameRowSpan: 1, type: '总投入时间/min', d0601d: 720, d0601n: 720, d0602d: 720, d0602n: 720, d0603d: 720, d0603n: 720, d0604d: 720, d0604n: 720 },
  { key: '2', category: '基础数据', categoryRowSpan: 0, name: '计划停机时间(MES)', nameRowSpan: 5, type: '首点检(MES)/min', d0601d: 30, d0601n: 30, d0602d: 30, d0602n: 30, d0603d: 30, d0603n: 30, d0604d: 30, d0604n: 30 },
  { key: '3', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '产线休息(MES)/min', d0601d: 120, d0601n: 120, d0602d: 60, d0602n: 120, d0603d: 120, d0603n: 120, d0604d: 120, d0604n: 120 },
  { key: '4', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '计划维修(MES)/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '5', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '换型调试(MES)/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '6', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '其他(MES)/min', d0601d: 60, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '7', category: '基础数据', categoryRowSpan: 0, name: '负荷时间/min', nameRowSpan: 1, type: '负荷时间/min', d0601d: 510, d0601n: 570, d0602d: 630, d0602n: 570, d0603d: 570, d0603n: 570, d0604d: 570, d0604n: 570 },
  { key: '8', category: '基础数据', categoryRowSpan: 0, name: '非计划停机时间', nameRowSpan: 7, type: '设备故障/min', d0601d: 38, d0601n: 6, d0602d: 96, d0602n: 16, d0603d: 32, d0603n: 22, d0604d: 36, d0604n: 19 },
  { key: '9', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '工艺调整/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '10', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '零部件不良/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 9, d0603n: 0, d0604d: 33, d0604n: 37 },
  { key: '11', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '质量异常/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '12', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '物料短缺/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '13', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '研发项目/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 0, d0604n: 0 },
  { key: '14', category: '基础数据', categoryRowSpan: 0, name: '', nameRowSpan: 0, type: '其他/min', d0601d: 0, d0601n: 0, d0602d: 0, d0602n: 0, d0603d: 0, d0603n: 0, d0604d: 10, d0604n: 0 },
  { key: '15', category: '基础数据', categoryRowSpan: 0, name: '稼动时间/min', nameRowSpan: 1, type: '稼动时间/min', d0601d: 472, d0601n: 564, d0602d: 534, d0602n: 554, d0603d: 529, d0603n: 548, d0604d: 491, d0604n: 514 },
  { key: '16', category: '基础数据', categoryRowSpan: 0, name: '时间稼动率', nameRowSpan: 1, type: '时间稼动率', d0601d: '92.55', d0601n: '98.95', d0602d: '84.76', d0602n: '97.19', d0603d: '92.81', d0603n: '96.14', d0604d: '86.14', d0604n: '90.18' },
  { key: '17', category: '基础数据', categoryRowSpan: 0, name: '理论节拍(s/台)', nameRowSpan: 1, type: '理论节拍(s/台)', d0601d: 60, d0601n: 60, d0602d: 60, d0602n: 60, d0603d: 60, d0603n: 60, d0604d: 60, d0604n: 60 },
  { key: '18', category: '基础数据', categoryRowSpan: 0, name: '目标OEE', nameRowSpan: 1, type: '目标OEE', d0601d: '81.3', d0601n: '81.3', d0602d: '81.3', d0602n: '81.3', d0603d: '81.3', d0603n: '81.3', d0604d: '81.3', d0604n: '81.3' },
  // 按EOL站计算 (5行)
  { key: '19', category: '按EOL站计算', categoryRowSpan: 5, name: '总产出量(EOL)', nameRowSpan: 1, type: '总产出量(EOL)', d0601d: 441, d0601n: 570, d0602d: 520, d0602n: 547, d0603d: 491, d0603n: 527, d0604d: 487, d0604n: 387 },
  { key: '20', category: '按EOL站计算', categoryRowSpan: 0, name: '性能稼动率(EOL)', nameRowSpan: 1, type: '性能稼动率(EOL)', d0601d: '93.43', d0601n: '101.06', d0602d: '97.38', d0602n: '98.74', d0603d: '92.82', d0603n: '96.17', d0604d: '99.19', d0604n: '75.29' },
  { key: '21', category: '按EOL站计算', categoryRowSpan: 0, name: '良品数量(EOL)', nameRowSpan: 1, type: '良品数量(EOL)', d0601d: 429, d0601n: 565, d0602d: 515, d0602n: 539, d0603d: 488, d0603n: 521, d0604d: 483, d0604n: 384 },
  { key: '22', category: '按EOL站计算', categoryRowSpan: 0, name: '良品率(EOL)', nameRowSpan: 1, type: '良品率(EOL)', d0601d: '97.28', d0601n: '99.12', d0602d: '99.04', d0602n: '98.54', d0603d: '99.39', d0603n: '98.86', d0604d: '99.18', d0604n: '99.22' },
  { key: '23', category: '按EOL站计算', categoryRowSpan: 0, name: '实际OEE(EOL)', nameRowSpan: 1, type: '实际OEE(EOL)', d0601d: '84.12', d0601n: '99.12', d0602d: '81.75', d0602n: '94.56', d0603d: '85.62', d0603n: '91.4', d0604d: '84.74', d0604n: '67.37' },
  // 按下线站计算 (5行)
  { key: '24', category: '按下线站计算', categoryRowSpan: 5, name: '总产出量(下线)', nameRowSpan: 1, type: '总产出量(下线)', d0601d: 449, d0601n: 556, d0602d: 536, d0602n: 540, d0603d: 491, d0603n: 528, d0604d: 484, d0604n: 348 },
  { key: '25', category: '按下线站计算', categoryRowSpan: 0, name: '性能稼动率(下线)', nameRowSpan: 1, type: '性能稼动率(下线)', d0601d: '95.13', d0601n: '98.58', d0602d: '100.37', d0602n: '97.47', d0603d: '92.82', d0603n: '96.35', d0604d: '98.57', d0604n: '67.7' },
  { key: '26', category: '按下线站计算', categoryRowSpan: 0, name: '良品数量(下线)', nameRowSpan: 1, type: '良品数量(下线)', d0601d: 428, d0601n: 545, d0602d: 519, d0602n: 528, d0603d: 482, d0603n: 524, d0604d: 474, d0604n: 384 },
  { key: '27', category: '按下线站计算', categoryRowSpan: 0, name: '良品率(下线)', nameRowSpan: 1, type: '良品率(下线)', d0601d: '95.32', d0601n: '98.02', d0602d: '96.83', d0602n: '97.78', d0603d: '98.17', d0603n: '99.24', d0604d: '97.93', d0604n: '110.34' },
  { key: '28', category: '按下线站计算', categoryRowSpan: 0, name: '实际OEE(下线)', nameRowSpan: 1, type: '实际OEE(下线)', d0601d: '83.92', d0601n: '95.61', d0602d: '82.38', d0602n: '92.63', d0603d: '84.57', d0603n: '91.93', d0604d: '83.15', d0604n: '67.36' },
];

export const fttColumns = [{ title: '日期', dataIndex: 'date' }, { title: '工序', dataIndex: 'process' }, { title: '投入数', dataIndex: 'input' }, { title: '一次合格数', dataIndex: 'pass' }, { title: 'FTT率', dataIndex: 'ftt', render: (v: number) => `${v}%` }, { title: '返工数', dataIndex: 'rework' }];
export const fttData = [
  { key: '1', date: '2026-06-13', process: '定子装配', input: 500, pass: 485, ftt: 97.0, rework: 10 },
  { key: '2', date: '2026-06-13', process: '转子装配', input: 500, pass: 490, ftt: 98.0, rework: 5 },
  { key: '3', date: '2026-06-14', process: '定子装配', input: 520, pass: 500, ftt: 96.2, rework: 15 },
  { key: '4', date: '2026-06-14', process: '转子装配', input: 520, pass: 512, ftt: 98.5, rework: 6 },
  { key: '5', date: '2026-06-15', process: '定子装配', input: 510, pass: 502, ftt: 98.4, rework: 5 },
];

export const yieldColumns = [{ title: '日期', dataIndex: 'date' }, { title: '产线', dataIndex: 'line' }, { title: '计划产能', dataIndex: 'plan' }, { title: '实际产能', dataIndex: 'actual' }, { title: '达产率', dataIndex: 'rate', render: (v: number) => `${v}%` }];
export const yieldData = [
  { key: '1', date: '2026-06-13', line: '三合一电驱产线', plan: 2400, actual: 2330, rate: 97.1 },
  { key: '2', date: '2026-06-14', line: '三合一电驱产线', plan: 2400, actual: 2290, rate: 95.4 },
  { key: '3', date: '2026-06-15', line: '三合一电驱产线', plan: 2400, actual: 2420, rate: 100.8 },
  { key: '4', date: '2026-06-13', line: '电机定子产线', plan: 1200, actual: 1150, rate: 95.8 },
  { key: '5', date: '2026-06-14', line: '电机定子产线', plan: 1200, actual: 1180, rate: 98.3 },
];

export const taktColumns = [{ title: '日期', dataIndex: 'date' }, { title: '工序', dataIndex: 'process' }, { title: '计划节拍(s)', dataIndex: 'planTakt' }, { title: '实际节拍(s)', dataIndex: 'actualTakt' }, { title: '节拍达成率', dataIndex: 'rate', render: (v: number) => `${v}%` }];
export const taktData = [
  { key: '1', date: '2026-06-13', process: '壳体装配', planTakt: 120, actualTakt: 118, rate: 98.3 },
  { key: '2', date: '2026-06-13', process: '定子压装', planTakt: 90, actualTakt: 92, rate: 97.8 },
  { key: '3', date: '2026-06-14', process: '壳体装配', planTakt: 120, actualTakt: 125, rate: 95.8 },
  { key: '4', date: '2026-06-14', process: '定子压装', planTakt: 90, actualTakt: 88, rate: 97.8 },
  { key: '5', date: '2026-06-15', process: '壳体装配', planTakt: 120, actualTakt: 115, rate: 95.8 },
];

export const energyColumns = [{ title: '日期', dataIndex: 'date' }, { title: '电耗(kWh)', dataIndex: 'electric' }, { title: '气耗(m³)', dataIndex: 'gas' }, { title: '水耗(m³)', dataIndex: 'water' }, { title: '综合能耗', dataIndex: 'total' }, { title: '单位能耗', dataIndex: 'unit' }];
export const energyData = [
  { key: '1', date: '2026-06-13', electric: 8520, gas: 320, water: 45, total: 8885, unit: 3.70 },
  { key: '2', date: '2026-06-14', electric: 8100, gas: 300, water: 42, total: 8442, unit: 3.52 },
  { key: '3', date: '2026-06-15', electric: 8650, gas: 335, water: 48, total: 9033, unit: 3.77 },
  { key: '4', date: '2026-06-16', electric: 8400, gas: 310, water: 44, total: 8754, unit: 3.65 },
  { key: '5', date: '2026-06-17', electric: 8300, gas: 305, water: 43, total: 8648, unit: 3.60 },
];

export const abnormalOverviewColumns = [{ title: '异常类型', dataIndex: 'type' }, { title: '发生次数', dataIndex: 'count' }, { title: '累计时长(min)', dataIndex: 'duration' }, { title: '占比', dataIndex: 'pct', render: (v: number) => `${v}%` }];
export const abnormalOverviewData = [
  { key: '1', type: '设备故障', count: 12, duration: 180, pct: 35.3 },
  { key: '2', type: '物料短缺', count: 8, duration: 120, pct: 23.5 },
  { key: '3', type: '工艺调整', count: 6, duration: 90, pct: 17.6 },
  { key: '4', type: '质量异常', count: 5, duration: 60, pct: 11.8 },
  { key: '5', type: '计划停机', count: 4, duration: 40, pct: 7.8 },
];

export const abnormalListColumns = [{ title: '序号', dataIndex: 'key', width: 60 }, { title: '工位', dataIndex: 'station' }, { title: '异常类型', dataIndex: 'type' }, { title: '异常描述', dataIndex: 'desc' }, { title: '开始时间', dataIndex: 'start' }, { title: '结束时间', dataIndex: 'end' }, { title: '时长(min)', dataIndex: 'duration' }];
export const abnormalListData = [
  { key: '1', station: 'OP2010', type: '设备故障', desc: '伺服报警', start: '2026/06/13 08:30', end: '2026/06/13 09:00', duration: 30 },
  { key: '2', station: 'OP2020', type: '物料短缺', desc: '物料未到位', start: '2026/06/13 10:15', end: '2026/06/13 10:45', duration: 30 },
  { key: '3', station: 'OP2030', type: '工艺调整', desc: '参数优化', start: '2026/06/13 13:00', end: '2026/06/13 13:30', duration: 30 },
  { key: '4', station: 'OP2010', type: '设备故障', desc: '传感器故障', start: '2026/06/14 09:10', end: '2026/06/14 09:40', duration: 30 },
  { key: '5', station: 'OP2040', type: '质量异常', desc: '尺寸超差', start: '2026/06/14 14:00', end: '2026/06/14 14:20', duration: 20 },
];

export const faultStatColumns = [{ title: '设备', dataIndex: 'equip' }, { title: '故障次数', dataIndex: 'count' }, { title: '故障时长(min)', dataIndex: 'duration' }, { title: '平均修复时间(min)', dataIndex: 'mttr' }];
export const faultStatData = [
  { key: '1', equip: '装配设备#01', count: 5, duration: 75, mttr: 15 },
  { key: '2', equip: '测试设备#02', count: 3, duration: 45, mttr: 15 },
  { key: '3', equip: '压装设备#03', count: 2, duration: 30, mttr: 15 },
  { key: '4', equip: '拧紧设备#04', count: 2, duration: 20, mttr: 10 },
  { key: '5', equip: '检测设备#05', count: 1, duration: 10, mttr: 10 },
];

export const mttrMtbfColumns = [{ title: '设备', dataIndex: 'equip' }, { title: '故障率(%)', dataIndex: 'faultRate', render: (v: number) => `${v}%` }, { title: 'MTTR(min)', dataIndex: 'mttr' }, { title: 'MTBF(h)', dataIndex: 'mtbf' }, { title: '可用度(%)', dataIndex: 'availability', render: (v: number) => `${v}%` }];
export const mttrMtbfData = [
  { key: '1', equip: '装配设备#01', faultRate: 2.1, mttr: 15, mtbf: 720, availability: 98.5 },
  { key: '2', equip: '测试设备#02', faultRate: 1.5, mttr: 15, mtbf: 960, availability: 99.0 },
  { key: '3', equip: '压装设备#03', faultRate: 1.2, mttr: 15, mtbf: 1200, availability: 99.2 },
  { key: '4', equip: '拧紧设备#04', faultRate: 0.8, mttr: 10, mtbf: 1440, availability: 99.5 },
  { key: '5', equip: '检测设备#05', faultRate: 0.5, mttr: 10, mtbf: 1920, availability: 99.7 },
];

export const faultCategoryColumns = [{ title: '故障分类', dataIndex: 'category' }, { title: '发生次数', dataIndex: 'count' }, { title: '占比', dataIndex: 'pct', render: (v: number) => `${v}%` }];
export const faultCategoryData = [
  { key: '1', category: '电气故障', count: 15, pct: 37.5 },
  { key: '2', category: '机械故障', count: 10, pct: 25.0 },
  { key: '3', category: '传感器故障', count: 8, pct: 20.0 },
  { key: '4', category: '软件异常', count: 5, pct: 12.5 },
  { key: '5', category: '其他', count: 2, pct: 5.0 },
];

export const topFaultColumns = [{ title: '排名', dataIndex: 'rank', width: 60 }, { title: '故障代码', dataIndex: 'code' }, { title: '故障描述', dataIndex: 'desc' }, { title: '发生次数', dataIndex: 'count' }, { title: '累计时长(min)', dataIndex: 'duration' }];
export const topFaultData = [
  { key: '1', rank: 1, code: 'ERR001', desc: '伺服驱动器过载', count: 8, duration: 120 },
  { key: '2', rank: 2, code: 'ERR002', desc: '温度传感器异常', count: 6, duration: 90 },
  { key: '3', rank: 3, code: 'ERR003', desc: '气路压力不足', count: 5, duration: 75 },
  { key: '4', rank: 4, code: 'ERR004', desc: '编码器信号丢失', count: 4, duration: 60 },
  { key: '5', rank: 5, code: 'ERR005', desc: '通讯超时', count: 3, duration: 45 },
];

export const faultCollectColumns = [{ title: '采集点', dataIndex: 'point' }, { title: '当前值', dataIndex: 'value' }, { title: '阈值', dataIndex: 'threshold' }, { title: '状态', dataIndex: 'status', render: (v: string) => React.createElement('span', { style: { color: v === '正常' ? '#52c41a' : '#ff4d4f' } }, v) }, { title: '采集时间', dataIndex: 'time' }];
export const faultCollectData = [
  { key: '1', point: '主轴温度', value: '68°C', threshold: '80°C', status: '正常', time: '2026/06/15 10:00:00' },
  { key: '2', point: '伺服电流', value: '12.5A', threshold: '15A', status: '正常', time: '2026/06/15 10:00:00' },
  { key: '3', point: '气路压力', value: '0.45MPa', threshold: '0.5MPa', status: '异常', time: '2026/06/15 10:00:00' },
  { key: '4', point: '振动幅度', value: '2.1mm/s', threshold: '3mm/s', status: '正常', time: '2026/06/15 10:00:00' },
  { key: '5', point: '油压压力', value: '3.2MPa', threshold: '3.5MPa', status: '正常', time: '2026/06/15 10:00:00' },
];

export const processMaintColumns = [{ title: '工序号', dataIndex: 'code' }, { title: '工序名称', dataIndex: 'name' }, { title: '所属产线', dataIndex: 'line' }, { title: '状态', dataIndex: 'status', render: (v: string) => React.createElement('span', { style: { color: v === '启用' ? '#52c41a' : '#d9d9d9' } }, v) }, { title: '更新时间', dataIndex: 'updateTime' }];
export const processMaintData = [
  { key: '1', code: 'OP10', name: '壳体上料', line: '三合一电驱产线', status: '启用', updateTime: '2026-06-01 08:00' },
  { key: '2', code: 'OP20', name: '定子装配', line: '三合一电驱产线', status: '启用', updateTime: '2026-06-01 08:00' },
  { key: '3', code: 'OP30', name: '转子压装', line: '三合一电驱产线', status: '启用', updateTime: '2026-06-01 08:00' },
  { key: '4', code: 'OP40', name: '端子焊接', line: '三合一电驱产线', status: '启用', updateTime: '2026-06-01 08:00' },
  { key: '5', code: 'OP50', name: '性能测试', line: '三合一电驱产线', status: '启用', updateTime: '2026-06-01 08:00' },
];