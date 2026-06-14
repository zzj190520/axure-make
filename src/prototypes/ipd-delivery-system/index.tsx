/**
 * @name IPD交付物管理系统
 *
 * 企微端小程序，包含交付物列表、项目管理和我的三个模块。
 */

import './style.css';
import React, { useState } from 'react';
import {
  SearchOutlined,
  LeftOutlined,
  CloseOutlined,
  MoreOutlined,
  FileTextOutlined,
  ProjectOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Input, Tag, Avatar, Modal, message } from 'antd';

interface DeliveryItem {
  id: string;
  name: string;
  code: string;
  phase: string;
  creator: string;
  createTime: string;
  status: string;
  statusColor: string;
}

interface ProjectItem {
  id: string;
  name: string;
  code: string;
  status: string;
  description: string;
  creator: string;
  createTime: string;
}

interface UserInfo {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  avatar: string;
}

interface DeliveryDetail {
  id: string;
  name: string;
  creator: string;
  creatorId: string;
  department: string;
  createTime: string;
  status: string;
  phase: string;
  projectCode: string;
  projectNumber: string;
  templateCode: string;
  abbreviation: string;
  businessType: string;
  fileNumber: string;
  version: string;
  fileType: string;
  fileStatus: string;
  compileDate: string;
  revisionReason: string;
  changeReport: string;
  attachment: string;
  summary: string;
  reviewer: string;
  signatory: string;
  approver: string;
  cc: string;
}

