# 生产环境接口调用问题解决方案

## 🎯 问题描述

**症状**：本地开发环境可以正常调用接口，但部署到生产环境后无法调用。

**根本原因**：开发环境和生产环境的 API 路径不一致。

---

## 📊 问题分析

### 修复前的状态 ❌

```
┌─────────────────────────────────────────────────────────┐
│              开发环境（本地）                              │
├─────────────────────────────────────────────────────────┤
│ 前端调用: /api/doubao-chat                               │
│     ↓                                                    │
│ Vite Proxy 拦截                                         │
│     ↓                                                    │
│ 转发到: https://ark.cn-beijing.volces.com              │
│     ↓                                                    │
│ ✅ 成功                                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              生产环境（服务器）                           │
├─────────────────────────────────────────────────────────┤
│ 前端调用: /api/doubao-chat                               │
│     ↓                                                    │
│ ❌ 404 Not Found                                         │
│ （因为服务器上没有这个路径，实际文件是 .php 结尾）        │
└─────────────────────────────────────────────────────────┘
```

### 修复后的状态 ✅

```
┌─────────────────────────────────────────────────────────┐
│              开发环境（本地）                              │
├─────────────────────────────────────────────────────────┤
│ 前端调用: /api/doubao-chat                               │
│     ↓                                                    │
│ Vite Proxy 拦截                                         │
│     ↓                                                    │
│ 转发到: https://ark.cn-beijing.volces.com              │
│     ↓                                                    │
│ ✅ 成功                                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              生产环境（服务器）                           │
├─────────────────────────────────────────────────────────┤
│ 前端调用: /api/doubao-chat.php                          │
│     ↓                                                    │
│ PHP 文件执行                                            │
│     ↓                                                    │
│ 转发到: https://ark.cn-beijing.volces.com              │
│     ↓                                                    │
│ ✅ 成功                                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 已实施的修复

### 修改的文件：`src/constants.js`

**修改前：**
```javascript
export const DOUBAO_CONFIG = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015101857-wc8xz',
  API_URL: '/api/doubao-chat'  // ❌ 在生产环境找不到这个路径
};
```

**修改后：**
```javascript
const isDevelopment = import.meta.env.DEV;

export const DOUBAO_CONFIG = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015101857-wc8xz',
  // ✅ 根据环境自动选择正确的路径
  API_URL: isDevelopment ? '/api/doubao-chat' : '/api/doubao-chat.php'
};
```

---

## 📝 部署步骤

### 1️⃣ 重新构建项目（已完成）✅

```bash
npm run build
```

输出：
```
✓ 3051 modules transformed.
dist/index.html                   0.79 kB
dist/assets/index-DRpWbjX_.css   32.19 kB
dist/assets/index-FPKNg5pk.js   796.60 kB
✓ built in 8.54s
```

### 2️⃣ 上传文件到服务器

需要上传的文件：

```
服务器根目录/
├── index.html              ← 从 dist/index.html
├── assets/                 ← 从 dist/assets/
│   ├── index-DRpWbjX_.css
│   └── index-FPKNg5pk.js
└── api/                    ← 从项目根目录
    ├── doubao-chat.php
    └── doubao-image.php
