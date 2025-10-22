// 环境检测
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API配置
export const DOUBAO_CONFIG = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015101857-wc8xz',
  API_URL: isDevelopment ? '/api/doubao-chat' : 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
};

export const DOUBAO_CONFIG_IMAGE = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015102102-x2n2t',
  API_URL: isDevelopment ? '/api/doubao-image' : 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
};

// 上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_URL: 'https://upload.gaodun.com/upload-demo/upload.php',
  TIMEOUT: 30000
};

// 图片生成配置
export const IMAGE_CONFIG = {
  SIZE: '2k',
  COUNT: 1,
  TIMEOUT: 60000
};

// 消息类型
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant'
};

// 默认欢迎消息
export const WELCOME_MESSAGE = {
  id: 1,
  type: 'assistant',
  content: 'Hi，终于遇到你了！我是你的单词学习助手-xiaoFu\n听说还有人在abandon，abandon，abandon的背单词？最后abandon了么？\n遇到xiaoFu我，将带你打开新世界哦～\n我将为你定制准属于你的单词卡\n你可以给我一张你的宝宝照片、你的毛孩子照片、你的电子"老公"、电子"老婆"照片，甚至自恋的自己的照片，都可以！让你的心爱的宝贝为你展示单词，学习单词不再枯燥！\n赶紧体验一下吧\n第一步：上传一张爱照，建议脸部无遮挡哟\n第二步：给我你的目标单词',
  timestamp: Date.now()
};
