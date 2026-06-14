/**
 * @name 问题管理
 *
 * 问题管理系统，支持问题的查询、筛选、状态管理等功能。
 */

import './style.css';
import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Pagination,
  message,
  Tooltip,
  Dropdown,
  Menu,
  Space,
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';

interface ProblemRecord {
  key: string;
  problemId: string;
  problemCategory: string;
  problemSubcategory: string;
  location: string;
  priority: string;
  responsibleSite: string;
  responsiblePerson: string;
  approver: string;
  approvalDepartment: string;
  points: number;
  status: string;
  hasTodo: boolean;
  todoContent: string;
}

const ProblemManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const problemCategories = ['请选择', '设备故障', '系统问题', '流程优化', '其他'];
  const priorities = ['请选择', '高', '中', '低'];

  const mockData: ProblemRecord[] = [
    {
      key: '1',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '2',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '问题处理',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '3',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '完成归档',
      hasTodo: true,
      todoContent: '设备维护问题尚未解决，需要检查设备运行状态和维护记录；安排设备维护人员检查设备；分析设备故障原因并制定解决方案',
    },
    {
      key: '4',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '5',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '6',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '7',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
    {
      key: '8',
      problemId: '1030000',
      problemCategory: '',
      problemSubcategory: '',
      location: '',
      priority: '',
      responsibleSite: '',
      responsiblePerson: '',
      approver: '',
      approvalDepartment: '',
      points: 100,
      status: '消除措施',
      hasTodo: false,
      todoContent: '',
    },
  ];

  const columns = [
    {
      title: '问题编号',
      dataIndex: 'problemId',
      key: 'problemId',
      width: 100,
    },
    {
      title: '问题大类',
      dataIndex: 'problemCategory',
      key: 'problemCategory',
      width: 120,
    },
    {
      title: '问题细分',
      dataIndex: 'problemSubcategory',
      key: 'problemSubcategory',
      width: 120,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
    },
    {
      title: '流程节点',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      width: 100,
    },
    {
      title: '申请人',
      dataIndex: 'approver',
      key: 'approver',
      width: 100,
    },
    {
      title: '申请人部门',
      dataIndex: 'approvalDepartment',
      key: 'approvalDepartment',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '消除措施':
        return 'blue';
      case '问题处理':
        return 'orange';
      case '完成归档':
        return 'green';
      default:
        return 'default';
    }
  };

  const handleAddProblem = () => {
    message.info('新增问题功能开发中');
  };

  const handleColumnSettings = () => {
    message.info('列设置功能开发中');
  };

  return (
    <div className="problem-management">
      {/* 顶部导航 */}
      <div className="problem-header">
        <div className="tabs">
          <span 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部问题
          </span>
          <span 
            className={`tab ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            我的待办
          </span>
          <span 
            className={`tab ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            我的记录
          </span>
        </div>
      </div>

      {/* 搜索筛选区域 */}
      <div className="search-area">
        <Form layout="inline" className="search-form">
          <Form.Item label="问题编号">
            <Input placeholder="请输入" size="small" />
          </Form.Item>
          <Form.Item label="问题大类">
            <Select 
              placeholder="请选择" 
              size="small" 
              style={{ width: 120 }}
            >
              {problemCategories.map((item, index) => (
                <Select.Option key={index} value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="问题细分">
            <Input placeholder="请输入" size="small" />
          </Form.Item>
          <Form.Item label="地点">
            <Select 
              placeholder="请选择" 
              size="small" 
              style={{ width: 120 }}
            >
              <Select.Option value="">请选择</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="优先级">
            <Select 
              placeholder="请选择" 
              size="small" 
              style={{ width: 100 }}
            >
              {priorities.map((item, index) => (
                <Select.Option key={index} value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="责任站点">
            <Select 
              placeholder="请选择" 
              size="small" 
              style={{ width: 120 }}
            >
              <Select.Option value="">请选择</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" size="small">
                搜索
              </Button>
              <Button size="small">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <div className="action-buttons">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="small"
            onClick={handleAddProblem}
          >
            新增
          </Button>
          <Button 
            icon={<SettingOutlined />} 
            size="small"
            onClick={handleColumnSettings}
          >
            列设置
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={mockData}
          pagination={false}
          rowClassName={(record) => record.hasTodo ? 'has-todo' : ''}
          expandable={{
            expandedRowRender: (record) => (
              <div className="todo-content">
                {record.todoContent}
              </div>
            ),
            rowExpandable: (record) => record.hasTodo,
          }}
          onRow={(record) => ({
            style: {
              position: 'relative',
            },
          })}
        />
      </div>

      {/* 分页 */}
      <div className="pagination-container">
        <div className="page-info">
          共400条记录 第{currentPage}/{Math.ceil(400 / pageSize)}页
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={400}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['20', '50', '100']}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_, size) => setPageSize(size)}
          showTotal={(total) => `共 ${total} 条`}
        />
      </div>

      {/* 右下角提示 */}
      <div className="corner-tips">
        <div className="tip-item">
          <span className="tip-label">婴儿车放置位置：</span>
          <span className="tip-value">支持折叠婴儿车：</span>
        </div>
        <div className="tip-item">
          <span className="tip-label">支持折叠婴儿车：</span>
          <span className="tip-value">支持折叠婴儿车：</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemManagement;
