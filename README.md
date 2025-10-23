# 高顿 React + Ant Design 项目

这是一个使用 React 和 Ant Design 构建的现代化 Web 应用程序。

## 技术栈

- **React 18** - 用户界面库
- **Ant Design 5** - UI 组件库
- **Vite** - 构建工具和开发服务器
- **ESLint** - 代码质量检查

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
├── public/          # 静态资源
├── src/             # 源代码
│   ├── App.jsx      # 主应用组件
│   ├── App.css      # 应用样式
│   ├── main.jsx     # 应用入口
│   └── index.css    # 全局样式
├── index.html       # HTML 模板
├── package.json     # 项目配置
├── vite.config.js   # Vite 配置
└── README.md        # 项目说明
```

## 功能特性

- 🚀 基于 Vite 的快速开发体验
- 🎨 完整的 Ant Design 组件库集成
- 📱 响应式设计，支持移动端
- 🔧 ESLint 代码质量检查
- 🎯 TypeScript 支持（可选）

## 开发指南

### 添加新组件

1. 在 `src/components` 目录下创建新组件
2. 使用 Ant Design 组件构建 UI
3. 在需要的地方导入并使用

### 样式定制

- 全局样式：修改 `src/index.css`
- 组件样式：在组件文件中使用 CSS 模块或 styled-components
- Ant Design 主题：可以通过 ConfigProvider 定制

### 路由配置

项目使用 React Router 进行路由管理，可以在 `src/App.jsx` 中配置路由。

## 部署

### 构建生产版本

```bash
npm run build
```

构建文件将生成在 `dist` 目录中。

### 生产环境部署说明 ⚠️

**重要**：本项目使用后端 PHP 代理来调用火山引擎豆包 AI 接口，避免 CORS 跨域问题。

#### 部署步骤：

1. **构建前端代码**
   ```bash
   npm run build
   ```

2. **部署文件结构**
   ```
   服务器根目录/
   ├── index.html          # 从 dist/ 复制
   ├── assets/             # 从 dist/assets/ 复制
   │   ├── *.js
   │   └── *.css
   └── api/                # PHP 代理文件
       ├── doubao-chat.php
       └── doubao-image.php
   ```

3. **服务器要求**
   - PHP 7.4 或更高版本
   - 开启 cURL 扩展
   - 支持 JSON 扩展

4. **验证部署**
   
   测试聊天接口：
   ```bash
   curl -X POST https://fuzi.gaodun.com/api/doubao-chat.php \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"hello"}]}'
   ```
   
   测试图片生成接口：
   ```bash
   curl -X POST https://fuzi.gaodun.com/api/doubao-image.php \
     -H "Content-Type: application/json" \
     -d '{"prompt":"a cat","n":1,"size":"2k"}'
   ```

#### 环境差异说明：

| 环境 | API 路径 | 处理方式 |
|------|---------|---------|
| **开发环境** | `/api/doubao-chat` | Vite proxy → 火山引擎 API |
| **生产环境** | `/api/doubao-chat.php` | PHP 文件 → 火山引擎 API |

代码会自动检测环境并使用正确的路径（见 `src/constants.js`）。

## 许可证

MIT License
