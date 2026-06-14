/**
 * @name 库存管理
 *
 * 电商后台库存管理系统，支持库存查询、预警监控、单据管理和盘点操作。
 * 包含库存明细、单据列表、盘点记录三个 Tab，以及入库/出库/调拨/盘点功能。
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Table,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Tabs,
  Statistic,
  Row,
  Col,
  Upload,
  Divider,
  Typography,
  List,
  Popconfirm,
} from 'antd';
import * as echarts from 'echarts';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ExportOutlined,
  SwapOutlined,
  FileSearchOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { TextArea } = Input;

// 库存波动图表组件
const InventoryChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const data = [1250, 1320, 1180, 1450, 1380, 1520, 1480];
      
      const option: echarts.EChartsOption = {
        grid: {
          top: 10,
          left: 10,
          right: 10,
          bottom: 20,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#d9d9d9' } },
          axisLabel: { color: '#666', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
          axisLabel: { color: '#666', fontSize: 11 },
        },
        series: [
          {
            type: 'line',
            data: data,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#1890ff',
              width: 2,
            },
            itemStyle: {
              color: '#1890ff',
              borderWidth: 2,
              borderColor: '#fff',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(24,144,255,0.3)' },
                  { offset: 1, color: 'rgba(24,144,255,0.05)' },
                ],
              },
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>库存变动: {c}',
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderColor: '#e8e8e8',
          borderWidth: 1,
          textStyle: { color: '#333' },
        },
      };
      
      chartInstance.current.setOption(option);
      
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  return <div ref={chartRef} style={{ height: 200, width: '100%' }} />;
};

// 类型定义
interface InventoryItem {
  id: string;
  sku: string;
  productTitle: string;
  spec: string;
  barcode: string;
  warehouse: string;
  availableStock: number;
  inTransitStock: number;
  frozenStock: number;
  totalStock: number;
  costPrice: number;
  stockValue: number;
  warningThreshold: number;
}

interface Document {
  id: string;
  documentNo: string;
  type: 'inbound' | 'outbound' | 'transfer';
  warehouse: string;
  skuSummary: string;
  quantity: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  createTime: string;
}

interface InventoryRecord {
  id: string;
  documentNo: string;
  warehouse: string;
  operator: string;
  inventoryTime: string;
  diffSkuCount: number;
  status: 'pending' | 'confirmed';
}

// 模拟数据
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'SKU001',
    productTitle: 'iPhone 15 Pro Max 256GB',
    spec: '深空黑/256GB',
    barcode: '123456789',
    warehouse: '北京仓',
    availableStock: 150,
    inTransitStock: 50,
    frozenStock: 10,
    totalStock: 210,
    costPrice: 8500,
    stockValue: 1785000,
    warningThreshold: 50,
  },
  {
    id: '2',
    sku: 'SKU002',
    productTitle: 'MacBook Pro 14英寸',
    spec: '银色/512GB',
    barcode: '123456790',
    warehouse: '上海仓',
    availableStock: 30,
    inTransitStock: 20,
    frozenStock: 5,
    totalStock: 55,
    costPrice: 12000,
    stockValue: 660000,
    warningThreshold: 40,
  },
  {
    id: '3',
    sku: 'SKU003',
    productTitle: 'AirPods Pro',
    spec: '白色',
    barcode: '123456791',
    warehouse: '广州仓',
    availableStock: 500,
    inTransitStock: 100,
    frozenStock: 20,
    totalStock: 620,
    costPrice: 1200,
    stockValue: 744000,
    warningThreshold: 100,
  },
  {
    id: '4',
    sku: 'SKU004',
    productTitle: 'iPad Air 5',
    spec: '蓝色/64GB',
    barcode: '123456792',
    warehouse: '北京仓',
    availableStock: 20,
    inTransitStock: 10,
    frozenStock: 2,
    totalStock: 32,
    costPrice: 3500,
    stockValue: 112000,
    warningThreshold: 30,
  },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    documentNo: 'IN20240115001',
    type: 'inbound',
    warehouse: '北京仓',
    skuSummary: 'iPhone 15 Pro Max x100',
    quantity: 100,
    status: 'confirmed',
    createTime: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    documentNo: 'OUT20240114002',
    type: 'outbound',
    warehouse: '上海仓',
    skuSummary: 'MacBook Pro x20',
    quantity: 20,
    status: 'confirmed',
    createTime: '2024-01-14 14:20:00',
  },
  {
    id: '3',
    documentNo: 'TR20240113003',
    type: 'transfer',
    warehouse: '广州仓 → 北京仓',
    skuSummary: 'AirPods Pro x50',
    quantity: 50,
    status: 'draft',
    createTime: '2024-01-13 09:15:00',
  },
];

const mockRecords: InventoryRecord[] = [
  {
    id: '1',
    documentNo: 'INV20240115001',
    warehouse: '北京仓',
    operator: '张三',
    inventoryTime: '2024-01-15 16:00:00',
    diffSkuCount: 2,
    status: 'confirmed',
  },
  {
    id: '2',
    documentNo: 'INV20240114002',
    warehouse: '上海仓',
    operator: '李四',
    inventoryTime: '2024-01-14 10:30:00',
    diffSkuCount: 0,
    status: 'confirmed',
  },
  {
    id: '3',
    documentNo: 'INV20240113003',
    warehouse: '广州仓',
    operator: '王五',
    inventoryTime: '2024-01-13 14:00:00',
    diffSkuCount: 5,
    status: 'pending',
  },
];

const InventoryManagement: React.FC = () => {
  // 状态
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 弹窗状态
  const [inboundModalVisible, setInboundModalVisible] = useState(false);
  const [outboundModalVisible, setOutboundModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<InventoryItem | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(0);

  // 搜索状态
  const [searchSku, setSearchSku] = useState('');
  const [searchWarehouse, setSearchWarehouse] = useState<string>();
  const [searchStatus, setSearchStatus] = useState<string>();
  const [searchExpanded, setSearchExpanded] = useState(false);

  // 库存概览数据
  const overviewData = useMemo(() => {
    const total = mockInventory.reduce((sum, item) => sum + item.totalStock, 0);
    const available = mockInventory.reduce((sum, item) => sum + item.availableStock, 0);
    const inTransit = mockInventory.reduce((sum, item) => sum + item.inTransitStock, 0);
    const frozen = mockInventory.reduce((sum, item) => sum + item.frozenStock, 0);
    return { total, available, inTransit, frozen };
  }, []);

  // 预警数据
  const warningData = useMemo(() => {
    return mockInventory
      .filter(item => item.availableStock < item.warningThreshold)
      .slice(0, 10);
  }, []);

  // 库存明细表格列
  const inventoryColumns = useMemo(() => [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      ellipsis: true,
    },
    {
      title: '商品标题',
      dataIndex: 'productTitle',
      key: 'productTitle',
      width: 180,
      ellipsis: true,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 100,
      ellipsis: true,
    },
    {
      title: '条码',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 140,
      ellipsis: true,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
      ellipsis: true,
    },
    {
      title: '可售',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 90,
      align: 'right',
      render: (value: number, record: InventoryItem) => (
        <span style={{ color: value < record.warningThreshold ? '#ff4d4f' : 'inherit' }}>
          {value}
        </span>
      ),
    },
    {
      title: '在途',
      dataIndex: 'inTransitStock',
      key: 'inTransitStock',
      width: 90,
      align: 'right',
    },
    {
      title: '冻结',
      dataIndex: 'frozenStock',
      key: 'frozenStock',
      width: 90,
      align: 'right',
    },
    {
      title: '总库存',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 100,
      align: 'right',
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 110,
      align: 'right',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '库存价值',
      dataIndex: 'stockValue',
      key: 'stockValue',
      width: 130,
      align: 'right',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '预警阈值',
      dataIndex: 'warningThreshold',
      key: 'warningThreshold',
      width: 110,
      align: 'right',
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_: any, record: InventoryItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditThreshold(record)}
          >
            编辑阈值
          </Button>
          <Button
            type="text"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => setTransferModalVisible(true)}
          >
            调拨
          </Button>
          <Button
            type="text"
            size="small"
            icon={<FileSearchOutlined />}
            onClick={() => setInventoryModalVisible(true)}
          >
            盘点
          </Button>
        </Space>
      ),
    },
  ], []);

  // 单据表格列
  const documentColumns = useMemo(() => [
    {
      title: '单号',
      dataIndex: 'documentNo',
      key: 'documentNo',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          inbound: { label: '入库', color: 'success' },
          outbound: { label: '出库', color: 'error' },
          transfer: { label: '调拨', color: 'warning' },
        };
        const config = typeMap[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '关联仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 150,
    },
    {
      title: 'SKU 汇总',
      dataIndex: 'skuSummary',
      key: 'skuSummary',
      width: 200,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'default' },
          confirmed: { label: '已确认', color: 'success' },
          cancelled: { label: '已作废', color: 'error' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Document) => (
        <Space>
          <Button type="text" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          {record.status === 'draft' && (
            <Popconfirm
              title="确认作废"
              description="确定要作废这个单据吗？"
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                作废
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], []);

  // 盘点记录表格列
  const recordColumns = useMemo(() => [
    {
      title: '盘点单号',
      dataIndex: 'documentNo',
      key: 'documentNo',
      width: 150,
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100,
    },
    {
      title: '盘点人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '盘点时间',
      dataIndex: 'inventoryTime',
      key: 'inventoryTime',
      width: 160,
    },
    {
      title: '差异 SKU 数',
      dataIndex: 'diffSkuCount',
      key: 'diffSkuCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : 'inherit' }}>
          {count}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          pending: { label: '待确认', color: 'warning' },
          confirmed: { label: '已确认', color: 'success' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: InventoryRecord) => (
        <Space>
          <Button type="text" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
            >
              确认
            </Button>
          )}
        </Space>
      ),
    },
  ], []);

  // 处理函数
  const handleSearch = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleEditThreshold = useCallback((record: InventoryItem) => {
    setEditingThreshold(record);
    setNewThreshold(record.warningThreshold);
    setThresholdModalVisible(true);
  }, []);

  const handleSaveThreshold = useCallback(() => {
    message.success('预警阈值更新成功');
    setThresholdModalVisible(false);
  }, []);

  const handleInboundSubmit = useCallback((status: 'draft' | 'confirmed') => {
    message.success(status === 'draft' ? '草稿保存成功' : '入库单创建成功');
    setInboundModalVisible(false);
  }, []);

  return (
    <div>
      {/* Header 区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>库存管理</Title>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setInboundModalVisible(true)}>
                新建入库
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => setOutboundModalVisible(true)}>
                出库
              </Button>
              <Button icon={<SwapOutlined />} onClick={() => setTransferModalVisible(true)}>
                调拨
              </Button>
              <Button icon={<FileSearchOutlined />} onClick={() => setInventoryModalVisible(true)}>
                盘点
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        <Form layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="SKU" style={{ marginBottom: 12 }}>
                <Input
                  placeholder="请输入SKU"
                  value={searchSku}
                  onChange={e => setSearchSku(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined style={{ color: '#999' }} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="仓库" style={{ marginBottom: 12 }}>
                <Select
                  placeholder="选择仓库"
                  value={searchWarehouse}
                  onChange={setSearchWarehouse}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="北京仓">北京仓</Select.Option>
                  <Select.Option value="上海仓">上海仓</Select.Option>
                  <Select.Option value="广州仓">广州仓</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="库存状态" style={{ marginBottom: 12 }}>
                <Select
                  placeholder="选择状态"
                  value={searchStatus}
                  onChange={setSearchStatus}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="normal">正常</Select.Option>
                  <Select.Option value="warning">预警</Select.Option>
                  <Select.Option value="out">缺货</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Form.Item label="类目" style={{ marginBottom: 12 }}>
                  <Select
                    placeholder="选择类目"
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="手机数码">手机数码</Select.Option>
                    <Select.Option value="电脑办公">电脑办公</Select.Option>
                    <Select.Option value="智能穿戴">智能穿戴</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              {!searchExpanded && (
                <Button 
                  type="link" 
                  icon={<DownOutlined />}
                  onClick={() => setSearchExpanded(true)}
                  style={{ marginBottom: 12, marginLeft: 16 }}
                >
                  展开
                </Button>
              )}
            </Col>
          </Row>
          {searchExpanded && (
            <Row gutter={16} style={{ marginTop: 8 }} align="middle">
              <Col xs={24} md={10} lg={10}>
                <Form.Item label="更新时间" style={{ marginBottom: 0 }}>
                  <RangePicker
                    style={{ width: '100%', height: 32 }}
                    placeholder={['开始时间', '结束时间']}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={14} lg={14} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Space wrap style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    style={{ padding: '0 24px', height: 32 }}
                  >
                    搜索
                  </Button>
                  <Button 
                    style={{ padding: '0 24px', height: 32 }}
                  >
                    重置
                  </Button>
                </Space>
                <Button 
                  type="link" 
                  icon={<UpOutlined />}
                  onClick={() => setSearchExpanded(false)}
                  style={{ height: 32 }}
                >
                  收起
                </Button>
              </Col>
            </Row>
          )}
        </Form>
      </Card>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card 
            title="库存概览" 
            bordered={false}
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              borderRadius: 8,
              height: '100%'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="总库存" 
                  value={overviewData.total.toLocaleString()} 
                  valueStyle={{ fontSize: 24, fontWeight: 600 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="可售" 
                  value={overviewData.available.toLocaleString()} 
                  valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="在途" 
                  value={overviewData.inTransit.toLocaleString()} 
                  valueStyle={{ color: '#faad14', fontSize: 24, fontWeight: 600 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="冻结" 
                  value={overviewData.frozen.toLocaleString()} 
                  valueStyle={{ color: '#ff4d4f', fontSize: 24, fontWeight: 600 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card 
            title="库存预警" 
            extra={<Tag color="error">{warningData.length} 条预警</Tag>}
            bordered={false}
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              borderRadius: 8,
              height: '100%'
            }}
          >
            <List
              size="small"
              dataSource={warningData}
              renderItem={item => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{item.sku}</Text>
                      <Tag color="error" style={{ margin: 0 }}>{item.warehouse}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary">可售: {item.availableStock}</Text>
                      <Text type="secondary">阈值: {item.warningThreshold}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card 
            title="7 天库存波动" 
            bordered={false}
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              borderRadius: 8,
              height: '100%'
            }}
          >
            <InventoryChart />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="库存明细" key="inventory">
            <Table
              rowKey="id"
              columns={inventoryColumns}
              dataSource={mockInventory}
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              pagination={{
                total: mockInventory.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共 ${total} 条`,
              }}
              scroll={{ x: 1800 }}
              bordered
              size="middle"
            />
          </TabPane>
          <TabPane tab="单据列表" key="documents">
            <Table
              rowKey="id"
              columns={documentColumns}
              dataSource={mockDocuments}
              pagination={{
                total: mockDocuments.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共 ${total} 条`,
              }}
            />
          </TabPane>
          <TabPane tab="盘点记录" key="records">
            <Table
              rowKey="id"
              columns={recordColumns}
              dataSource={mockRecords}
              pagination={{
                total: mockRecords.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共 ${total} 条`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 新建入库单 Modal */}
      <Modal
        title="新建入库单"
        open={inboundModalVisible}
        onCancel={() => setInboundModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form layout="vertical">
          <Form.Item label="单据类型">
            <Input value="入库单 (INBOUND)" disabled />
          </Form.Item>
          <Form.Item label="仓库" required>
            <Select placeholder="请选择仓库">
              <Select.Option value="北京仓">北京仓</Select.Option>
              <Select.Option value="上海仓">上海仓</Select.Option>
              <Select.Option value="广州仓">广州仓</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="SKU 列表" required>
            <Select
              mode="multiple"
              placeholder="请选择 SKU"
              options={mockInventory.map(item => ({ label: `${item.sku} - ${item.productTitle}`, value: item.sku }))}
            />
          </Form.Item>
          <Form.Item label="到货数量" required>
            <InputNumber min={1} placeholder="请输入到货数量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="批次号">
            <Input placeholder="请输入批次号（可选）" />
          </Form.Item>
          <Form.Item label="有效期">
            <DatePicker placeholder="请选择有效期（可选）" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="附件">
            <Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持图片/PDF，最多 3 份，每份 ≤ 5MB</p>
            </Dragger>
          </Form.Item>
          <Divider />
          <Form.Item>
            <Space>
              <Button onClick={() => setInboundModalVisible(false)}>取消</Button>
              <Button onClick={() => handleInboundSubmit('draft')}>保存草稿</Button>
              <Button type="primary" onClick={() => handleInboundSubmit('confirmed')}>
                确认入库
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 出库 Modal */}
      <Modal
        title="新建出库单"
        open={outboundModalVisible}
        onCancel={() => setOutboundModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="仓库" required>
            <Select placeholder="请选择仓库">
              <Select.Option value="北京仓">北京仓</Select.Option>
              <Select.Option value="上海仓">上海仓</Select.Option>
              <Select.Option value="广州仓">广州仓</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="SKU" required>
            <Select placeholder="请选择 SKU" options={mockInventory.map(item => ({ label: item.sku, value: item.sku }))} />
          </Form.Item>
          <Form.Item label="出库数量" required>
            <InputNumber min={1} placeholder="请输入出库数量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="出库原因">
            <Select placeholder="请选择出库原因">
              <Select.Option value="sale">销售出库</Select.Option>
              <Select.Option value="return">退货出库</Select.Option>
              <Select.Option value="transfer">调拨出库</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setOutboundModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={() => { message.success('出库单创建成功'); setOutboundModalVisible(false); }}>
                确认出库
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 调拨 Modal */}
      <Modal
        title="新建调拨单"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="调出仓库" required>
                <Select placeholder="请选择调出仓库">
                  <Select.Option value="北京仓">北京仓</Select.Option>
                  <Select.Option value="上海仓">上海仓</Select.Option>
                  <Select.Option value="广州仓">广州仓</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="调入仓库" required>
                <Select placeholder="请选择调入仓库">
                  <Select.Option value="北京仓">北京仓</Select.Option>
                  <Select.Option value="上海仓">上海仓</Select.Option>
                  <Select.Option value="广州仓">广州仓</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="SKU" required>
            <Select placeholder="请选择 SKU" options={mockInventory.map(item => ({ label: item.sku, value: item.sku }))} />
          </Form.Item>
          <Form.Item label="调拨数量" required>
            <InputNumber min={1} placeholder="请输入调拨数量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setTransferModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={() => { message.success('调拨单创建成功'); setTransferModalVisible(false); }}>
                确认调拨
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 盘点 Modal */}
      <Modal
        title="新建盘点单"
        open={inventoryModalVisible}
        onCancel={() => setInventoryModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="盘点仓库" required>
            <Select placeholder="请选择盘点仓库">
              <Select.Option value="北京仓">北京仓</Select.Option>
              <Select.Option value="上海仓">上海仓</Select.Option>
              <Select.Option value="广州仓">广州仓</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="盘点 SKU">
            <Select
              mode="multiple"
              placeholder="请选择盘点 SKU（不选则盘点全部）"
              options={mockInventory.map(item => ({ label: `${item.sku} - ${item.productTitle}`, value: item.sku }))}
            />
          </Form.Item>
          <Form.Item label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setInventoryModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={() => { message.success('盘点单创建成功'); setInventoryModalVisible(false); }}>
                创建盘点单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑阈值 Modal */}
      <Modal
        title="编辑预警阈值"
        open={thresholdModalVisible}
        onOk={handleSaveThreshold}
        onCancel={() => setThresholdModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="SKU">
            <Input value={editingThreshold?.sku} disabled />
          </Form.Item>
          <Form.Item label="商品">
            <Input value={editingThreshold?.productTitle} disabled />
          </Form.Item>
          <Form.Item label="预警阈值" required>
            <InputNumber
              min={0}
              value={newThreshold}
              onChange={value => setNewThreshold(value || 0)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
