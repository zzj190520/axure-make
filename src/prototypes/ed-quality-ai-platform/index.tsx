/**
 * @name 电驱全链路质量管理平台
 *
 * 电驱行业专属 AI 驱动质量问题全生命周期管理平台，
 * 统一承载研发/生产/市场三域问题闭环，集成 AI 智能问答、根因推理、风险预警、知识库与智能报告。
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
  ConfigProvider, Input, Button, Tag, Table, Drawer, Select, Space,
  Badge, Tabs, Card, Typography, Progress, Tooltip,
} from 'antd';
import {
  DashboardOutlined, RobotOutlined, ExperimentOutlined, ToolOutlined,
  CarOutlined, FileTextOutlined, BookOutlined, AlertOutlined,
  BarChartOutlined, SearchOutlined, BellOutlined, UserOutlined,
  ThunderboltOutlined, RiseOutlined, FallOutlined, BulbOutlined,
  SafetyCertificateOutlined, ClusterOutlined, CheckCircleOutlined,
  ClockCircleOutlined, WarningOutlined, SyncOutlined, PlusOutlined,
  SendOutlined, ApiOutlined, FundProjectionScreenOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title, Paragraph } = Typography;

// ==================== Types ====================

type NavKey = 'dashboard' | 'ai-chat' | 'rd' | 'prod' | 'market' | 'tickets' | 'knowledge' | 'alerts' | 'reports';

interface Ticket {
  key: string;
  id: string;
  title: string;
  domain: '研发' | '生产' | '市场';
  level: 'S1' | 'S2' | 'S3' | 'S4';
  status: string;
  handler: string;
  createTime: string;
  faultCode?: string;
  rootCause?: string;
  aiConfidence?: number;
  step8d: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

// ==================== Mock Data ====================

const TICKETS: Ticket[] = [
  { key: '1', id: 'EDQ-2026-0312', title: 'C11电控软件V2.3台架耐久失效', domain: '研发', level: 'S2', status: '整改中', handler: '张工', createTime: '2026-06-10', step8d: 4, rootCause: '软件热管理策略参数裕度不足', aiConfidence: 87 },
  { key: '2', id: 'EDQ-2026-0315', title: '电驱三线OP30扭矩异常NG', domain: '生产', level: 'S3', status: '分析中', handler: '李工', createTime: '2026-06-12', step8d: 2, rootCause: '拧紧枪参数漂移', aiConfidence: 72 },
  { key: '3', id: 'EDQ-2026-0318', title: '零跑C11冬季低温动力中断', domain: '市场', level: 'S1', status: '验证中', handler: '王工', createTime: '2026-06-11', faultCode: 'P0A80', step8d: 5, rootCause: '电池低温保护阈值与电驱匹配异常', aiConfidence: 91 },
  { key: '4', id: 'EDQ-2026-0320', title: '返修件二次故障-轴承批次B-2047', domain: '生产', level: 'S2', status: '待判定', handler: '赵工', createTime: '2026-06-13', step8d: 1, rootCause: '供应商批次一致性偏差', aiConfidence: 68 },
  { key: '5', id: 'EDQ-2026-0322', title: '定子绕组绝缘设计裕度不足', domain: '研发', level: 'S3', status: '已闭环', handler: '孙工', createTime: '2026-06-05', step8d: 8, rootCause: '绝缘材料选型未覆盖高温工况', aiConfidence: 95 },
  { key: '6', id: 'EDQ-2026-0325', title: '故障码P0A80区域性批量报码', domain: '市场', level: 'S1', status: '分析中', handler: '周工', createTime: '2026-06-13', faultCode: 'P0A80', step8d: 3, rootCause: 'IGBT驱动板焊点虚焊', aiConfidence: 78 },
  { key: '7', id: 'EDQ-2026-0328', title: '减速器异响-齿轮啮合间隙超差', domain: '市场', level: 'S2', status: '整改中', handler: '吴工', createTime: '2026-06-08', step8d: 4 },
  { key: '8', id: 'EDQ-2026-0330', title: 'EOL视觉检测NG-漏装密封圈', domain: '生产', level: 'S4', status: '已闭环', handler: '郑工', createTime: '2026-06-01', step8d: 8 },
];

const RD_TICKETS = TICKETS.filter(t => t.domain === '研发');
const PROD_TICKETS = TICKETS.filter(t => t.domain === '生产');
const MARKET_TICKETS = TICKETS.filter(t => t.domain === '市场');

const ALERTS = [
  { id: 1, level: 'high', title: 'P0A80故障码聚类预警', desc: '近7天市场域上报6起相似故障，AI识别为潜在批量风险，涉及华东区域C11车型', count: 6 },
  { id: 2, level: 'high', title: '返修复现预警', desc: '轴承批次B-2047历史曾造成批量不良，当前再次出现返修件二次故障', count: 3 },
  { id: 3, level: 'medium', title: '季节性预警-冬季低温', desc: '根据历史数据，未来2周低温故障高发概率78%，建议提前检查热管理策略', count: 0 },
  { id: 4, level: 'low', title: '产线FTT波动预警', desc: '电驱三线FTT近3天下降0.8%，AI判断为质量退化趋势而非正常波动', count: 0 },
];

const KNOWLEDGE_CATEGORIES = [
  { key: 'motor', title: '电机类故障库', count: 128, icon: <ThunderboltOutlined />, color: '#1677ff', bg: '#e6f4ff' },
  { key: 'ecu', title: '电控软件故障库', count: 96, icon: <ApiOutlined />, color: '#722ed1', bg: '#f9f0ff' },
  { key: 'gear', title: '减速器机械故障库', count: 74, icon: <ToolOutlined />, color: '#13c2c2', bg: '#e6fffb' },
  { key: 'process', title: '产线工艺不良库', count: 156, icon: <ClusterOutlined />, color: '#52c41a', bg: '#f6ffed' },
  { key: 'faultcode', title: '市场故障码方案库', count: 203, icon: <CarOutlined />, color: '#fa8c16', bg: '#fff7e6' },
];

const QUICK_QUESTIONS = [
  '零跑C11电驱常见异响问题有哪些？',
  '电控报P0A80故障码的历史根因和最优解决方案',
  '近3个月产线返修率最高的TOP5问题',
  '冬季低温市场高发故障及整改措施',
];

const AI_RESPONSES: Record<string, string> = {
  '零跑C11电驱常见异响问题有哪些？': '根据知识库检索，零跑C11电驱常见异响问题共匹配到 **12条** 历史闭环案例：\n\n1. **减速器齿轮啮合异响**（6起）- 根因：齿轮间隙超差，建议检查OP70装配工艺\n2. **电机轴承异响**（3起）- 根因：轴承润滑不足或批次不良\n3. **壳体共振异响**（2起）- 根因：紧固扭矩不足导致壳体松动\n4. **逆变器电磁噪声**（1起）- 根因：PWM频率与壳体共振\n\n最优方案参考工单 EDQ-2025-1180（已闭环，验证通过）。',
  '电控报P0A80故障码的历史根因和最优解决方案': '**故障码 P0A80** 历史共 **18条** 闭环记录，AI根因推理 TOP3：\n\n1. **IGBT驱动板焊点虚焊**（概率 42%）- 佐证：EDQ-2026-0325、EDQ-2025-0920\n2. **电池低温保护阈值匹配异常**（概率 31%）- 佐证：EDQ-2026-0318\n3. **CAN通讯丢帧导致误报**（概率 15%）\n\n**推荐排查顺序**：① 检查IGBT驱动板焊点 → ② 读取低温工况日志 → ③ CAN总线波形\n\n**临时遏制**：切换备用驱动策略V2.4.1\n**长期根治**：优化回流焊工艺 + 升级热管理标定参数',
  '近3个月产线返修率最高的TOP5问题': '**近3个月产线返修率 TOP5**（AI自动统计）：\n\n| 排名 | 问题 | 返修率 | 主要产线 |\n|------|------|--------|----------|\n| 1 | 轴承批次一致性不良 | 2.3% | 电驱二线 |\n| 2 | OP30扭矩异常 | 1.8% | 电驱三线 |\n| 3 | 密封圈漏装 | 1.2% | 电驱一线 |\n| 4 | 视觉检测误判 | 0.9% | 电控产线 |\n| 5 | 返修件二次故障 | 0.7% | 多产线 |\n\n建议优先关注轴承来料检验和OP30拧紧枪校准。',
  '冬季低温市场高发故障及整改措施': '**冬季低温高发故障预警**（AI基于5年历史数据分析）：\n\n高发故障类型：\n- 动力中断（占比38%）\n- 电池低温保护误触发（占比27%）\n- 润滑脂低温失效异响（占比18%）\n\n已验证整改措施：\n1. 升级热管理策略参数（覆盖-30°C工况）\n2. 更换低温型润滑脂（型号 LG-220LT）\n3. 优化电池SOC低温保护阈值\n\n当前预防状态：已推送至研发/售后团队，执行率 85%。',
};

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月'];
const genTrend = (base: number, v: number) => MONTH_LABELS.map(() => +(base + (Math.random() - 0.5) * v).toFixed(1));

// ==================== Helpers ====================

const domainTag = (d: string) => {
  const map: Record<string, string> = { '研发': 'edq-domain-tag--rd', '生产': 'edq-domain-tag--prod', '市场': 'edq-domain-tag--market' };
  return <Tag className={map[d]}>{d}</Tag>;
};

const levelTag = (l: string) => {
  const colors: Record<string, string> = { S1: 'red', S2: 'orange', S3: 'gold', S4: 'blue' };
  return <Tag color={colors[l]}>{l}</Tag>;
};

const statusTag = (s: string) => {
  const colors: Record<string, string> = {
    '待判定': 'default', '分析中': 'processing', '整改中': 'warning',
    '验证中': 'cyan', '已闭环': 'success',
  };
  return <Tag color={colors[s] || 'default'}>{s}</Tag>;
};

// ==================== Chart ====================

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

const TrendChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['研发', '生产', '市场'], top: 0 },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: MONTH_LABELS },
    yAxis: { type: 'value', name: '问题数' },
    series: [
      { name: '研发', type: 'bar', stack: 'total', data: [12, 15, 10, 18, 14, 16], itemStyle: { color: '#1677ff' } },
      { name: '生产', type: 'bar', stack: 'total', data: [28, 32, 25, 30, 35, 38], itemStyle: { color: '#52c41a' } },
      { name: '市场', type: 'bar', stack: 'total', data: [8, 10, 12, 15, 18, 22], itemStyle: { color: '#fa8c16' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 280, width: '100%' }} />;
};

const CloseRateChart = () => {
  const ref = useChart(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['闭环率', '逾期率'], top: 0 },
    grid: { top: 36, left: 12, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: MONTH_LABELS },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: '闭环率', type: 'line', data: genTrend(88, 6), smooth: true, itemStyle: { color: '#52c41a' } },
      { name: '逾期率', type: 'line', data: genTrend(8, 4), smooth: true, itemStyle: { color: '#ff4d4f' } },
    ],
  }), []);
  return <div ref={ref} style={{ height: 280, width: '100%' }} />;
};

// ==================== Ticket Table ====================

const ticketColumns: ColumnsType<Ticket> = [
  { title: '工单编号', dataIndex: 'id', width: 140 },
  { title: '问题描述', dataIndex: 'title', ellipsis: true },
  { title: '域', dataIndex: 'domain', width: 70, render: domainTag },
  { title: '等级', dataIndex: 'level', width: 60, render: levelTag },
  { title: '状态', dataIndex: 'status', width: 90, render: statusTag },
  { title: '处理人', dataIndex: 'handler', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', width: 110 },
];

// ==================== Views ====================

const DashboardView = ({ onNav }: { onNav: (k: NavKey) => void }) => (
  <div>
    <div className="edq-page-title">工作台</div>
    <div className="edq-page-desc">研产市问题全链路概览 · AI 实时风险监控</div>

    <div className="edq-kpi-grid">
      <div className="edq-kpi-card">
        <div className="edq-kpi-label">本月问题总量</div>
        <div className="edq-kpi-value">76</div>
        <div className="edq-kpi-footer"><RiseOutlined className="edq-kpi-trend--up" /> 较上月 +12%</div>
      </div>
      <div className="edq-kpi-card">
        <div className="edq-kpi-label">闭环率</div>
        <div className="edq-kpi-value" style={{ color: '#52c41a' }}>89.5%</div>
        <div className="edq-kpi-footer"><RiseOutlined className="edq-kpi-trend--up" /> 目标 85%</div>
      </div>
      <div className="edq-kpi-card">
        <div className="edq-kpi-label">逾期工单</div>
        <div className="edq-kpi-value" style={{ color: '#ff4d4f' }}>5</div>
        <div className="edq-kpi-footer"><FallOutlined className="edq-kpi-trend--down" /> 需督办</div>
      </div>
      <div className="edq-kpi-card edq-kpi-card--ai">
        <div className="edq-kpi-label"><RobotOutlined /> AI 风险预警</div>
        <div className="edq-kpi-value" style={{ color: '#7c3aed' }}>4</div>
        <div className="edq-kpi-footer" style={{ cursor: 'pointer', color: '#6366f1' }} onClick={() => onNav('alerts')}>查看详情 →</div>
      </div>
    </div>

    <div className="edq-two-col">
      <div className="edq-chart-card">
        <div className="edq-chart-title">三域问题趋势</div>
        <TrendChart />
      </div>
      <div className="edq-chart-card">
        <div className="edq-chart-title">闭环率 / 逾期率趋势</div>
        <CloseRateChart />
      </div>
    </div>

    <div className="edq-chart-title" style={{ marginBottom: 12 }}>
      <AlertOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
      AI 风险预警摘要
    </div>
    <div className="edq-alert-grid">
      {ALERTS.slice(0, 2).map(a => (
        <div key={a.id} className={`edq-alert-card edq-alert-card--${a.level}`} onClick={() => onNav('alerts')}>
          <div className="edq-alert-title">
            <WarningOutlined />
            {a.title}
            {a.count > 0 && <Tag color="red">{a.count}起</Tag>}
          </div>
          <div className="edq-alert-desc">{a.desc}</div>
        </div>
      ))}
    </div>

    <div className="edq-chart-title" style={{ marginBottom: 12 }}>近期工单动态</div>
    <div className="edq-activity-list">
      {TICKETS.slice(0, 5).map(t => (
        <div key={t.key} className="edq-activity-item">
          <div className="edq-activity-dot" style={{ background: t.domain === '研发' ? '#1677ff' : t.domain === '生产' ? '#52c41a' : '#fa8c16' }} />
          <div className="edq-activity-content">
            <div className="edq-activity-title">{t.id} · {t.title}</div>
            <div className="edq-activity-meta">{t.domain} · {t.level} · {t.status} · {t.handler} · {t.createTime}</div>
          </div>
          {statusTag(t.status)}
        </div>
      ))}
    </div>
  </div>
);

const AIChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: '您好！我是电驱质量 AI 助手，支持自然语言查询历史工单、故障码方案、根因分析和整改措施。请直接提问，或点击下方快捷问题。' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTimeout(() => {
      const reply = AI_RESPONSES[text] || `已为您检索到 **8条** 相关历史记录。根据 AI 语义匹配，最相似工单为 EDQ-2026-0318（相似度 92%）。\n\n**AI 根因推理 TOP1**：设计/工艺参数匹配异常（置信度 78%）\n\n如需查看完整案例详情，请前往工单管理。`;
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    }, 800);
  };

  return (
    <div>
      <div className="edq-page-title"><RobotOutlined style={{ color: '#7c3aed', marginRight: 8 }} />AI 智能问答</div>
      <div className="edq-page-desc">自然语言全局检索 · 权限可控 · 模糊场景匹配历史最优闭环案例</div>

      <div className="edq-chat-container">
        <div className="edq-chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`edq-chat-bubble edq-chat-bubble--${m.role}`}>
              {m.role === 'ai' && <div style={{ fontSize: 11, color: '#6366f1', marginBottom: 6 }}><RobotOutlined /> AI 助手</div>}
              <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }} />
            </div>
          ))}
        </div>
        <div className="edq-chat-input-area">
          <div className="edq-quick-chips">
            {QUICK_QUESTIONS.map(q => (
              <span key={q} className="edq-quick-chip" onClick={() => sendMessage(q)}>{q}</span>
            ))}
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder="输入自然语言问题，如：电控报P0A80故障码的历史根因..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={() => sendMessage(input)}
            />
            <Button type="primary" size="large" className="edq-ai-btn" icon={<SendOutlined />} onClick={() => sendMessage(input)}>发送</Button>
          </Space.Compact>
        </div>
      </div>
    </div>
  );
};

const DomainIssueView = ({ domain, data, icon }: { domain: string; data: Ticket[]; icon: React.ReactNode }) => {
  const [selected, setSelected] = useState<Ticket | null>(null);
  return (
    <div>
      <div className="edq-page-title">{icon} {domain}问题管理</div>
      <div className="edq-page-desc">
        {domain === '研发' && '设计缺陷、试验失效、软件BUG、BOM版本关联追溯'}
        {domain === '生产' && '产线NG、返修复现、设备漂移、跨天滞留不良'}
        {domain === '市场' && 'VIN故障码、异响客诉、批量故障、三包返修'}
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: '全部等级' }, { value: 'S1', label: 'S1' }, { value: 'S2', label: 'S2' }, { value: 'S3', label: 'S3' }]} />
          <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: '全部状态' }, { value: 'open', label: '处理中' }, { value: 'closed', label: '已闭环' }]} />
          <Input placeholder="搜索问题描述/编号" prefix={<SearchOutlined />} style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />}>新建问题</Button>
        </Space>
      </Card>
      <Table
        columns={ticketColumns}
        dataSource={data}
        pagination={{ pageSize: 8 }}
        onRow={record => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
      />
      <Drawer title={selected?.id} open={!!selected} onClose={() => setSelected(null)} width={520}>
        {selected && (
          <div>
            <Title level={5}>{selected.title}</Title>
            <Space style={{ marginBottom: 16 }}>{domainTag(selected.domain)}{levelTag(selected.level)}{statusTag(selected.status)}</Space>
            <div className="edq-8d-steps">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`edq-8d-step ${i < selected.step8d ? 'edq-8d-step--done' : i === selected.step8d ? 'edq-8d-step--active' : 'edq-8d-step--pending'}`} />
              ))}
            </div>
            <Text type="secondary">8D 进度：D{selected.step8d}/D8</Text>
            {selected.rootCause && (
              <div className="edq-ai-panel">
                <div className="edq-ai-panel-title"><BulbOutlined /> AI 根因推理</div>
                <div className="edq-ai-panel-item"><strong>TOP1 根因：</strong>{selected.rootCause}</div>
                <div className="edq-ai-panel-item"><strong>置信度：</strong>{selected.aiConfidence}%</div>
                <div className="edq-root-cause-bar"><div className="edq-root-cause-bar-fill" style={{ width: `${selected.aiConfidence}%` }} /></div>
              </div>
            )}
            <div className="edq-ai-panel" style={{ marginTop: 12 }}>
              <div className="edq-ai-panel-title"><RobotOutlined /> AI 工单总结</div>
              <div className="edq-ai-panel-item"><strong>问题简述：</strong>{selected.title}</div>
              <div className="edq-ai-panel-item"><strong>发生场景：</strong>{selected.domain}域 · {selected.createTime}</div>
              <div className="edq-ai-panel-item"><strong>历史同类：</strong>匹配到 5 条相似闭环案例</div>
              <div className="edq-ai-panel-item"><strong>遗留风险：</strong>{selected.status === '已闭环' ? '无' : '整改验证中，需关注复发'}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

const TicketManagementView = () => {
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [statusTab, setStatusTab] = useState('all');
  const filtered = statusTab === 'all' ? TICKETS : TICKETS.filter(t => t.status === statusTab);

  return (
    <div>
      <div className="edq-page-title"><FileTextOutlined /> 工单管理</div>
      <div className="edq-page-desc">统一工单台账 · 8D 闭环流程 · AI 辅助定级与总结</div>
      <Tabs
        activeKey={statusTab}
        onChange={setStatusTab}
        items={[
          { key: 'all', label: `全部 (${TICKETS.length})` },
          { key: '待判定', label: '待判定' },
          { key: '分析中', label: '分析中' },
          { key: '整改中', label: '整改中' },
          { key: '验证中', label: '验证中' },
          { key: '已闭环', label: '已闭环' },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={[...ticketColumns, {
          title: '8D进度', dataIndex: 'step8d', width: 100,
          render: (v: number) => <Progress percent={Math.round(v / 8 * 100)} size="small" />,
        }]}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        onRow={record => ({ onClick: () => setSelected(record), style: { cursor: 'pointer' } })}
      />
      <Drawer title={`工单详情 · ${selected?.id}`} open={!!selected} onClose={() => setSelected(null)} width={560}>
        {selected && (
          <div>
            <Title level={5}>{selected.title}</Title>
            <Space style={{ marginBottom: 16 }}>{domainTag(selected.domain)}{levelTag(selected.level)}{statusTag(selected.status)}</Space>
            <Card size="small" title="基本信息" style={{ marginBottom: 12 }}>
              <p>处理人：{selected.handler}</p>
              <p>创建时间：{selected.createTime}</p>
              {selected.faultCode && <p>故障码：{selected.faultCode}</p>}
            </Card>
            <Card size="small" title="8D 闭环进度">
              <div className="edq-8d-steps">
                {['D1团队', 'D2描述', 'D3遏制', 'D4根因', 'D5对策', 'D6验证', 'D7预防', 'D8结案'].map((s, i) => (
                  <Tooltip key={s} title={s}>
                    <div className={`edq-8d-step ${i < selected.step8d ? 'edq-8d-step--done' : i === selected.step8d ? 'edq-8d-step--active' : 'edq-8d-step--pending'}`} />
                  </Tooltip>
                ))}
              </div>
            </Card>
            {selected.rootCause && (
              <div className="edq-ai-panel">
                <div className="edq-ai-panel-title"><BulbOutlined /> AI 五维根因推理</div>
                <div className="edq-root-cause-list">
                  {[
                    { dim: '设计维度', cause: selected.rootCause, pct: selected.aiConfidence || 70 },
                    { dim: '工艺维度', cause: '装配工艺参数偏差', pct: 45 },
                    { dim: '物料维度', cause: '零部件批次一致性', pct: 32 },
                  ].map((r, i) => (
                    <div key={i} className="edq-root-cause-item">
                      <span className="edq-root-cause-rank">{i + 1}</span>
                      <strong>{r.dim}：</strong>{r.cause}
                      <div className="edq-root-cause-bar"><div className="edq-root-cause-bar-fill" style={{ width: `${r.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button type="primary" className="edq-ai-btn" icon={<RobotOutlined />} style={{ marginTop: 16 }}>AI 一键生成 8D 初稿</Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

const KnowledgeBaseView = () => (
  <div>
    <div className="edq-page-title"><BookOutlined style={{ color: '#7c3aed' }} /> AI 知识库</div>
    <div className="edq-page-desc">工单闭环自动沉淀 · 结构化分类 · 支持 AI 问答培训</div>
    <div className="edq-kb-grid">
      {KNOWLEDGE_CATEGORIES.map(kb => (
        <div key={kb.key} className="edq-kb-card">
          <div className="edq-kb-icon" style={{ background: kb.bg, color: kb.color }}>{kb.icon}</div>
          <div className="edq-kb-title">{kb.title}</div>
          <div className="edq-kb-count">{kb.count} 条知识 · AI 自动提炼</div>
        </div>
      ))}
    </div>
    <Card title="最近沉淀知识">
      <Table
        size="small"
        pagination={false}
        columns={[
          { title: '知识标题', dataIndex: 'title' },
          { title: '分类', dataIndex: 'cat', width: 120 },
          { title: '来源工单', dataIndex: 'source', width: 140 },
          { title: '更新时间', dataIndex: 'time', width: 110 },
        ]}
        dataSource={[
          { key: '1', title: 'P0A80故障码-IGBT驱动板焊点虚焊排查SOP', cat: '故障码方案库', source: 'EDQ-2026-0325', time: '2026-06-13' },
          { key: '2', title: '低温工况热管理策略参数标定指南', cat: '电控软件故障库', source: 'EDQ-2026-0318', time: '2026-06-12' },
          { key: '3', title: 'OP30拧紧枪校准与扭矩异常处理', cat: '产线工艺不良库', source: 'EDQ-2026-0315', time: '2026-06-12' },
          { key: '4', title: '减速器齿轮啮合间隙检测标准', cat: '减速器机械故障库', source: 'EDQ-2026-0328', time: '2026-06-10' },
        ]}
      />
    </Card>
  </div>
);

const RiskAlertView = () => (
  <div>
    <div className="edq-page-title"><AlertOutlined style={{ color: '#ff4d4f' }} /> AI 风险预警</div>
    <div className="edq-page-desc">同类聚类 · 复发识别 · 季节性预判 · 产线指标异常检测</div>
    <div className="edq-alert-grid">
      {ALERTS.map(a => (
        <div key={a.id} className={`edq-alert-card edq-alert-card--${a.level}`}>
          <div className="edq-alert-title">
            <WarningOutlined />
            {a.title}
            {a.count > 0 && <Tag color="red">{a.count}起关联</Tag>}
            <Tag color={a.level === 'high' ? 'red' : a.level === 'medium' ? 'orange' : 'blue'}>
              {a.level === 'high' ? '高风险' : a.level === 'medium' ? '中风险' : '低风险'}
            </Tag>
          </div>
          <div className="edq-alert-desc">{a.desc}</div>
          <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }}>查看聚类分析 →</Button>
        </div>
      ))}
    </div>
    <Card title="AI 聚类分析详情" style={{ marginTop: 20 }}>
      <Paragraph>
        <Text strong>P0A80 故障码聚类</Text> — AI 识别 6 起零散上报为同一根因簇（IGBT驱动板焊点虚焊），
        相似度 89%。历史同类问题 EDQ-2025-0920 曾造成区域批量投诉，建议立即启动遏制措施。
      </Paragraph>
      <Space>
        <Button type="primary" danger>启动应急响应</Button>
        <Button>查看关联工单</Button>
        <Button className="edq-ai-btn">AI 生成遏制方案</Button>
      </Space>
    </Card>
  </div>
);

const AIReportView = () => {
  const [reportType, setReportType] = useState('weekly');
  return (
    <div>
      <div className="edq-page-title"><BarChartOutlined style={{ color: '#7c3aed' }} /> AI 智能报告</div>
      <div className="edq-page-desc">日/周/月质量 AI 报告 · 单工单总结 · S2/S3 复盘 8D 初稿</div>
      <Space style={{ marginBottom: 20 }}>
        <Select value={reportType} onChange={setReportType} style={{ width: 160 }} options={[
          { value: 'daily', label: '日报' }, { value: 'weekly', label: '周报' }, { value: 'monthly', label: '月报' },
        ]} />
        <Button className="edq-ai-btn" icon={<RobotOutlined />}>AI 重新生成</Button>
        <Button icon={<FileTextOutlined />}>导出 PDF</Button>
      </Space>
      <div className="edq-report-preview">
        <Title level={4}>电驱质量 {reportType === 'daily' ? '日' : reportType === 'weekly' ? '周' : '月'}报 · AI 自动生成</Title>
        <Text type="secondary">生成时间：2026-06-13 18:00 · 数据范围：2026-06-07 ~ 2026-06-13</Text>

        <div className="edq-report-section">
          <h3>一、问题总量概览</h3>
          <p>本周研产市问题共 <strong>23起</strong>，已闭环 <strong>18起</strong>（闭环率 78.3%），逾期 <strong>2起</strong>。其中市场域问题环比增长 35%，需重点关注。</p>
        </div>
        <div className="edq-report-section">
          <h3>二、新增高发问题 TOP5</h3>
          <p>1. P0A80故障码批量报码（市场·S1）<br />2. OP30扭矩异常NG（生产·S3）<br />3. 返修件二次故障（生产·S2）<br />4. 电控软件耐久失效（研发·S2）<br />5. 减速器异响（市场·S2）</p>
        </div>
        <div className="edq-report-section">
          <h3>三、复发问题清单</h3>
          <p>轴承批次B-2047相关问题本月复发 <strong>3起</strong>，AI 提示历史曾造成批量不良，建议升级至 S1 并启动供应商审核。</p>
        </div>
        <div className="edq-report-section">
          <h3>四、AI 智能改善建议</h3>
          <p>1. 针对 P0A80 聚类风险，建议 48 小时内完成 IGBT 驱动板焊点专项排查<br />2. 电驱三线 OP30 拧紧枪建议本周内完成校准<br />3. 低温工况热管理参数升级方案建议加速验证</p>
        </div>
      </div>
    </div>
  );
};

// ==================== Navigation Config ====================

const NAV_ITEMS: { group: string; items: { key: NavKey; label: string; icon: React.ReactNode; ai?: boolean; badge?: number }[] }[] = [
  { group: '概览', items: [{ key: 'dashboard', label: '工作台', icon: <DashboardOutlined /> }] },
  { group: 'AI 智能', items: [
    { key: 'ai-chat', label: 'AI 智能问答', icon: <RobotOutlined />, ai: true },
    { key: 'knowledge', label: 'AI 知识库', icon: <BookOutlined />, ai: true },
    { key: 'alerts', label: 'AI 风险预警', icon: <AlertOutlined />, ai: true, badge: 4 },
    { key: 'reports', label: 'AI 智能报告', icon: <BarChartOutlined />, ai: true },
  ]},
  { group: '业务管理', items: [
    { key: 'rd', label: '研发问题', icon: <ExperimentOutlined /> },
    { key: 'prod', label: '生产问题', icon: <ToolOutlined /> },
    { key: 'market', label: '市场问题', icon: <CarOutlined /> },
    { key: 'tickets', label: '工单管理', icon: <FileTextOutlined /> },
  ]},
];

// ==================== Main Component ====================

const Component: React.FC = () => {
  const [nav, setNav] = useState<NavKey>('dashboard');

  const renderContent = () => {
    switch (nav) {
      case 'dashboard': return <DashboardView onNav={setNav} />;
      case 'ai-chat': return <AIChatView />;
      case 'rd': return <DomainIssueView domain="研发" data={RD_TICKETS} icon={<ExperimentOutlined />} />;
      case 'prod': return <DomainIssueView domain="生产" data={PROD_TICKETS} icon={<ToolOutlined />} />;
      case 'market': return <DomainIssueView domain="市场" data={MARKET_TICKETS} icon={<CarOutlined />} />;
      case 'tickets': return <TicketManagementView />;
      case 'knowledge': return <KnowledgeBaseView />;
      case 'alerts': return <RiskAlertView />;
      case 'reports': return <AIReportView />;
      default: return <DashboardView onNav={setNav} />;
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#6366f1', borderRadius: 8 } }}>
      <div className="ed-quality-platform">
        <aside className="edq-sidebar">
          <div className="edq-sidebar-brand">
            <div className="edq-sidebar-logo">AI</div>
            <div className="edq-sidebar-title">电驱全链路<br />质量管理平台</div>
            <div className="edq-sidebar-subtitle">AI-Driven Quality Lifecycle</div>
          </div>
          <nav className="edq-sidebar-nav">
            {NAV_ITEMS.map(g => (
              <div key={g.group}>
                <div className="edq-nav-group-title">{g.group}</div>
                {g.items.map(item => (
                  <div
                    key={item.key}
                    className={`edq-nav-item${nav === item.key ? ' edq-nav-item--active' : ''}${item.ai ? ' edq-nav-item--ai' : ''}`}
                    onClick={() => setNav(item.key)}
                  >
                    <span className="edq-nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="edq-nav-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="edq-sidebar-footer">
            <div className="edq-version-tag">V2.0 智能版</div>
          </div>
        </aside>

        <div className="edq-main">
          <header className="edq-header">
            <div className="edq-header-search">
              <Input
                prefix={<SearchOutlined />}
                placeholder="全局搜索工单、故障码、知识库..."
                onClick={() => setNav('ai-chat')}
                readOnly
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div className="edq-header-actions">
              <Button className="edq-ai-btn" icon={<RobotOutlined />} onClick={() => setNav('ai-chat')}>AI 助手</Button>
              <Badge count={4} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} onClick={() => setNav('alerts')} />
              </Badge>
              <Button type="text" icon={<UserOutlined style={{ fontSize: 18 }} />}>质量工程师</Button>
            </div>
          </header>
          <main className="edq-content">{renderContent()}</main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Component;
