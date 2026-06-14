# 问题管理页面规格文档

## 📋 页面概述

**页面名称**: 问题管理
**页面路径**: `/src/prototypes/problem-management/`
**创建时间**: 2026-03-14

### 页面描述

问题管理系统页面，支持问题的查询、筛选、状态管理、新增问题等功能，包含待办事项提示和分页功能。

---

## 🎨 视觉设计

### 配色方案

- **主色调**: 蓝色 (#1890ff)
- **背景色**: 浅灰 (#f0f2f5)
- **卡片背景**: 白色 (#ffffff)
- **文字颜色**:
  - 主标题: #333333
  - 次级文字: #666666
  - 提示文字: #ff4d4f (红色)
- **状态颜色**:
  - 消除措施: #1890ff (蓝色)
  - 问题处理: #fa8c16 (橙色)
  - 完成归档: #52c41a (绿色)
- **待办事项**: #faad14 (黄色)

### 字体规范

- **导航标签**: 14px, font-weight: 500 (激活状态)
- **表单标签**: 14px, color: #666666
- **表格文字**: 14px
- **按钮文字**: 14px
- **提示文字**: 12px

### 间距规范

- **页面内边距**: 20px
- **卡片内边距**: 16px-20px
- **表单间距**: 16px
- **表格行高**: 48px

### 圆角与阴影

- **卡片圆角**: 8px
- **按钮圆角**: 4px
- **卡片阴影**: 0 2px 8px rgba(0, 0, 0, 0.08)

---

## 📐 布局结构

### 整体布局

```
┌─────────────────────────────────────────┐
│                                   │
│        ┌─────────────────┐         │
│        │  顶部导航      │         │
│        └─────────────────┘         │
│        ┌─────────────────┐         │
│        │  搜索筛选      │         │
│        └─────────────────┘         │
│        ┌─────────────────┐         │
│        │  数据表格      │         │
│        └─────────────────┘         │
│        ┌─────────────────┐         │
│        │  分页控件      │         │
│        └─────────────────┘         │
│                                   │
│        ┌─────────────────┐         │
│        │  右下角提示    │         │
│        └─────────────────┘         │
└─────────────────────────────────────────┘
```

### 组件层级

1. **容器层** (`.problem-management`)
  - 最小高度 100vh
  - 浅灰背景 (#f0f2f5)
  - 响应式内边距
2. **导航层** (`.problem-header`)
  - 白色背景卡片
  - 导航标签（全部问题/我的待办/我的记录）
  - 激活状态下划线
3. **搜索筛选层** (`.search-area`)
  - 白色背景卡片
  - 表单搜索控件
  - 操作按钮（新增/列设置）
4. **表格层** (`.table-container`)
  - 白色背景卡片
  - 数据表格
  - 待办事项展开
5. **分页层** (`.pagination-container`)
  - 白色背景卡片
  - 分页信息
  - 分页控件
6. **提示层** (`.corner-tips`)
  - 固定定位
  - 提示信息

---

## 🔧 功能清单

### 导航功能

- [x] 全部问题标签
- [x] 我的待办标签
- [x] 我的记录标签
- [x] 标签激活状态

### 搜索筛选

- [x] 问题编号输入
- [x] 问题大类选择
- [x] 问题细分输入
- [x] 地点选择
- [x] 优先级选择
- [x] 责任站点选择
- [x] 搜索按钮
- [x] 重置按钮

### 操作功能

- [x] 新增问题按钮
- [x] 列设置按钮
- [x] 查看操作
- [x] 删除操作

### 表格功能

- [x] 问题编号列
- [x] 问题大类列
- [x] 问题细分列
- [x] 地点列
- [x] 优先级列
- [x] 流程节点列
- [x] 责任人列
- [x] 申请人列
- [x] 申请人部门列
- [x] 操作列
- [x] 待办事项展开
- [x] 状态标签

### 分页功能

- [x] 分页信息显示
- [x] 分页控件
- [x] 页码跳转
- [x] 每页显示条数选择

### 提示功能

- [x] 右下角提示信息
- [x] 待办事项提示

---

## 📱 响应式设计

### 断点设计

- **桌面端** (>1200px): 完整布局
- **平板端** (768px-1200px): 调整搜索表单布局
- **手机端** (480px-768px): 垂直布局，优化间距
- **小屏手机** (<480px): 进一步优化字体和间距

### 移动端优化

- 页面内边距: 12px
- 卡片内边距: 12px 16px
- 表单布局: 垂直排列
- 表格字体: 12px
- 提示信息: 静态显示

---

## 🔐 数据验证

### 搜索表单

```typescript
interface SearchFormData {
  problemId: string;         // 问题编号
  problemCategory: string;    // 问题大类
  problemSubcategory: string; // 问题细分
  location: string;           // 地点
  priority: string;           // 优先级
  responsibleSite: string;    // 责任站点
}
```

### 问题数据

```typescript
interface ProblemRecord {
  key: string;               // 唯一键
  problemId: string;         // 问题编号
  problemCategory: string;    // 问题大类
  problemSubcategory: string; // 问题细分
  location: string;           // 地点
  priority: string;           // 优先级
  responsibleSite: string;    // 责任站点
  responsiblePerson: string;  // 负责人
  approver: string;           // 审批人
  approvalDepartment: string; // 审批部门
  points: number;             // 点数
  status: string;             // 状态
  hasTodo: boolean;           // 是否有待办
  todoContent: string;        // 待办内容
}
```

---

## 🎯 交互说明

### 导航交互

- 点击标签切换视图
- 激活标签显示蓝色下划线
- 标签悬停变色

### 搜索交互

- 输入框支持键盘回车搜索
- 选择器支持下拉选择
- 点击搜索按钮执行搜索
- 点击重置按钮清空表单

### 表格交互

- 行悬停显示背景色
- 待办事项行左侧显示黄色标识
- 点击待办事项行展开详情
- 操作按钮悬停显示提示

### 分页交互

- 点击页码切换页面
- 输入页码直接跳转
- 选择每页显示条数

### 提示交互

- 右下角提示固定显示
- 待办事项详情展开显示

---

## 📦 组件清单

### Ant Design 组件

- `Form` - 搜索表单
- `Input` - 输入框
- `Select` - 下拉选择器
- `Button` - 按钮
- `Table` - 数据表格
- `Tag` - 状态标签
- `Pagination` - 分页控件
- `Tooltip` - 提示工具
- `Space` - 间距容器

### 自定义组件

- 无（全部使用 Ant Design 组件）

---

## 🚀 后续优化建议

### 功能增强

1. 添加问题详情页
2. 支持批量操作
3. 添加导出功能
4. 支持高级搜索
5. 添加问题统计图表

### 性能优化

1. 表格虚拟滚动
2. 搜索缓存
3. 分页数据懒加载
4. 防抖搜索

### 安全增强

1. 权限控制
2. 操作日志记录
3. 数据验证
4. 防SQL注入

---

## 📝 开发备注

### 技术栈

- React 18+
- Ant Design 5.x
- TypeScript
- Tailwind CSS 4.x

### 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 可访问性

- 支持键盘导航
- 支持屏幕阅读器
- 表单标签关联
- 错误提示清晰可见

### 性能指标

- 首屏加载时间 < 2s
- 表格渲染 < 100ms
- 搜索响应 < 500ms
- 分页切换 < 200ms

---

## 📊 数据接口

### 问题列表接口

```
GET /api/v1/problems

Params:
{
  page: number;
  pageSize: number;
  problemId?: string;
  problemCategory?: string;
  problemSubcategory?: string;
  location?: string;
  priority?: string;
  responsibleSite?: string;
}

Response:
{
  code: number;
  message: string;
  data: {
    list: ProblemRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
}
```

### 新增问题接口

```
POST /api/v1/problems

Request:
{
  problemCategory: string;
  problemSubcategory: string;
  location: string;
  priority: string;
  responsibleSite: string;
  responsiblePerson: string;
  approver: string;
  approvalDepartment: string;
  description: string;
}

Response:
{
  code: number;
  message: string;
  data: {
    problemId: string;
  };
}
```

### 删除问题接口

```
DELETE /api/v1/problems/{problemId}

Response:
{
  code: number;
  message: string;
}
```

### 问题详情接口

```
GET /api/v1/problems/{problemId}

Response:
{
  code: number;
  message: string;
  data: ProblemRecord;
}
```