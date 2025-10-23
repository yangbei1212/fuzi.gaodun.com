# 生产环境部署检查清单

## ✅ 部署前检查

- [ ] 已运行 `npm run build` 构建最新代码
- [ ] `dist/` 目录包含以下文件：
  - [ ] `index.html`
  - [ ] `assets/` 文件夹（包含 JS 和 CSS 文件）
- [ ] `api/` 文件夹包含：
  - [ ] `doubao-chat.php`
  - [ ] `doubao-image.php`

## 📦 上传文件到服务器

### 方法 1：完整部署
```bash
# 上传整个 dist/ 目录的内容到服务器根目录
scp -r dist/* user@fuzi.gaodun.com:/path/to/webroot/

# 上传 api/ 目录
scp -r api/ user@fuzi.gaodun.com:/path/to/webroot/api/
```

### 方法 2：使用 FTP/SFTP 工具
1. 连接到服务器
2. 上传 `dist/` 目录中的所有文件到网站根目录
3. 上传 `api/` 目录到网站根目录

## 🔧 服务器配置检查

### 1. PHP 环境检查
```bash
# 检查 PHP 版本（需要 >= 7.4）
php -v

# 检查 cURL 扩展
php -m | grep curl

# 检查 JSON 扩展
php -m | grep json
```

### 2. 文件权限检查
```bash
# 确保 PHP 文件可执行
chmod 644 api/*.php

# 确保 web 服务器用户可读
chown www-data:www-data api/*.php  # Nginx
# 或
chown apache:apache api/*.php      # Apache
```

### 3. 服务器配置（Nginx 示例）
```nginx
server {
    listen 80;
    server_name fuzi.gaodun.com;
    root /path/to/webroot;
    index index.html;

    # 处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 处理 PHP API 请求
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## 🧪 部署后测试

### 1. 测试静态资源加载
访问：https://fuzi.gaodun.com

预期：页面正常显示，无 404 错误

### 2. 测试聊天接口
```bash
curl -X POST https://fuzi.gaodun.com/api/doubao-chat.php \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
```

预期：返回 JSON 格式的聊天回复

### 3. 测试图片生成接口
```bash
curl -X POST https://fuzi.gaodun.com/api/doubao-image.php \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只可爱的猫","n":1,"size":"2k"}'
```

预期：返回 JSON 格式的图片 URL

### 4. 浏览器控制台检查
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试使用应用功能
4. 检查是否有以下错误：
   - ❌ 404 错误（文件未找到）
   - ❌ CORS 错误（跨域问题）
   - ❌ 500 错误（服务器错误）

## 🐛 常见问题排查

### 问题 1：API 返回 404 Not Found
**原因**：PHP 文件路径不正确

**解决方案**：
1. 确认 `api/doubao-chat.php` 和 `api/doubao-image.php` 已上传
2. 检查文件路径是否正确
3. 检查服务器配置是否支持 PHP

### 问题 2：API 返回 500 Internal Server Error
**原因**：PHP 执行错误或服务器配置问题

**解决方案**：
```bash
# 查看 PHP 错误日志
tail -f /var/log/php-fpm/error.log

# 或 Apache 错误日志
tail -f /var/log/apache2/error.log
```

### 问题 3：仍然有 CORS 错误
**原因**：前端代码未正确更新或浏览器缓存

**解决方案**：
1. 清除浏览器缓存（Ctrl + Shift + Delete）
2. 确认已重新构建并上传最新的 `dist/` 文件
3. 在浏览器中强制刷新（Ctrl + F5）

### 问题 4：图片上传失败
**原因**：PHP 上传大小限制

**解决方案**：
编辑 `php.ini`：
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 60
```

重启 PHP-FPM：
```bash
sudo systemctl restart php8.1-fpm
```

## 📊 监控和日志

### 查看访问日志
```bash
# Nginx
tail -f /var/log/nginx/access.log

# Apache
tail -f /var/log/apache2/access.log
```

### 查看错误日志
```bash
# Nginx
tail -f /var/log/nginx/error.log

# Apache
tail -f /var/log/apache2/error.log

# PHP
tail -f /var/log/php-fpm/error.log
```

## 🔐 安全建议

⚠️ **重要**：当前 API Key 暴露在前端代码中，建议：

1. **移除前端的 API Key**
   
   编辑 `src/constants.js`，移除：
   ```javascript
   API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845'  // 删除这行
   ```

2. **仅在 PHP 后端保留 API Key**
   
   API Key 应该只存在于：
   - `api/doubao-chat.php`
   - `api/doubao-image.php`

3. **使用环境变量（推荐）**
   
   创建 `.env.php`：
   ```php
   <?php
   return [
       'DOUBAO_API_KEY' => 'bd747896-e89b-46f4-a5ab-0a232d086845',
       'DOUBAO_CHAT_ENDPOINT' => 'ep-20251015101857-wc8xz',
       'DOUBAO_IMAGE_ENDPOINT' => 'ep-20251015102102-x2n2t'
   ];
   ```
   
   在 PHP 文件中引用：
   ```php
   $config = require __DIR__ . '/.env.php';
   $apiKey = $config['DOUBAO_API_KEY'];
   ```

## 📞 获取帮助

如果遇到问题：
1. 检查服务器错误日志
2. 使用浏览器开发者工具查看网络请求
3. 确认所有文件已正确上传
4. 验证 PHP 环境配置

---

**最后更新时间**：2025-10-23

