# 库存管理页面

## 📋 业务与功能

### 1.1 核心目标
为仓储管理人员提供一个功能完善的库存管理界面，支持库存查询、预警监控、单据管理和盘点操作。通过实时库存数据展示和智能预警，提升库存管理效率，降低库存风险。

### 1.2 功能清单

**Header 区域**
- **[P0] 页面标题**: 库存管理
- **[P0] 快捷按钮**: 新建入库、出库、调拨、盘点四个按钮
- **[P0] 搜索过滤**: SKU、仓库、类目、库存状态、更新时间区间

**Summary Cards**
- **[P0] 库存概览**: 显示总库存、可售、在途、冻结（数字带千分位）
- **[P0] 库存预警**: 列出低于阈值的前 10 条 SKU（展示 SKU 名、仓库、可售、阈值）
- **[P0] 7 天库存波动**: 折线图（X 轴日期，Y 轴库存变动）

**Tabs 内容**
- **[P0] 库存明细 Tab**: 
  - 表格列：复选框、SKU、商品标题、规格、条码、仓库、可售、在途、冻结、总库存、成本价、库存价值、预警阈值、操作（编辑阈值、调拨、盘点）
  - 支持分页、排序、批量编辑阈值
- **[P0] 单据列表 Tab**: 
  - 表格列：单号、类型、关联仓库、SKU 汇总、数量、状态、创建时间、操作（查看、作废）
  - 类型包括：入库、出库、调拨
- **[P0] 盘点记录 Tab**: 
  - 表格列：盘点单号、仓库、盘点人、盘点时间、差异 SKU 数、状态、操作（查看、确认）

**新建入库单 Modal**
- **[P0] 单据类型**: 固定为 `INBOUND`（不可更改）
- **[P0] 必填字段**: 仓库（Select）、SKU 列表（可搜索的多选下拉）、每个 SKU 对应的实际到货数量（正整数）
- **[P1] 可选字段**: 批次号、有效期（若填写必须是未来日期）、附件（图片/PDF，最多 3 份，每份 ≤ 5MB）
- **[P0] 保存按钮**: "保存草稿（DRAFT）" 与 "确认入库（CONFIRMED）"
- **[P0] 提交后**: 调用 `/api/v1/inventory/documents`（POST），返回单号后自动刷新库存明细表

### 1.3 交互要点

- **全局 Loading**: 数据加载时显示 loading 状态
- **错误 Toast**: 接口错误时显示错误提示
- **成功 Message**: 操作成功时显示成功提示
- **分页参数**: page, pageSize
- **阈值编辑**: 点击编辑阈值打开弹窗，可修改预警阈值
- **调拨操作**: 点击调拨打开调拨单创建弹窗
- **盘点操作**: 点击盘点打开盘点单创建弹窗

---

## 📊 内容规划

### 2.1 信息架构

```
库存管理页面
├── Header 区域
│   ├── 页面标题
│   ├── 快捷按钮（新建入库、出库、调拨、盘点）
│   └── 搜索过滤（SKU、仓库、类目、库存状态、更新时间区间）
├── Summary Cards
│   ├── 库存概览 Card
│   │   ├── 总库存
│   │   ├── 可售
│   │   ├── 在途
│   │   └── 冻结
│   ├── 库存预警 Card
│   │   └── 低于阈值的 SKU 列表（前 10 条）
│   └── 7 天库存波动 Card
│       └── 折线图
├── Tabs 区域
│   ├── 库存明细 Tab
│   │   └── 库存明细表格
│   ├── 单据列表 Tab
│   │   └── 单据列表表格
│   └── 盘点记录 Tab
│       └── 盘点记录表格
└── 分页器

新建入库单 Modal
├── 单据类型（固定 INBOUND）
├── 仓库选择（Select）
├── SKU 列表（多选下拉 + 数量输入）
├── 批次号（可选）
├── 有效期（可选，未来日期）
├── 附件上传（最多 3 份，每份 ≤ 5MB）
└── 操作按钮（保存草稿、确认入库）
```

### 2.2 数据字段

**库存明细数据**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 库存ID |
| sku | string | SKU编码 |
| productTitle | string | 商品标题 |
| spec | string | 规格 |
| barcode | string | 条码 |
| warehouse | string | 仓库 |
| availableStock | number | 可售库存 |
| inTransitStock | number | 在途库存 |
| frozenStock | number | 冻结库存 |
| totalStock | number | 总库存 |
| costPrice | number | 成本价 |
| stockValue | number | 库存价值 |
| warningThreshold | number | 预警阈值 |

**单据数据**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 单据ID |
| documentNo | string | 单号 |
| type | string | 类型：入库/出库/调拨 |
| warehouse | string | 关联仓库 |
| skuSummary | string | SKU 汇总 |
| quantity | number | 数量 |
| status | string | 状态：草稿/已确认/已作废 |
| createTime | string | 创建时间 |

**盘点记录数据**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 盘点单ID |
| documentNo | string | 盘点单号 |
| warehouse | string | 仓库 |
| operator | string | 盘点人 |
| inventoryTime | string | 盘点时间 |
| diffSkuCount | number | 差异 SKU 数 |
| status | string | 状态：待确认/已确认 |

---

## 🎨 视觉设计

### 3.1 布局

- **页面布局**: 标准后台管理布局，左侧导航 + 右侧内容区
- **Summary Cards**: 顶部三列布局，每张 Card 占 1/3 宽度
- **图表**: 7 天库存波动使用折线图，高度 200px
- **Tabs**: 占据主要内容区，固定表头
- **Modal**: 新建入库单使用 Modal，宽度 600px

### 3.2 样式规范

- **颜色**: 使用 Ant Design 默认主题色
- **字体**: 系统默认字体，表格内容 14px
- **间距**: 遵循 Ant Design 的 8px 网格系统
- **Card**: 圆角 8px，阴影效果

### 3.3 交互状态

- **行悬浮**: 背景色变化，显示操作按钮
- **选中态**: 复选框选中，批量操作按钮激活
- **加载态**: 表格骨架屏，按钮 loading 状态
- **空状态**: 无数据时显示 Empty 组件

---

## 🔌 接口约定

### 4.1 库存明细列表
- **GET** `/api/v1/inventory/detail`
- **参数**: page, pageSize, sku, warehouse, category, status, startTime, endTime
- **返回**: 库存明细列表 + 分页信息

### 4.2 库存概览
- **GET** `/api/v1/inventory/overview`
- **返回**: 总库存、可售、在途、冻结数量

### 4.3 库存预警列表
- **GET** `/api/v1/inventory/warnings`
- **参数**: limit（默认 10）
- **返回**: 低于阈值的 SKU 列表

### 4.4 库存波动数据
- **GET** `/api/v1/inventory/fluctuation`
- **参数**: days（默认 7）
- **返回**: 日期和库存变动数据

### 4.5 单据列表
- **GET** `/api/v1/inventory/documents`
- **参数**: page, pageSize, type, status
- **返回**: 单据列表 + 分页信息

### 4.6 创建单据
- **POST** `/api/v1/inventory/documents`
- **参数**: 单据完整信息
- **返回**: 创建成功的单据信息

### 4.7 盘点记录列表
- **GET** `/api/v1/inventory/inventory-records`
- **参数**: page, pageSize, warehouse, status
- **返回**: 盘点记录列表 + 分页信息

### 4.8 更新预警阈值
- **PUT** `/api/v1/inventory/warning-threshold/{id}`
- **参数**: threshold
- **返回**: 更新后的库存信息