```

**上传命令示例：**

```bash
# 方式 1：使用 scp
scp -r dist/* user@fuzi.gaodun.com:/var/www/html/
scp -r api/ user@fuzi.gaodun.com:/var/www/html/api/

# 方式 2：使用 rsync
rsync -avz dist/* user@fuzi.gaodun.com:/var/www/html/
rsync -avz api/ user@fuzi.gaodun.com:/var/www/html/api/
```

### 3️⃣ 验证部署

**测试 1：访问网站**
```
https://fuzi.gaodun.com
```
预期：页面正常显示

**测试 2：测试聊天接口**
```bash
curl -X POST https://fuzi.gaodun.com/api/doubao-chat.php \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
```
预期：返回 AI 回复

**测试 3：测试图片生成接口**
```bash
curl -X POST https://fuzi.gaodun.com/api/doubao-image.php \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只猫","n":1,"size":"2k"}'
```
预期：返回图片 URL

---

## 🔍 为什么前端不能直接调用火山引擎 API？

### CORS（跨域资源共享）限制

```
┌─────────────────────────────────────────────────────────┐
│                  浏览器的安全机制                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  浏览器加载页面：https://fuzi.gaodun.com                 │
│                                                          │
│  前端尝试请求：https://ark.cn-beijing.volces.com         │
│                                                          │
│  ❌ 浏览器阻止：                                         │
│     "不同域名，CORS policy 禁止访问"                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 正确的解决方案：使用后端代理

```
┌─────────────────────────────────────────────────────────┐
│              浏览器 → 同域后端 → 第三方 API                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  浏览器：https://fuzi.gaodun.com                        │
│     ↓                                                    │
│  后端代理：https://fuzi.gaodun.com/api/doubao-chat.php  │
│     ↓                                                    │
│  第三方 API：https://ark.cn-beijing.volces.com          │
│                                                          │
│  ✅ 成功！（后端到后端没有 CORS 限制）                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ 技术实现细节

### 环境检测机制

Vite 提供了环境变量来区分开发和生产环境：

```javascript
import.meta.env.DEV   // true 在开发环境
import.meta.env.PROD  // true 在生产环境
```

### API 配置逻辑

```javascript
// 自动根据环境选择正确的 API 路径
const isDevelopment = import.meta.env.DEV;

export const DOUBAO_CONFIG = {
  API_URL: isDevelopment 
    ? '/api/doubao-chat'      // 开发环境：Vite proxy 拦截
    : '/api/doubao-chat.php'  // 生产环境：调用 PHP 文件
};
```

### PHP 代理工作原理

```php
<?php
// 1. 接收前端请求
$input = json_decode(file_get_contents('php://input'), true);

// 2. 添加认证信息（API Key）
$apiKey = 'bd747896-e89b-46f4-a5ab-0a232d086845';

// 3. 转发请求到火山引擎 API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://ark.cn-beijing.volces.com/api/v3/chat/completions');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey
]);
$response = curl_exec($ch);

// 4. 返回响应给前端
echo $response;
?>
```

---

## ✅ 完成清单

- [x] 修复 `src/constants.js` 的环境差异配置
- [x] 重新构建项目 (`npm run build`)
- [x] 生成新的 `dist/` 文件
- [x] 创建部署检查清单 (`DEPLOYMENT_CHECKLIST.md`)
- [x] 更新 README 文档
- [ ] **待完成**：上传文件到生产服务器
- [ ] **待完成**：验证生产环境接口

---

## 🚀 下一步行动

### 立即执行：

1. **上传文件到服务器**
   ```bash
   # 上传构建文件
   scp -r dist/* user@fuzi.gaodun.com:/var/www/html/
   
   # 上传 API 文件
   scp -r api/ user@fuzi.gaodun.com:/var/www/html/api/
   ```

2. **清除浏览器缓存**
   - 按 `Ctrl + Shift + Delete`
   - 或在浏览器中强制刷新：`Ctrl + F5`

3. **测试生产环境**
   - 访问 https://fuzi.gaodun.com
   - 尝试上传图片和生成单词卡
   - 检查浏览器控制台是否有错误

### 如果仍有问题：

1. **检查 PHP 错误日志**
   ```bash
   tail -f /var/log/php-fpm/error.log
   ```

2. **检查 Nginx/Apache 错误日志**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. **验证文件权限**
   ```bash
   ls -la /var/www/html/api/
   ```

---

## 📚 相关文档

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 详细的部署检查清单
- [README.md](./README.md) - 项目说明和部署指南
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - 优化总结

---

**更新时间**：2025-10-23  
**修复人员**：AI Assistant  
**问题状态**：✅ 代码修复完成，等待部署验证