const Component: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'delivery' | 'project' | 'profile'>('delivery');
  const [deliveryStatus, setDeliveryStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDetail | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'form' | 'flow' | 'record'>('form');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newDeliveryName, setNewDeliveryName] = useState('');
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchCurrentX, setTouchCurrentX] = useState<number>(0);

  const [deliveryList, setDeliveryList] = useState<DeliveryItem[]>([
    {
      id: '1',
      name: '总成PPAP',
      code: '',
      phase: 'TR6',
      creator: '姜景文',
      createTime: '2026-03-09 15:54:59',
      status: '会签',
      statusColor: '#fa8c16',
    },
    {
      id: '2',
      name: '更新版质量目标（可选）',
      code: 'LS-QM-BX-0016-01',
      phase: 'TR1',
      creator: '徐根',
      createTime: '2026-03-09 17:04:01',
      status: '归档',
      statusColor: '#52c41a',
    },
    {
      id: '3',
      name: 'MRD-市场需求文档及评审记录',
      code: 'LS-RD-BX-0015-01',
      phase: 'K0',
      creator: '江智超',
      createTime: '2026-03-05 18:42:09',
      status: '审核',
      statusColor: '#fa8c16',
    },
    {
      id: '4',
      name: 'QFD',
      code: 'LS-RD-BX-0015-17',
      phase: 'TR1',
      creator: '谢普阳',
      createTime: '2026-03-06 11:34:37',
      status: '归档',
      statusColor: '#52c41a',
    },
    {
      id: '5',
      name: '初始BOM',
      code: 'LS-C02-RD-W03-03',
      phase: 'TR1',
      creator: '谢普阳',
      createTime: '2026-03-09 09:21:02',
      status: '归档',
      statusColor: '#52c41a',
    },
    {
      id: '6',
      name: '竞品分析报告',
      code: 'LS-RD-BX-0015-15',
      phase: 'K0',
      creator: '谢普阳',
      createTime: '2026-03-09 09:21:02',
      status: '文件创建',
      statusColor: '#d9d9d9',
    },
  ]);

  const projectList: ProjectItem[] = [
    {
      id: '1',
      name: 'LS220DM1',
      code: 'LS00129',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '李泽世',
      createTime: '2026-03-11 10:09:15',
    },
    {
      id: '2',
      name: 'LSD06AH1',
      code: 'LS00089',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '程世伟',
      createTime: '2026-03-11 20:12:43',
    },
    {
      id: '3',
      name: 'LS220EH5',
      code: 'LS00128',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '赵泓洋',
      createTime: '2026-03-12 09:48:26',
    },
    {
      id: '4',
      name: 'LSD06AM1',
      code: 'LS00088',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '胡世鹜',
      createTime: '2026-03-11 20:12:43',
    },
    {
      id: '5',
      name: 'LS220DH1',
      code: 'LS00039',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '程世伟',
      createTime: '2026-03-11 20:12:43',
    },
    {
      id: '6',
      name: 'LSD06AM1',
      code: 'LS00088',
      status: '在研',
      description: '供应给零跑内部车型项目',
      creator: '程世伟',
      createTime: '2026-03-11 20:12:43',
    },
  ];

  const userInfo: UserInfo = {
    id: '1',
    employeeId: '38427',
    name: '郑志军',
    department: '大数据部门',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDM1QzI4LjI4NDMxNCAzNSAzNSAyOC4yODQzMSAzNSAyMlMyOC4yODQzMSA5IDIwIDkgOSAyOC4yODQzMSA5IDMyIDI4LjI4NDMxNCAzMiAyMCAzMlY4SDQwVjMyQzQwIDI4LjI4NDMxNCAzNS43MTU2ODcgMjUgMzIgMjVDMjguMjg0MzE0IDI1IDI1IDI4LjI4NDMxNCAyNSAzMlMyOC4yODQzMSAzNSAyMCAzNVoiIGZpbGw9IiM0MDlhZmYiIGZpbGwtb3BhY2l0eT0iMC42Ii8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPg==',
  };

  // 新增交付物
  const handleAddDelivery = () => {
    if (!newDeliveryName.trim()) {
      message.error('请输入交付物名称');
      return;
    }
    const newDelivery: DeliveryItem = {
      id: Date.now().toString(),
      name: newDeliveryName,
      code: '',
      phase: 'TR1',
      creator: userInfo.name,
      createTime: new Date().toLocaleString('zh-CN'),
      status: '文件创建',
      statusColor: '#d9d9d9',
    };
    setDeliveryList([newDelivery, ...deliveryList]);
    setNewDeliveryName('');
    setIsAddModalVisible(false);
    message.success('新增成功');
  };

  // 删除交付物
  const handleDeleteDelivery = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个交付物吗？',
      onOk: () => {
        setDeliveryList(deliveryList.filter(item => item.id !== id));
        setSwipedItemId(null);
        message.success('删除成功');
      },
    });
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: string) => {
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;
    setTouchCurrentX(currentX);
    
    if (diff > 50) {
      setSwipedItemId(itemId);
    } else if (diff < -50) {
      setSwipedItemId(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(0);
    setTouchCurrentX(0);
  };

  // 交付物列表模块
  const renderDeliveryList = () => (
    <div className="delivery-list">
      {/* 顶部导航栏 */}
      <div className="nav-header">
        <div className="nav-left">
          <LeftOutlined />
          <CloseOutlined />
        </div>
        <div className="nav-title">IPD交付物管理系统</div>
        <div className="nav-right">
          <MoreOutlined />
        </div>
      </div>

      {/* 状态筛选 */}
      <div className="filter-tabs">
        <div
          className={`filter-tab ${deliveryStatus === 'all' ? 'active' : ''}`}
          onClick={() => setDeliveryStatus('all')}
        >
          全部 {deliveryList.length}
        </div>
        <div
          className={`filter-tab ${deliveryStatus === 'todo' ? 'active' : ''}`}
          onClick={() => setDeliveryStatus('todo')}
        >
          待办 0
        </div>
        <div
          className={`filter-tab ${deliveryStatus === 'done' ? 'active' : ''}`}
          onClick={() => setDeliveryStatus('done')}
        >
          已办 0
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <Input
            placeholder="请输入交付物名称"
            bordered={false}
            className="search-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className="add-btn" onClick={() => setIsAddModalVisible(true)}>
          <PlusOutlined />
        </div>
      </div>

      {/* 交付物列表 */}
      <div className="item-list">
        {deliveryList.map((item) => (
          <div 
            key={item.id} 
            className="swipe-container"
            onTouchStart={(e) => handleTouchStart(e)}
            onTouchMove={(e) => handleTouchMove(e, item.id)}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className={`swipe-content ${swipedItemId === item.id ? 'swiped' : ''}`}
              onClick={() => {
                if (swipedItemId === item.id) {
                  setSwipedItemId(null);
                  return;
                }
                // 模拟详情数据
                const detailData: DeliveryDetail = {
                  id: item.id,
                  name: item.name,
                  creator: item.creator,
                  creatorId: '46117',
                  department: '电驱项目质量组',
                  createTime: '2026-03-09 14:55:02',
                  status: item.status,
                  phase: item.phase,
                  projectCode: 'LS220DH1',
                  projectNumber: 'LS00039',
                  templateCode: '',
                  abbreviation: 'PPA',
                  businessType: 'QM',
                  fileNumber: 'LS00039-PPA-QM-0002',
                  version: '1.0',
                  fileType: '质量管理',
                  fileStatus: '首次发布',
                  compileDate: '2026-03-09',
                  revisionReason: '其它',
                  changeReport: '',
                  attachment: 'https://ls-...',
                  summary: 'TR6阀点交付物',
                  reviewer: '徐红霞(24660)',
                  signatory: '赵妮(43017), 王扬武(39778)',
                  approver: '及非凡(10473)',
                  cc: '及非凡(10473)',
                };
                setSelectedDelivery(detailData);
              }}
            >
              <div className="item-card">
                <div className="item-header">
                  <h4 className="item-name">{item.name}</h4>
                  <Tag
                    className="status-tag"
                    style={{
                      backgroundColor: item.statusColor,
                      color: '#fff',
                      border: 'none',
                    }}
                  >
                    {item.status}
                  </Tag>
                </div>
                <div className="item-meta">
                  <span className="item-code">{item.code ? item.code : ''} {item.phase ? `| ${item.phase}` : ''}</span>
                </div>
                <div className="item-footer">
                  <span className="item-creator">{item.creator}</span>
                  <span className="item-time">{item.createTime}</span>
                </div>
              </div>
            </div>
            <div 
              className="swipe-delete"
              onClick={() => handleDeleteDelivery(item.id)}
            >
              <DeleteOutlined />
              <span>删除</span>
            </div>
          </div>
        ))}
      </div>

      {/* 新增弹窗 */}
      <Modal
        title="新增交付物"
        open={isAddModalVisible}
        onOk={handleAddDelivery}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewDeliveryName('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <Input
          placeholder="请输入交付物名称"
          value={newDeliveryName}
          onChange={(e) => setNewDeliveryName(e.target.value)}
          onPressEnter={handleAddDelivery}
        />
      </Modal>
    </div>
  );

  // 项目管理模块
  const renderProjectList = () => (
    <div className="project-list">
      {/* 顶部导航栏 */}
      <div className="nav-header">
        <div className="nav-left">
          <LeftOutlined />
          <CloseOutlined />
        </div>
        <div className="nav-title">IPD交付物管理系统</div>
        <div className="nav-right">
          <MoreOutlined />
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <SearchOutlined className="search-icon" />
        <Input
          placeholder="请输入项目名称"
          bordered={false}
          className="search-input"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {/* 项目列表 */}
      <div className="item-list">
        {projectList.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <h4 className="item-name">{item.name}</h4>
            </div>
            <div className="item-meta">
              <span className="item-code">{item.code} | {item.status} | {item.description}</span>
            </div>
            <div className="item-footer">
              <span className="item-creator">{item.creator}</span>
              <span className="item-time">{item.createTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 我的模块
  const renderProfile = () => (
    <div className="profile">
      {/* 顶部导航栏 */}
      <div className="nav-header">
        <div className="nav-left">
          <LeftOutlined />
          <CloseOutlined />
        </div>
        <div className="nav-title">IPD交付物管理系统</div>
        <div className="nav-right">
          <MoreOutlined />
        </div>
      </div>

      {/* 用户信息 */}
      <div className="user-info">
        <Avatar size={80} src={userInfo.avatar} className="user-avatar" />
        <div className="user-details">
          <div className="user-name">{userInfo.name}</div>
          <div className="user-id">工号：{userInfo.employeeId}</div>
          <div className="user-department">部门：{userInfo.department}</div>
        </div>
      </div>
    </div>
  );

  // 交付物详情页面
  const renderDeliveryDetail = () => {
    if (!selectedDelivery) return null;

    const detailData = selectedDelivery;

    const renderFormTab = () => (
      <div className="detail-content">
        {/* 所有字段整合到一个卡片 */}
        <div className="detail-section">
          <div className="section-content">
            {/* 基本信息 - 禁止编辑 */}
            <div className="info-row disabled">
              <span className="info-label">创建人</span>
              <span className="info-value">{detailData.creator}</span>
            </div>
            <div className="info-row disabled">
              <span className="info-label">创建人工号</span>
              <span className="info-value">{detailData.creatorId}</span>
            </div>
            <div className="info-row disabled">
              <span className="info-label">所在部门</span>
              <span className="info-value">{detailData.department}</span>
            </div>
            <div className="info-row disabled">
              <span className="info-label">创建时间</span>
              <span className="info-value">{detailData.createTime}</span>
            </div>
            <div className="info-row disabled">
              <span className="info-label">流程状态</span>
              <span className="info-value">{detailData.status}</span>
            </div>
            {/* 交付物信息 */}
            <div className="info-row required">
              <span className="info-label">交付物名称</span>
              <span className="info-value">{detailData.name}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">起始阶段</span>
              <span className="info-value">{detailData.phase}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">项目代号</span>
              <span className="info-value">{detailData.projectCode}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">项目编号</span>
              <span className="info-value">{detailData.projectNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">模板编号</span>
              <span className="info-value">{detailData.templateCode || '\\'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">交付物缩写</span>
              <span className="info-value">{detailData.abbreviation}</span>
            </div>
            <div className="info-row">
              <span className="info-label">业务类型</span>
              <span className="info-value">{detailData.businessType}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">文件编号</span>
              <span className="info-value">{detailData.fileNumber}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">版本</span>
              <span className="info-value">{detailData.version}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">文件类型</span>
              <span className="info-value">{detailData.fileType}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">文件状态</span>
              <span className="info-value">{detailData.fileStatus}</span>
            </div>
            <div className="info-row">
              <span className="info-label">编制日期</span>
              <span className="info-value">{detailData.compileDate}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">新增/修订原因</span>
              <span className="info-value">{detailData.revisionReason}</span>
            </div>
            {/* 变更报告 */}
            <div className="info-row">
              <span className="info-label">变更报告</span>
              <span className="info-value">{detailData.changeReport || '-'}</span>
            </div>
            {/* 附件 */}
            <div className="info-row">
              <span className="info-label">附件</span>
              <span className="info-value attachment-link">{detailData.attachment}</span>
            </div>
            {/* 内容摘要 */}
            <div className="info-row required">
              <span className="info-label">内容摘要</span>
              <span className="info-value">{detailData.summary}</span>
            </div>
            {/* 审核信息 */}
            <div className="info-row required">
              <span className="info-label">审核人</span>
              <span className="info-value">{detailData.reviewer}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">会签人</span>
              <span className="info-value">{detailData.signatory}</span>
            </div>
            <div className="info-row required">
              <span className="info-label">批准人</span>
              <span className="info-value">{detailData.approver}</span>
            </div>
            <div className="info-row">
              <span className="info-label">抄送人</span>
              <span className="info-value">{detailData.cc}</span>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="delivery-detail">
        {/* 顶部导航栏 */}
        <div className="nav-header">
          <div className="nav-left">
            <LeftOutlined />
            <CloseOutlined />
          </div>
          <div className="nav-title">IPD交付物管理系统</div>
          <div className="nav-right">
            <MoreOutlined />
          </div>
        </div>

        {/* 二级导航栏 */}
        <div className="sub-nav-header">
          <div className="sub-nav-left" onClick={() => setSelectedDelivery(null)}>
            <LeftOutlined />
          </div>
          <div className="sub-nav-title">问题处理流程</div>
          <div className="sub-nav-right"></div>
        </div>

        {/* 标签页 */}
        <div className="detail-tabs">
          <div
            className={`detail-tab ${activeDetailTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('form')}
          >
            流程表单
          </div>
          <div
            className={`detail-tab ${activeDetailTab === 'flow' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('flow')}
          >
            流程图
          </div>
          <div
            className={`detail-tab ${activeDetailTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('record')}
          >
            流程记录
          </div>
        </div>

        {/* 内容区域 */}
        <div className="detail-main-content">
          {activeDetailTab === 'form' && renderFormTab()}
          {activeDetailTab === 'flow' && (
            <div className="detail-content">
              <div className="placeholder-content">流程图内容</div>
            </div>
          )}
          {activeDetailTab === 'record' && (
            <div className="detail-content">
              <div className="placeholder-content">流程记录内容</div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="detail-footer">
          <button className="detail-btn detail-btn-reject">驳回</button>
          <button className="detail-btn detail-btn-save">保存</button>
          <button className="detail-btn detail-btn-pass">通过</button>
        </div>
      </div>
    );
  };

  return (
    <div className="wechat-mini-app">
      {/* 状态栏 */}
      <div className="status-bar">
        <span className="time">10:36</span>
        <div className="status-icons">
          <span className="signal">📶</span>
          <span className="wifi">📡</span>
          <span className="battery">81%</span>
        </div>
      </div>

      {selectedDelivery ? (
        /* 详情页面 - 不显示底部导航 */
        renderDeliveryDetail()
      ) : (
        <>
          {/* 列表页面 */}
          <div className="main-content">
            {activeTab === 'delivery' && renderDeliveryList()}
            {activeTab === 'project' && renderProjectList()}
            {activeTab === 'profile' && renderProfile()}
          </div>

          {/* 底部导航 - 只在列表页面显示 */}
          <div className="bottom-nav">
            <div
              className={`nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              <FileTextOutlined className="nav-icon" />
              <span className="nav-label">交付物列表</span>
            </div>
            <div
              className={`nav-item ${activeTab === 'project' ? 'active' : ''}`}
              onClick={() => setActiveTab('project')}
            >
              <ProjectOutlined className="nav-icon" />
              <span className="nav-label">项目管理</span>
            </div>
            <div
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserOutlined className="nav-icon" />
              <span className="nav-label">我的</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Component;
