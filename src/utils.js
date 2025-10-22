// 时间格式化函数
export const formatTime = (timestamp) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diff = now - messageTime;
  
  // 如果是今天
  if (diff < 24 * 60 * 60 * 1000 && messageTime.getDate() === now.getDate()) {
    return messageTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // 如果是昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageTime.getDate() === yesterday.getDate() && 
      messageTime.getMonth() === yesterday.getMonth() && 
      messageTime.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${messageTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}`;
  }
  
  // 如果是本周
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (messageTime > weekAgo) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[messageTime.getDay()]} ${messageTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}`;
  }
  
  // 更早的时间
  return messageTime.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// 将本地文件转换为base64
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// 验证文件类型和大小
export const validateFile = (file, maxSize = 2 * 1024 * 1024, allowedTypes = ['image/']) => {
  const isImage = allowedTypes.some(type => file.type.startsWith(type));
  if (!isImage) {
    return { valid: false, error: '只能上传图片文件！' };
  }
  
  const isLtMaxSize = file.size < maxSize;
  if (!isLtMaxSize) {
    return { valid: false, error: `图片大小不能超过 ${maxSize / 1024 / 1024}MB！` };
  }
  
  return { valid: true };
};

// 生成唯一ID
export const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// 创建消息对象
export const createMessage = (type, content, images = [], timestamp = Date.now()) => ({
  id: generateId(),
  type,
  content,
  time: formatTime(timestamp),
  timestamp,
  images
});
