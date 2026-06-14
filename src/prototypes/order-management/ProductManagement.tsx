/**
 * @name 商品管理
 *
 * 电商后台商品管理系统，支持商品查询、筛选、批量操作和编辑管理。
 * 包含商品列表、新建/编辑商品抽屉，以及 SKU 管理和营销属性配置。
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  Drawer,
  Modal,
  message,
  Tabs,
  Image,
  Empty,
  Upload,
  Switch,
  Checkbox,
  Row,
  Col,
  Divider,
  Typography,
  Cascader,
  Radio,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 类型定义
interface Product {
  id: string;
  title: string;
  mainImage: string;
  category: string;
  brand: string;
  price: number;
  saleStock: number;
  totalStock: number;
  status: 'on' | 'off' | 'pending' | 'rejected';
  creator: string;
  createTime: string;
}

interface SkuItem {
  id: string;
  attributes: Record<string, string>;
  salePrice: number;
  costPrice: number;
  stock: number;
  barcode: string;
  image?: string;
}

interface ProductFormData {
  title: string;
  category: string[];
  brand: string;
  mainImages: UploadFile[];
  description: string;
  skus: SkuItem[];
  enableMemberPrice: boolean;
  memberPrice?: number;
  tags: string[];
}

// 模拟数据
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB 钛金属',
    mainImage: 'https://picsum.photos/seed/iphone/80/80',
    category: '手机数码',
    brand: 'Apple',
    price: 9999,
    saleStock: 150,
    totalStock: 200,
    status: 'on',
    creator: '张三',
    createTime: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    title: 'MacBook Pro 14英寸 M3芯片',
    mainImage: 'https://picsum.photos/seed/macbook/80/80',
    category: '电脑办公',
    brand: 'Apple',
    price: 14999,
    saleStock: 80,
    totalStock: 100,
    status: 'on',
    creator: '李四',
    createTime: '2024-01-14 14:20:00',
  },
  {
    id: '3',
    title: 'AirPods Pro 第二代',
    mainImage: 'https://picsum.photos/seed/airpods/80/80',
    category: '手机数码',
    brand: 'Apple',
    price: 1899,
    saleStock: 0,
    totalStock: 50,
    status: 'off',
    creator: '王五',
    createTime: '2024-01-13 09:15:00',
  },
  {
    id: '4',
    title: 'iPad Air 5 64GB',
    mainImage: 'https://picsum.photos/seed/ipad/80/80',
    category: '电脑办公',
    brand: 'Apple',
    price: 4399,
    saleStock: 30,
    totalStock: 30,
    status: 'pending',
    creator: '赵六',
    createTime: '2024-01-12 16:45:00',
  },
  {
    id: '5',
    title: 'Apple Watch Series 9',
    mainImage: 'https://picsum.photos/seed/watch/80/80',
    category: '智能穿戴',
    brand: 'Apple',
    price: 2999,
    saleStock: 60,
    totalStock: 80,
    status: 'rejected',
    creator: '钱七',
    createTime: '2024-01-11 11:30:00',
  },
];

// 类目选项
const categoryOptions = [
  {
    value: 'digital',
    label: '手机数码',
    children: [
      { value: 'phone', label: '手机' },
      { value: 'headphone', label: '耳机' },
      { value: 'accessories', label: '配件' },
    ],
  },
  {
    value: 'computer',
    label: '电脑办公',
    children: [
      { value: 'laptop', label: '笔记本' },
      { value: 'tablet', label: '平板' },
      { value: 'desktop', label: '台式机' },
    ],
  },
  {
    value: 'wearable',
    label: '智能穿戴',
    children: [
      { value: 'watch', label: '智能手表' },
      { value: 'band', label: '手环' },
    ],
  },
];

// 品牌选项
const brandOptions = [
  { value: 'Apple', label: 'Apple' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Huawei', label: 'Huawei' },
  { value: 'Xiaomi', label: 'Xiaomi' },
  { value: 'OPPO', label: 'OPPO' },
  { value: 'vivo', label: 'vivo' },
];

// 状态选项
const statusOptions = [
  { value: 'on', label: '已上架', color: 'success' },
  { value: 'off', label: '已下架', color: 'default' },
  { value: 'pending', label: '待审核', color: 'warning' },
  { value: 'rejected', label: '审核不通过', color: 'error' },
];

// 标签选项
const tagOptions = ['新品', '热销', '推荐', '限时特惠', '会员专享', '赠品'];

const ProductManagement: React.FC = () => {
  // 状态
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchEditType, setBatchEditType] = useState<'price' | 'stock'>('price');
  const [batchEditValue, setBatchEditValue] = useState<number>(0);
  const [selectedSkus, setSelectedSkus] = useState<React.Key[]>([]);

  // 表单
  const [form] = Form.useForm();
  const [skuForm] = Form.useForm();

  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState<string>();
  const [searchBrand, setSearchBrand] = useState<string>();
  const [searchStatus, setSearchStatus] = useState<string>();

  // 表格列定义
  const columns = useMemo(() => [
    {
      title: '商品信息',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: Product) => (
        <Space>
          <Image
            src={record.mainImage}
            alt={text}
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
          <div style={{ maxWidth: 200 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.category}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `¥${price.toLocaleString()}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: '库存',
      dataIndex: 'saleStock',
      key: 'stock',
      width: 120,
      render: (saleStock: number, record: Product) => (
        <span>
          {saleStock}/{record.totalStock}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const option = statusOptions.find(opt => opt.value === status);
        return <Tag color={option?.color}>{option?.label}</Tag>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
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
      width: 200,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={record.status === 'on' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'on' ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          {record.status === 'pending' && (
            <Button type="text" size="small" icon={<CheckCircleOutlined />}>
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ], []);

  // 处理函数
  const handleSearch = useCallback(() => {
    setLoading(true);
    // 模拟搜索
    setTimeout(() => {
      let filtered = [...mockProducts];
      if (searchKeyword) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }
      if (searchCategory) {
        filtered = filtered.filter(p => p.category === searchCategory);
      }
      if (searchBrand) {
        filtered = filtered.filter(p => p.brand === searchBrand);
      }
      if (searchStatus) {
        filtered = filtered.filter(p => p.status === searchStatus);
      }
      setProducts(filtered);
      setLoading(false);
    }, 500);
  }, [searchKeyword, searchCategory, searchBrand, searchStatus]);

  const handleReset = useCallback(() => {
    setSearchKeyword('');
    setSearchCategory(undefined);
    setSearchBrand(undefined);
    setSearchStatus(undefined);
    setProducts(mockProducts);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingProduct(null);
    form.resetFields();
    setActiveTab('basic');
    setDrawerVisible(true);
  }, [form]);

  const handleEdit = useCallback((record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      title: record.title,
      brand: record.brand,
      price: record.price,
    });
    setActiveTab('basic');
    setDrawerVisible(true);
  }, [form]);

  const handleDelete = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('删除成功');
  }, []);

  const handleToggleStatus = useCallback((record: Product) => {
    const newStatus = record.status === 'on' ? 'off' : 'on';
    setProducts(prev => 
      prev.map(p => p.id === record.id ? { ...p, status: newStatus } : p)
    );
    message.success(record.status === 'on' ? '下架成功' : '上架成功');
  }, []);

  const handleSave = useCallback(() => {
    form.validateFields().then(values => {
      if (editingProduct) {
        // 更新
        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...values, price: values.price }
              : p
          )
        );
        message.success('更新成功');
      } else {
        // 新建
        const newProduct: Product = {
          id: Date.now().toString(),
          title: values.title,
          mainImage: 'https://picsum.photos/seed/new/80/80',
          category: '手机数码',
          brand: values.brand,
          price: values.price,
          saleStock: 0,
          totalStock: 0,
          status: 'pending',
          creator: '当前用户',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        setProducts(prev => [newProduct, ...prev]);
        message.success('创建成功');
      }
      setDrawerVisible(false);
    });
  }, [editingProduct, form]);

  const handleBatchUpDown = useCallback((action: 'up' | 'down') => {
    const selectedIds = selectedRowKeys as string[];
    setProducts(prev =>
      prev.map(p =>
        selectedIds.includes(p.id)
          ? { ...p, status: action === 'up' ? 'on' : 'off' }
          : p
      )
    );
    message.success(action === 'up' ? '批量上架成功' : '批量下架成功');
    setSelectedRowKeys([]);
  }, [selectedRowKeys]);

  // SKU 表格列
  const skuColumns = [
    {
      title: '规格',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attrs: Record<string, string>) => (
        <Space>
          {Object.entries(attrs).map(([key, value]) => (
            <Tag key={key}>{key}: {value}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '销售价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '条码',
      dataIndex: 'barcode',
      key: 'barcode',
    },
  ];

  // 模拟 SKU 数据
  const mockSkus: SkuItem[] = [
    {
      id: '1',
      attributes: { 颜色: '深空黑', 存储: '256GB' },
      salePrice: 9999,
      costPrice: 8500,
      stock: 100,
      barcode: '123456789',
    },
    {
      id: '2',
      attributes: { 颜色: '银色', 存储: '256GB' },
      salePrice: 9999,
      costPrice: 8500,
      stock: 80,
      barcode: '123456790',
    },
    {
      id: '3',
      attributes: { 颜色: '深空黑', 存储: '512GB' },
      salePrice: 11999,
      costPrice: 10000,
      stock: 50,
      barcode: '123456791',
    },
  ];

  // 搜索展开状态
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <Card>
      {/* 搜索栏 */}
      <div style={{ marginBottom: 24 }}>
        <Card bordered={false} style={{ background: '#fafafa', borderRadius: 8 }}>
          <Form layout="vertical">
            <Row gutter={16} align="bottom">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="商品标题" style={{ marginBottom: 12 }}>
                  <Input
                    placeholder="请输入商品标题"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    allowClear
                    prefix={<SearchOutlined style={{ color: '#999' }} />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="类目" style={{ marginBottom: 12 }}>
                  <Select
                    placeholder="选择类目"
                    value={searchCategory}
                    onChange={setSearchCategory}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="手机数码">手机数码</Select.Option>
                    <Select.Option value="电脑办公">电脑办公</Select.Option>
                    <Select.Option value="智能穿戴">智能穿戴</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="品牌" style={{ marginBottom: 12 }}>
                  <Select
                    placeholder="选择品牌"
                    value={searchBrand}
                    onChange={setSearchBrand}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {brandOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Form.Item label="状态" style={{ marginBottom: 12 }}>
                    <Select
                      placeholder="选择状态"
                      value={searchStatus}
                      onChange={setSearchStatus}
                      allowClear
                      style={{ width: '100%' }}
                    >
                      {statusOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
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
                  <Form.Item label="时间区间" style={{ marginBottom: 0 }}>
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
                      onClick={handleReset}
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
      </div>

      {/* 操作按钮区 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建商品
          </Button>
          <Button icon={<UploadOutlined />}>导入 Excel</Button>
          <Button icon={<DownloadOutlined />}>导出 CSV</Button>
          <Select
            placeholder="批量操作"
            disabled={selectedRowKeys.length === 0}
            onChange={(value: 'up' | 'down') => handleBatchUpDown(value)}
            style={{ width: 120 }}
          >
            <Select.Option value="up">批量上架</Select.Option>
            <Select.Option value="down">批量下架</Select.Option>
          </Select>
        </Space>
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          total: products.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />

      {/* 商品编辑抽屉 */}
      <Drawer
        title={editingProduct ? '编辑商品' : '新建商品'}
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Form form={form} layout="vertical">
              <Form.Item
                name="title"
                label="商品标题"
                rules={[{ required: true, message: '请输入商品标题' }]}
              >
                <Input placeholder="请输入商品标题" maxLength={100} showCount />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="类目"
                    rules={[{ required: true, message: '请选择类目' }]}
                  >
                    <Cascader
                      options={categoryOptions}
                      placeholder="请选择类目"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="brand"
                    label="品牌"
                    rules={[{ required: true, message: '请选择品牌' }]}
                  >
                    <Select placeholder="请选择品牌">
                      {brandOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="mainImages"
                label="主图上传"
                extra="最多上传 5 张图片，单张不超过 2MB"
              >
                <Upload
                  listType="picture-card"
                  maxCount={5}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                </Upload>
              </Form.Item>
              <Form.Item name="description" label="商品描述">
                <TextArea
                  rows={6}
                  placeholder="请输入商品描述，支持富文本编辑"
                />
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="SKU 管理" key="sku">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                disabled={selectedSkus.length === 0}
                onClick={() => setBatchModalVisible(true)}
              >
                批量编辑
              </Button>
            </div>
            <Table
              rowKey="id"
              columns={skuColumns}
              dataSource={mockSkus}
              rowSelection={{
                selectedRowKeys: selectedSkus,
                onChange: setSelectedSkus,
              }}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="营销属性" key="marketing">
            <Form layout="vertical">
              <Form.Item label="会员价">
                <Space>
                  <Switch />
                  <span>启用会员价</span>
                </Space>
              </Form.Item>
              <Form.Item label="会员价设置">
                <InputNumber
                  prefix="¥"
                  placeholder="请输入会员价"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Divider />
              <Form.Item label="商品标签">
                <Checkbox.Group options={tagOptions} />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Drawer>

      {/* 批量编辑弹窗 */}
      <Modal
        title="批量编辑 SKU"
        open={batchModalVisible}
        onOk={() => {
          message.success('批量编辑成功');
          setBatchModalVisible(false);
        }}
        onCancel={() => setBatchModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="编辑类型">
            <Radio.Group
              value={batchEditType}
              onChange={e => setBatchEditType(e.target.value)}
            >
              <Radio value="price">价格</Radio>
              <Radio value="stock">库存</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={batchEditType === 'price' ? '新价格' : '新库存'}>
            <InputNumber
              style={{ width: '100%' }}
              value={batchEditValue}
              onChange={value => setBatchEditValue(value || 0)}
              prefix={batchEditType === 'price' ? '¥' : ''}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagement;
