// API配置 - 统一使用新的后端接口
export const DOUBAO_CONFIG = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015101857-wc8xz',
  API_URL: 'https://fuzi-api.gaodun.com/api/generations'
};

export const DOUBAO_CONFIG_IMAGE = {
  API_KEY: 'bd747896-e89b-46f4-a5ab-0a232d086845',
  ENDPOINT_ID: 'ep-20251015102102-x2n2t',
  API_URL: 'https://fuzi-api.gaodun.com/api/generations'
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
  content: 'Hi，终于等到你！我是你的专属单词学习助手——fufu\n还在对着冷冰冰的单词表机械地背诵"abandon，abandon，abandon"吗？结果单词没记住，先把自己"abandon"了？\n\n从今天起，让fufu带你用全新的方式快乐记单词！我会根据你上传的照片，为你定制专属单词卡——用你最爱的宝贝（潮流IP、宠物、偶像、萌娃甚至是你自己）为你"演绎"单词，让学习不再枯燥，记忆更深刻！\n\n解锁快乐学习法只需两步哟：\n第一步：上传一张清晰照片（建议脸部无遮挡）\n第二步：告诉我你想学习的目标单词\n接下来，就交给我啦～我将为你生成一张专属、精美、有趣的单词卡！\n快来试试吧，让你的单词记忆，从此有爱、有趣、有画面感！',
  timestamp: Date.now()
};
