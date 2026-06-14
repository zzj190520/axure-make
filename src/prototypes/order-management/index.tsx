/**
 * @name 订单管理 - 订单列表
 *
 * 电商后台订单管理系统，支持订单查询、筛选、批量操作和详情查看。
 * 包含全部订单和异常订单两个 Tab，提供完整的订单生命周期管理功能。
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
  Descriptions,
  Modal,
  message,
  Popconfirm,
  Tabs,
  Image,
  Empty,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  Menu,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  CarOutlined,
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
  DollarOutlined,
  CommentOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  IssuesCloseOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import './style.css';
import ProductManagement from './ProductManagement';
import InventoryManagement from './InventoryManagement';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

// ==================== 类型定义 ====================

interface OrderItem {
  id: string;
  image: string;
  title: string;
  spec: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
}

interface AfterSaleRecord {
  id: string;
  type: 'REFUND' | 'RETURN' | 'EXCHANGE';
  status: string;
  applyTime: string;
  amount: number;
}

interface Order {
  orderNo: string;
  createTime: string;
  buyerNick: string;
  buyerPhone: string;
  channel: 'APP' | 'MINI_APP' | 'PC';
  items: OrderItem[];
  payAmount: number;
  freight: number;
  discount: number;
  status: OrderStatus;
  afterSaleStatus: AfterSaleStatus;
  exceptionTag: ExceptionTag;
  orderCostTotal?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  payMethod?: string;
  remark?: string;
  logistics?: {
    company: string;
    trackingNo: string;
    shipTime: string;
  };
  afterSales?: AfterSaleRecord[];
}

type OrderStatus =
  | 'PENDING_PAY'
  | 'PAID'
  | 'WAIT_SHIP'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'REFUNDED';

type AfterSaleStatus = 'NONE' | 'APPLYING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

type ExceptionTag = 'NONE' | 'PAY_TIMEOUT' | 'SHIP_DELAY' | 'STOCK_SHORTAGE';

interface SearchForm {
  orderNo?: string;
  buyerPhone?: string;
  status?: OrderStatus;
  channel?: string;
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

// ==================== 常量定义 ====================

const ORDER_STATUS_MAP: Record<OrderStatus, { text: string; color: string }> = {
  PENDING_PAY: { text: '待付款', color: 'orange' },
  PAID: { text: '已付款', color: 'blue' },
  WAIT_SHIP: { text: '待发货', color: 'blue' },
  SHIPPED: { text: '已发货', color: 'cyan' },
  RECEIVED: { text: '已收货', color: 'green' },
  COMPLETED: { text: '已完成', color: 'green' },
  CLOSED: { text: '已关闭', color: 'default' },
  REFUNDED: { text: '已退款', color: 'default' },
};

const AFTER_SALE_STATUS_MAP: Record<AfterSaleStatus, { text: string; color: string }> = {
  NONE: { text: '无售后', color: 'default' },
  APPLYING: { text: '申请中', color: 'orange' },
  PROCESSING: { text: '处理中', color: 'blue' },
  COMPLETED: { text: '已完成', color: 'green' },
  REJECTED: { text: '已拒绝', color: 'red' },
};

const EXCEPTION_TAG_MAP: Record<ExceptionTag, { text: string; bgColor: string; color: string }> = {
  NONE: { text: '正常', bgColor: '', color: '' },
  PAY_TIMEOUT: { text: '付款超时', bgColor: '#fff1f0', color: '#cf1322' },
  SHIP_DELAY: { text: '发货延迟', bgColor: '#fff7e6', color: '#d46b08' },
  STOCK_SHORTAGE: { text: '库存短缺', bgColor: '#feffe6', color: '#d4b106' },
};

const CHANNEL_MAP: Record<string, { text: string; className: string }> = {
  APP: { text: 'APP', className: 'channel-tag-app' },
  MINI_APP: { text: '小程序', className: 'channel-tag-mini' },
  PC: { text: 'PC端', className: 'channel-tag-pc' },
};

// ==================== 模拟数据 ====================

const mockOrders: Order[] = [
  {
    orderNo: 'ORD20251230001',
    createTime: '2025-12-30 09:15:22',
    buyerNick: '张伟',
    buyerPhone: '138****1234',
    channel: 'APP',
    items: [
      {
        id: '1',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%231677ff"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E📱%3C/text%3E%3C/svg%3E',
        title: '小米14 Pro 手机',
        spec: '12GB+256GB 黑色',
        price: 4999,
        quantity: 1,
        subtotal: 4999,
        discount: 0,
      },
    ],
    payAmount: 5000,
    freight: 1,
    discount: 0,
    status: 'COMPLETED',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 4500,
    receiverName: '张伟',
    receiverPhone: '138****1234',
    receiverAddress: '北京市朝阳区建国路88号SOHO现代城',
    payMethod: '微信支付',
    remark: '请尽快发货',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF1234567890',
      shipTime: '2025-12-30 10:30:00',
    },
  },
  {
    orderNo: 'ORD20251230002',
    createTime: '2025-12-30 09:18:05',
    buyerNick: '李秀英',
    buyerPhone: '159****5678',
    channel: 'MINI_APP',
    items: [
      {
        id: '2',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2352c41a"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E📦%3C/text%3E%3C/svg%3E',
        title: '维达抽纸 3层120抽*24包',
        spec: '经典款',
        price: 59.9,
        quantity: 2,
        subtotal: 119.8,
        discount: 0,
      },
    ],
    payAmount: 119.8,
    freight: 0,
    discount: 0,
    status: 'SHIPPED',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 80,
    receiverName: '李秀英',
    receiverPhone: '159****5678',
    receiverAddress: '上海市浦东新区陆家嘴环路1000号',
    payMethod: '支付宝',
    logistics: {
      company: '中通快递',
      trackingNo: 'ZT9876543210',
      shipTime: '2025-12-30 14:20:00',
    },
  },
  {
    orderNo: 'ORD20251230003',
    createTime: '2025-12-30 09:25:30',
    buyerNick: '王芳',
    buyerPhone: '186****9012',
    channel: 'APP',
    items: [
      {
        id: '3',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23eb2f96"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E💄%3C/text%3E%3C/svg%3E',
        title: '雅诗兰黛小棕瓶精华',
        spec: '50ml',
        price: 680,
        quantity: 1,
        subtotal: 680,
        discount: 50,
      },
    ],
    payAmount: 630,
    freight: 0,
    discount: 50,
    status: 'WAIT_SHIP',
    afterSaleStatus: 'NONE',
    exceptionTag: 'SHIP_DELAY',
    orderCostTotal: 500,
    receiverName: '王芳',
    receiverPhone: '186****9012',
    receiverAddress: '广东省广州市天河区珠江新城IFC',
    payMethod: '微信支付',
  },
  {
    orderNo: 'ORD20251230004',
    createTime: '2025-12-30 09:40:11',
    buyerNick: '刘强',
    buyerPhone: '135****3344',
    channel: 'PC',
    items: [
      {
        id: '4',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23722ed1"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E🖱️%3C/text%3E%3C/svg%3E',
        title: '罗技MX Master 3S鼠标',
        spec: '石墨黑',
        price: 699,
        quantity: 1,
        subtotal: 699,
        discount: 0,
      },
      {
        id: '5',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2313c2c2"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E⌨️%3C/text%3E%3C/svg%3E',
        title: '罗技K380键盘',
        spec: '白色',
        price: 199,
        quantity: 1,
        subtotal: 199,
        discount: 0,
      },
    ],
    payAmount: 898,
    freight: 0,
    discount: 0,
    status: 'PENDING_PAY',
    afterSaleStatus: 'NONE',
    exceptionTag: 'PAY_TIMEOUT',
    orderCostTotal: 600,
    receiverName: '刘强',
    receiverPhone: '135****3344',
    receiverAddress: '浙江省杭州市余杭区文一西路969号',
    payMethod: '支付宝',
  },
  {
    orderNo: 'ORD20251230005',
    createTime: '2025-12-30 10:05:55',
    buyerNick: '陈杰',
    buyerPhone: '137****7788',
    channel: 'MINI_APP',
    items: [
      {
        id: '6',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23faad14"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E🥜%3C/text%3E%3C/svg%3E',
        title: '三只松鼠坚果礼盒',
        spec: '1.5kg礼盒装',
        price: 128,
        quantity: 5,
        subtotal: 640,
        discount: 40,
      },
    ],
    payAmount: 600,
    freight: 0,
    discount: 40,
    status: 'WAIT_SHIP',
    afterSaleStatus: 'NONE',
    exceptionTag: 'STOCK_SHORTAGE',
    orderCostTotal: 450,
    receiverName: '陈杰',
    receiverPhone: '137****7788',
    receiverAddress: '江苏省南京市鼓楼区汉中路2号',
    payMethod: '银联云闪付',
  },
  {
    orderNo: 'ORD20251230006',
    createTime: '2025-12-30 10:12:40',
    buyerNick: '杨洋',
    buyerPhone: '150****2233',
    channel: 'APP',
    items: [
      {
        id: '7',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%232f54eb"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E👕%3C/text%3E%3C/svg%3E',
        title: '优衣库U系列纯棉T恤',
        spec: 'L码 白色',
        price: 99,
        quantity: 3,
        subtotal: 297,
        discount: 0,
      },
    ],
    payAmount: 297,
    freight: 0,
    discount: 0,
    status: 'COMPLETED',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 150,
    receiverName: '杨洋',
    receiverPhone: '150****2233',
    receiverAddress: '四川省成都市锦江区春熙路IFS',
    payMethod: '微信支付',
    logistics: {
      company: '京东物流',
      trackingNo: 'JD555566667777',
      shipTime: '2025-12-30 11:00:00',
    },
  },
  {
    orderNo: 'ORD20251230007',
    createTime: '2025-12-30 10:30:18',
    buyerNick: '赵静',
    buyerPhone: '189****6655',
    channel: 'APP',
    items: [
      {
        id: '8',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2352c41a"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E🪥%3C/text%3E%3C/svg%3E',
        title: '飞利浦电动牙刷HX6730',
        spec: '标准版',
        price: 329,
        quantity: 1,
        subtotal: 329,
        discount: 0,
      },
    ],
    payAmount: 0,
    freight: 0,
    discount: 0,
    status: 'REFUNDED',
    afterSaleStatus: 'COMPLETED',
    exceptionTag: 'NONE',
    orderCostTotal: 250,
    receiverName: '赵静',
    receiverPhone: '189****6655',
    receiverAddress: '湖北省武汉市江汉区解放大道688号',
    payMethod: '支付宝',
    afterSales: [
      {
        id: 'AS20251230001',
        type: 'REFUND',
        status: 'COMPLETED',
        applyTime: '2025-12-30 11:00:00',
        amount: 329,
      },
    ],
  },
  {
    orderNo: 'ORD20251230008',
    createTime: '2025-12-30 11:15:33',
    buyerNick: '孙明',
    buyerPhone: '139****4455',
    channel: 'PC',
    items: [
      {
        id: '9',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23fa541c"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E📱%3C/text%3E%3C/svg%3E',
        title: 'iPhone 16 Pro',
        spec: '256GB 钛金属色',
        price: 9999,
        quantity: 1,
        subtotal: 9999,
        discount: 500,
      },
    ],
    payAmount: 9499,
    freight: 0,
    discount: 500,
    status: 'PAID',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 8500,
    receiverName: '孙明',
    receiverPhone: '139****4455',
    receiverAddress: '上海市静安区南京西路1268号',
    payMethod: '支付宝',
  },
  {
    orderNo: 'ORD20251230009',
    createTime: '2025-12-30 11:30:45',
    buyerNick: '周丽',
    buyerPhone: '158****6677',
    channel: 'MINI_APP',
    items: [
      {
        id: '10',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%231890ff"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E🎧%3C/text%3E%3C/svg%3E',
        title: 'AirPods Pro 2',
        spec: '降噪耳机',
        price: 1899,
        quantity: 1,
        subtotal: 1899,
        discount: 100,
      },
      {
        id: '11',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23722ed1"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E📱%3C/text%3E%3C/svg%3E',
        title: '手机保护壳',
        spec: '透明款',
        price: 99,
        quantity: 2,
        subtotal: 198,
        discount: 0,
      },
    ],
    payAmount: 1897,
    freight: 0,
    discount: 100,
    status: 'SHIPPED',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 1600,
    receiverName: '周丽',
    receiverPhone: '158****6677',
    receiverAddress: '北京市海淀区中关村大街1号',
    payMethod: '微信支付',
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF2233445566',
      shipTime: '2025-12-30 12:00:00',
    },
  },
  {
    orderNo: 'ORD20251230010',
    createTime: '2025-12-30 12:05:22',
    buyerNick: '吴强',
    buyerPhone: '136****8899',
    channel: 'APP',
    items: [
      {
        id: '12',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2352c41a"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20"%3E🏠%3C/text%3E%3C/svg%3E',
        title: '小米空气净化器',
        spec: 'Pro H',
        price: 1499,
        quantity: 1,
        subtotal: 1499,
        discount: 200,
      },
    ],
    payAmount: 1299,
    freight: 0,
    discount: 200,
    status: 'CLOSED',
    afterSaleStatus: 'NONE',
    exceptionTag: 'NONE',
    orderCostTotal: 1100,
    receiverName: '吴强',
    receiverPhone: '136****8899',
    receiverAddress: '深圳市南山区科技园',
    payMethod: '微信支付',
  },
];

// ==================== 主组件 ====================

const OrderManagement: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('all');
  const [searchForm, setSearchForm] = useState<SearchForm>({});
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: mockOrders.length,
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // 弹窗状态
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 表单数据
  const [shipForm, setShipForm] = useState({ company: '', trackingNo: '' });
  const [newPrice, setNewPrice] = useState<number>(0);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [remark, setRemark] = useState('');

  // ==================== 表格列定义 ====================

  const columns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        key: 'orderNo',
        width: 140,
        sorter: true,
        render: (text) => (
          <Text copyable className="order-no-cell">
            {text}
          </Text>
        ),
      },
      {
        title: '下单时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 160,
        sorter: true,
      },
      {
        title: '买家',
        key: 'buyer',
        width: 140,
        render: (_, record) => (
          <div>
            <div>{record.buyerNick}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.buyerPhone}
            </Text>
          </div>
        ),
      },
      {
        title: '渠道',
        dataIndex: 'channel',
        key: 'channel',
        width: 90,
        render: (channel) => {
          const info = CHANNEL_MAP[channel];
          return <Tag className={info.className}>{info.text}</Tag>;
        },
      },
      {
        title: '商品概览',
        key: 'items',
        width: 280,
        render: (_, record) => (
          <div className="order-items-preview">
            {record.items.slice(0, 2).map((item, index) => (
              <div key={item.id} className="order-item-row">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={40}
                  height={40}
                  style={{ borderRadius: 4, objectFit: 'cover' }}
                  preview={false}
                />
                <div className="order-item-info">
                  <Text ellipsis style={{ maxWidth: 150, fontSize: 12 }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    x{item.quantity}
                  </Text>
                </div>
              </div>
            ))}
            {record.items.length > 2 && (
              <span className="order-item-more">等 {record.items.length} 件商品</span>
            )}
            {activeTab === 'exception' && record.exceptionTag !== 'NONE' && (
              <span
                className="exception-tag"
                style={{
                  color: EXCEPTION_TAG_MAP[record.exceptionTag].color,
                  background: EXCEPTION_TAG_MAP[record.exceptionTag].bgColor,
                }}
              >
                <ExclamationCircleOutlined />
                {EXCEPTION_TAG_MAP[record.exceptionTag].text}
              </span>
            )}
          </div>
        ),
      },
      {
        title: '实付金额',
        dataIndex: 'payAmount',
        key: 'payAmount',
        width: 100,
        sorter: true,
        render: (amount) => <span className="amount-cell">¥{amount.toFixed(2)}</span>,
      },
      {
        title: '运费',
        dataIndex: 'freight',
        key: 'freight',
        width: 80,
        render: (freight) => `¥${freight.toFixed(2)}`,
      },
      {
        title: '优惠',
        dataIndex: 'discount',
        key: 'discount',
        width: 80,
        render: (discount) =>
          discount > 0 ? (
            <Text type="success">-¥{discount.toFixed(2)}</Text>
          ) : (
            '-'
          ),
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => {
          const { text, color } = ORDER_STATUS_MAP[status];
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '售后状态',
        dataIndex: 'afterSaleStatus',
        key: 'afterSaleStatus',
        width: 100,
        render: (status) => {
          const { text, color } = AFTER_SALE_STATUS_MAP[status];
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 280,
        fixed: 'right',
        render: (_, record) => {
          const canModifyPrice = record.status === 'WAIT_SHIP';
          const canShip = record.status === 'WAIT_SHIP';
          const canRefund =
            record.status === 'WAIT_SHIP' || record.status === 'SHIPPED';
          const canClose = record.status !== 'COMPLETED' && record.status !== 'CLOSED';
          const hasAfterSale = record.afterSaleStatus !== 'NONE';

          return (
            <Space className="action-buttons" size="small">
              <Tooltip title="查看">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                />
              </Tooltip>
              {canModifyPrice && (
                <Tooltip title="改价">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleOpenPriceModal(record)}
                  />
                </Tooltip>
              )}
              {canShip && (
                <Tooltip title="发货">
                  <Button
                    type="text"
                    size="small"
                    icon={<CarOutlined />}
                    onClick={() => handleOpenShipModal(record)}
                  />
                </Tooltip>
              )}
              {canRefund && (
                <Tooltip title="退款">
                  <Button
                    type="text"
                    size="small"
                    icon={<DollarOutlined />}
                    onClick={() => handleOpenRefundModal(record)}
                  />
                </Tooltip>
              )}
              {canClose && (
                <Tooltip title="关闭">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleOpenCloseModal(record)}
                  />
                </Tooltip>
              )}
              {hasAfterSale && (
                <Tooltip title="售后">
                  <Button type="text" size="small">
                    售后
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="备注">
                <Button
                  type="text"
                  size="small"
                  icon={<CommentOutlined />}
                  onClick={() => handleOpenRemarkModal(record)}
                />
              </Tooltip>
            </Space>
          );
        },
      },
    ],
    [activeTab]
  );

  // ==================== 事件处理 ====================

  const handleSearch = () => {
    const { orderNo, buyerPhone, status, channel, timeRange } = searchForm;
    if (!orderNo && !buyerPhone && !status && !channel && !timeRange) {
      message.warning('请至少输入一个查询条件');
      return;
    }
    // 执行搜索
    message.success('搜索成功');
  };

  const handleReset = () => {
    setSearchForm({});
  };

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Order> | SorterResult<Order>[]
  ) => {
    setPagination(newPagination);
  };

  const handleViewDetail = (order: Order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const handleOpenShipModal = (order: Order) => {
    setCurrentOrder(order);
    setShipForm({ company: '', trackingNo: '' });
    setShipModalVisible(true);
  };

  const handleOpenPriceModal = (order: Order) => {
    setCurrentOrder(order);
    setNewPrice(order.payAmount);
    setPriceModalVisible(true);
  };

  const handleOpenRefundModal = (order: Order) => {
    setCurrentOrder(order);
    setRefundAmount(order.payAmount);
    setRefundModalVisible(true);
  };

  const handleOpenCloseModal = (order: Order) => {
    setCurrentOrder(order);
    setCloseModalVisible(true);
  };

  const handleOpenRemarkModal = (order: Order) => {
    setCurrentOrder(order);
    setRemark(order.remark || '');
    setRemarkModalVisible(true);
  };

  const handleShipSubmit = async () => {
    if (!shipForm.company || !shipForm.trackingNo) {
      message.error('请填写完整的物流信息');
      return;
    }
    setModalLoading(true);
    // 模拟 API 调用
    setTimeout(() => {
      message.success('发货成功');
      setShipModalVisible(false);
      setModalLoading(false);
    }, 500);
  };

  const handlePriceSubmit = async () => {
    if (newPrice < 0) {
      message.error('金额不能为负数');
      return;
    }
    if (currentOrder && newPrice < (currentOrder.orderCostTotal || 0)) {
      message.error('新金额不能低于成本');
      return;
    }
    setModalLoading(true);
    setTimeout(() => {
      message.success('改价成功');
      setPriceModalVisible(false);
      setModalLoading(false);
    }, 500);
  };

  const handleRefundSubmit = async () => {
    if (refundAmount <= 0) {
      message.error('退款金额必须大于0');
      return;
    }
    setModalLoading(true);
    setTimeout(() => {
      message.success('退款成功');
      setRefundModalVisible(false);
      setModalLoading(false);
    }, 500);
  };

  const handleCloseSubmit = async () => {
    setModalLoading(true);
    setTimeout(() => {
      message.success('订单关闭成功');
      setCloseModalVisible(false);
      setModalLoading(false);
    }, 500);
  };

  const handleRemarkSubmit = async () => {
    setModalLoading(true);
    setTimeout(() => {
      message.success('备注更新成功');
      setRemarkModalVisible(false);
      setModalLoading(false);
    }, 500);
  };

  const handleBatchShip = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择订单');
      return;
    }
    Modal.confirm({
      title: '批量发货确认',
      content: `确定要对选中的 ${selectedRows.length} 个订单进行批量发货吗？`,
      onOk: () => {
        message.success('批量发货成功');
        setSelectedRows([]);
      },
    });
  };

  const handleExport = () => {
    message.success('订单导出成功');
  };

  // ==================== 渲染辅助函数 ====================

  const getRowClassName = (record: Order) => {
    if (activeTab === 'exception' && record.exceptionTag !== 'NONE') {
      const { bgColor } = EXCEPTION_TAG_MAP[record.exceptionTag];
      return 'exception-row';
    }
    return '';
  };

  const getRowStyle = (record: Order): React.CSSProperties => {
    if (activeTab === 'exception' && record.exceptionTag !== 'NONE') {
      const { bgColor } = EXCEPTION_TAG_MAP[record.exceptionTag];
      return { backgroundColor: bgColor };
    }
    return {};
  };

  // ==================== 渲染 ====================

  const filteredOrders = useMemo(() => {
    if (activeTab === 'exception') {
      return mockOrders.filter((o) => o.exceptionTag !== 'NONE');
    }
    return mockOrders;
  }, [activeTab]);

  const exceptionCount = mockOrders.filter((o) => o.exceptionTag !== 'NONE').length;
  const waitShipCount = mockOrders.filter((o) => o.status === 'WAIT_SHIP').length;
  const totalPayAmount = mockOrders.reduce((sum, o) => sum + o.payAmount, 0);
  const afterSaleCount = mockOrders.filter((o) => o.afterSaleStatus !== 'NONE').length;

  return (
    <div className="order-management">
      <div className="order-page-header">
        <Title level={4} className="order-page-title">订单列表</Title>
        <p className="order-page-desc">查询、筛选与处理订单，支持批量发货与详情查看</p>
      </div>

      <Card className="order-card">
        <div className="order-tabs-wrap">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="全部订单" key="all" />
            <TabPane
              tab={
                <span>
                  异常订单
                  <Badge
                    count={exceptionCount}
                    size="small"
                    style={{ marginLeft: 8 }}
                  />
                </span>
              }
              key="exception"
            />
          </Tabs>
        </div>

        <div className="order-content">
          {/* 统计卡片区 */}
          {activeTab === 'all' && (
            <Row gutter={[16, 16]} className="stat-grid">
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card--blue" bordered={false}>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: '#e6f4ff' }}>
                      <FileTextOutlined style={{ fontSize: 22, color: '#1677ff' }} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-title">当前订单数</div>
                      <div className="stat-value">{mockOrders.length}</div>
                      <div className="stat-desc">基于当前筛选结果</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card--orange" bordered={false}>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: '#fff7e6' }}>
                      <ShoppingCartOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-title">待发货</div>
                      <div className="stat-value" style={{ color: '#fa8c16' }}>
                        {waitShipCount}
                      </div>
                      <div className="stat-desc">可继续处理发货</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card--green" bordered={false}>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: '#f6ffed' }}>
                      <PayCircleOutlined style={{ fontSize: 22, color: '#52c41a' }} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-title">实付金额汇总</div>
                      <div className="stat-value" style={{ color: '#1677ff' }}>
                        ¥{totalPayAmount.toLocaleString()}
                      </div>
                      <div className="stat-desc">当前列表订单合计</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card--red" bordered={false}>
                  <div className="stat-content">
                    <div className="stat-icon" style={{ background: '#fff2f0' }}>
                      <IssuesCloseOutlined style={{ fontSize: 22, color: '#ff4d4f' }} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-title">含售后订单</div>
                      <div className="stat-value" style={{ color: '#ff4d4f' }}>
                        {afterSaleCount}
                      </div>
                      <div className="stat-desc">需持续关注售后进度</div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {activeTab === 'exception' && (
            <div className="exception-alert">
              <ExclamationCircleOutlined />
              <span>
                当前有 <strong>{exceptionCount}</strong> 笔异常订单待处理，请及时跟进付款超时、发货延迟或库存短缺问题
              </span>
            </div>
          )}

          {/* 搜索筛选区 */}
          <div className="search-panel">
            <Form layout="vertical">
              <Row gutter={16} align="bottom">
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="订单号" style={{ marginBottom: 12 }}>
                    <Input
                      placeholder="请输入订单号"
                      value={searchForm.orderNo}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, orderNo: e.target.value })
                      }
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="买家手机号" style={{ marginBottom: 12 }}>
                    <Input
                      placeholder="请输入买家手机号"
                      value={searchForm.buyerPhone}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, buyerPhone: e.target.value })
                      }
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="订单状态" style={{ marginBottom: 12 }}>
                    <Select
                      placeholder="请选择订单状态"
                      style={{ width: '100%' }}
                      value={searchForm.status}
                      onChange={(value) =>
                        setSearchForm({ ...searchForm, status: value })
                      }
                      allowClear
                    >
                      {Object.entries(ORDER_STATUS_MAP).map(([key, { text }]) => (
                        <Select.Option key={key} value={key}>
                          {text}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="渠道" style={{ marginBottom: 12 }}>
                    <Select
                      placeholder="请选择渠道"
                      style={{ width: '100%' }}
                      value={searchForm.channel}
                      onChange={(value) =>
                        setSearchForm({ ...searchForm, channel: value })
                      }
                      allowClear
                    >
                      <Select.Option value="APP">APP</Select.Option>
                      <Select.Option value="MINI_APP">小程序</Select.Option>
                      <Select.Option value="PC">PC端</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {searchExpanded && (
                <Row gutter={16} align="bottom">
                  <Col xs={24} md={10} lg={8}>
                    <Form.Item label="下单时间" style={{ marginBottom: 12 }}>
                      <RangePicker
                        style={{ width: '100%' }}
                        value={searchForm.timeRange}
                        onChange={(dates) =>
                          setSearchForm({ ...searchForm, timeRange: dates as any })
                        }
                        placeholder={['开始时间', '结束时间']}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row>
                <Col span={24}>
                  <div className="search-actions">
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                      搜索
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                    <Button
                      type="link"
                      icon={searchExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => setSearchExpanded(!searchExpanded)}
                    >
                      {searchExpanded ? '收起' : '更多筛选'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>

          {/* 工具栏 */}
          <div className="toolbar">
            <div className="toolbar-info">
              共 <strong>{filteredOrders.length}</strong> 条订单
              {selectedRows.length > 0 && (
                <>，已选中 <strong>{selectedRows.length}</strong> 条</>
              )}
            </div>
            <div className="toolbar-actions">
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出 CSV
              </Button>
              <Button
                type="primary"
                icon={<CarOutlined />}
                disabled={selectedRows.length === 0}
                onClick={handleBatchShip}
              >
                批量发货
                {selectedRows.length > 0 && ` (${selectedRows.length})`}
              </Button>
            </div>
          </div>

          {/* 订单表格 */}
          <div className="order-table-wrap">
            <Table<Order>
              rowKey="orderNo"
              columns={columns}
              dataSource={filteredOrders}
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={handleTableChange}
              rowSelection={{
                selectedRowKeys: selectedRows.map((r) => r.orderNo),
                onChange: (_, rows) => setSelectedRows(rows),
              }}
              rowClassName={getRowClassName}
              onRow={(record) => ({ style: getRowStyle(record) })}
              scroll={{ x: 1500 }}
              size="middle"
            />
          </div>
        </div>
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title={null}
        width={800}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        className="order-detail-drawer"
      >
        {currentOrder && (
          <>
            <div className="detail-header-banner">
              <div className="order-no-large">{currentOrder.orderNo}</div>
              <div className="detail-header-meta">
                <Tag color={ORDER_STATUS_MAP[currentOrder.status].color}>
                  {ORDER_STATUS_MAP[currentOrder.status].text}
                </Tag>
                <span>{currentOrder.createTime}</span>
                <span>{CHANNEL_MAP[currentOrder.channel].text}</span>
                <span>买家：{currentOrder.buyerNick}</span>
              </div>
            </div>

            <div className="detail-actions">
              <Space wrap>
                {currentOrder.status === 'WAIT_SHIP' && (
                  <>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenPriceModal(currentOrder)}>
                      改价
                    </Button>
                    <Button type="primary" icon={<CarOutlined />} onClick={() => handleOpenShipModal(currentOrder)}>
                      发货
                    </Button>
                  </>
                )}
                {(currentOrder.status === 'WAIT_SHIP' || currentOrder.status === 'SHIPPED') && (
                  <Button icon={<DollarOutlined />} onClick={() => handleOpenRefundModal(currentOrder)}>
                    退款
                  </Button>
                )}
                {currentOrder.status !== 'COMPLETED' && currentOrder.status !== 'CLOSED' && (
                  <Button danger icon={<CloseOutlined />} onClick={() => handleOpenCloseModal(currentOrder)}>
                    关闭订单
                  </Button>
                )}
                <Button icon={<CommentOutlined />} onClick={() => handleOpenRemarkModal(currentOrder)}>
                  添加备注
                </Button>
              </Space>
            </div>

            <div className="detail-body">
              <div className="detail-section">
                <div className="section-title">基本信息</div>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="买家">{currentOrder.buyerNick}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{currentOrder.buyerPhone}</Descriptions.Item>
                  <Descriptions.Item label="收货人">{currentOrder.receiverName}</Descriptions.Item>
                  <Descriptions.Item label="收货电话">{currentOrder.receiverPhone}</Descriptions.Item>
                  <Descriptions.Item label="收货地址" span={2}>
                    {currentOrder.receiverAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付方式">{currentOrder.payMethod}</Descriptions.Item>
                  <Descriptions.Item label="备注">{currentOrder.remark || '-'}</Descriptions.Item>
                </Descriptions>
              </div>

              <div className="detail-section">
                <div className="section-title">商品列表</div>
                <Table
                  dataSource={currentOrder.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                >
                  <Table.Column
                    title="商品"
                    render={(_, record: OrderItem) => (
                      <Space>
                        <Image
                          src={record.image}
                          width={48}
                          height={48}
                          style={{ borderRadius: 6, border: '1px solid #f0f0f0' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500 }}>{record.title}</div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.spec}
                          </Text>
                        </div>
                      </Space>
                    )}
                  />
                  <Table.Column title="单价" dataIndex="price" render={(v) => `¥${v.toFixed(2)}`} />
                  <Table.Column title="数量" dataIndex="quantity" />
                  <Table.Column title="小计" dataIndex="subtotal" render={(v) => `¥${v.toFixed(2)}`} />
                  <Table.Column
                    title="优惠"
                    dataIndex="discount"
                    render={(v) => (v > 0 ? `-¥${v.toFixed(2)}` : '-')}
                  />
                </Table>
              </div>

              <div className="detail-section">
                <div className="section-title">费用明细</div>
                <div className="fee-summary">
                  <Row justify="end">
                    <Col span={10}>
                      <div className="fee-row">
                        <span>商品总额</span>
                        <span>¥{currentOrder.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}</span>
                      </div>
                      <div className="fee-row">
                        <span>优惠</span>
                        <span>-¥{currentOrder.discount.toFixed(2)}</span>
                      </div>
                      <div className="fee-row">
                        <span>运费</span>
                        <span>¥{currentOrder.freight.toFixed(2)}</span>
                      </div>
                      <Divider style={{ margin: '10px 0' }} />
                      <div className="fee-row total">
                        <span>实付金额</span>
                        <span className="total-amount">¥{currentOrder.payAmount.toFixed(2)}</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">物流信息</div>
                {currentOrder.logistics ? (
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="物流公司">{currentOrder.logistics.company}</Descriptions.Item>
                    <Descriptions.Item label="快递单号">
                      <Text copyable>{currentOrder.logistics.trackingNo}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="发货时间" span={2}>
                      {currentOrder.logistics.shipTime}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="未发货" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>

              <div className="detail-section">
                <div className="section-title">售后记录</div>
                {currentOrder.afterSales && currentOrder.afterSales.length > 0 ? (
                  <Table
                    dataSource={currentOrder.afterSales}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  >
                    <Table.Column title="售后单号" dataIndex="id" />
                    <Table.Column
                      title="类型"
                      dataIndex="type"
                      render={(v) =>
                        ({ REFUND: '退款', RETURN: '退货', EXCHANGE: '换货' }[v] || v)
                      }
                    />
                    <Table.Column title="状态" dataIndex="status" />
                    <Table.Column title="申请时间" dataIndex="applyTime" />
                    <Table.Column title="金额" dataIndex="amount" render={(v) => `¥${v.toFixed(2)}`} />
                    <Table.Column title="操作" render={() => <Button type="link">查看</Button>} />
                  </Table>
                ) : (
                  <Empty description="暂无售后记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* 发货弹窗 */}
      <Modal
        title="订单发货"
        open={shipModalVisible}
        onOk={handleShipSubmit}
        onCancel={() => setShipModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <Form layout="vertical">
          <Form.Item label="物流公司" required>
            <Select
              placeholder="请选择物流公司"
              value={shipForm.company}
              onChange={(v) => setShipForm({ ...shipForm, company: v })}
            >
              <Select.Option value="顺丰速运">顺丰速运</Select.Option>
              <Select.Option value="中通快递">中通快递</Select.Option>
              <Select.Option value="圆通快递">圆通快递</Select.Option>
              <Select.Option value="申通快递">申通快递</Select.Option>
              <Select.Option value="韵达快递">韵达快递</Select.Option>
              <Select.Option value="京东物流">京东物流</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="快递单号" required>
            <Input
              placeholder="请输入快递单号"
              value={shipForm.trackingNo}
              onChange={(e) => setShipForm({ ...shipForm, trackingNo: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 改价弹窗 */}
      <Modal
        title="订单改价"
        open={priceModalVisible}
        onOk={handlePriceSubmit}
        onCancel={() => setPriceModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <Form layout="vertical">
          <Form.Item label="当前实付金额">
            <Input value={`¥${currentOrder?.payAmount.toFixed(2)}`} disabled />
          </Form.Item>
          <Form.Item label="成本金额">
            <Input value={`¥${currentOrder?.orderCostTotal?.toFixed(2) || '0.00'}`} disabled />
          </Form.Item>
          <Form.Item label="新实付金额" required>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              value={newPrice}
              onChange={(v) => setNewPrice(v || 0)}
              prefix="¥"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退款弹窗 */}
      <Modal
        title="订单退款"
        open={refundModalVisible}
        onOk={handleRefundSubmit}
        onCancel={() => setRefundModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <Form layout="vertical">
          <Form.Item label="可退金额">
            <Input value={`¥${currentOrder?.payAmount.toFixed(2)}`} disabled />
          </Form.Item>
          <Form.Item label="退款金额" required>
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              max={currentOrder?.payAmount}
              precision={2}
              value={refundAmount}
              onChange={(v) => setRefundAmount(v || 0)}
              prefix="¥"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 关闭订单弹窗 */}
      <Modal
        title="关闭订单"
        open={closeModalVisible}
        onOk={handleCloseSubmit}
        onCancel={() => setCloseModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <p>确定要关闭订单 {currentOrder?.orderNo} 吗？</p>
        <p>关闭后订单将无法恢复，请谨慎操作。</p>
      </Modal>

      {/* 备注弹窗 */}
      <Modal
        title="添加备注"
        open={remarkModalVisible}
        onOk={handleRemarkSubmit}
        onCancel={() => setRemarkModalVisible(false)}
        confirmLoading={modalLoading}
      >
        <TextArea
          rows={4}
          placeholder="请输入备注内容"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
};

// ==================== 主组件 ====================

const Component: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'order' | 'product' | 'inventory'>('order');

  const menuItems = [
    {
      key: 'order',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
    },
    {
      key: 'product',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
    },
  ];

  return (
    <div className="order-app">
      <aside className="order-app-sidebar">
        <div className="order-app-brand">
          <h1 className="order-app-brand-title">电商后台</h1>
          <p className="order-app-brand-desc">运营管理平台</p>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeModule]}
          items={menuItems}
          onClick={({ key }) => setActiveModule(key as 'order' | 'product' | 'inventory')}
        />
      </aside>

      <main className="order-app-main">
        {activeModule === 'order' && <OrderManagement />}
        {activeModule === 'product' && <ProductManagement />}
        {activeModule === 'inventory' && <InventoryManagement />}
      </main>
    </div>
  );
};

export default Component;
