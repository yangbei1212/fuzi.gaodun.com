import axios from 'axios';

// 生成 UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// TTS 配置 - 统一使用新的后端接口
const TTS_CONFIG = {
  APP_ID: "1078202242",
  TOKEN: "ghoh5hrIJgt5u7Ne5jWVNjJXaBkrnm0K",
  CLUSTER: "volcano_tts",
  API_URL: 'https://fuzi-api.gaodun.com/api/tts',
};

// 音频缓存 Map - 以文本为 key，Blob 为 value
const audioCache = new Map();

// 缓存统计信息
const cacheStats = {
  hits: 0,
  misses: 0,
  size: 0
};

/**
 * 获取缓存统计信息
 * @returns {object} 缓存统计
 */
export const getCacheStats = () => {
  return {
    ...cacheStats,
    entries: audioCache.size,
    hitRate: cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%'
      : '0%'
  };
};

/**
 * 清空音频缓存
 */
export const clearAudioCache = () => {
  audioCache.clear();
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.size = 0;
  console.log('音频缓存已清空');
};

/**
 * 调用火山引擎 TTS API 合成语音（带缓存）
 * @param {string} text - 要朗读的英文文本
 * @param {string} voiceType - 发音类型 'us' 美式 或 'uk' 英式
 * @returns {Promise<Blob>} - 返回音频 Blob
 */
export const textToSpeech = async (text, voiceType = 'us') => {
  // 标准化文本（去除首尾空格，转小写）
  const normalizedText = text.trim().toLowerCase();
  
  // 缓存key包含发音类型
  const cacheKey = `${normalizedText}_${voiceType}`;
  
  // 检查缓存
  if (audioCache.has(cacheKey)) {
    cacheStats.hits++;
    console.log(`✅ 使用缓存的音频: "${normalizedText}" [${voiceType}] (缓存命中: ${cacheStats.hits}次)`);
    return audioCache.get(cacheKey);
  }
  
  cacheStats.misses++;
  console.log(`🔄 首次获取音频: "${normalizedText}" [${voiceType}] (API 调用: ${cacheStats.misses}次)`);
  
  try {
    console.log('调用 TTS API，朗读文本:', text, '发音类型:', voiceType);
    
    // 将 text 和 voiceType 作为 URL 查询参数
    const url = `${TTS_CONFIG.API_URL}?text=${encodeURIComponent(text)}&voiceType=${voiceType}`;
    
    console.log('TTS 请求 URL:', url);
    const requestData = {
      app: {
        appid: TTS_CONFIG.APP_ID,
        token: TTS_CONFIG.TOKEN,
        cluster: TTS_CONFIG.CLUSTER
      },
      user: {
        uid: generateUUID()
      },
      audio: {
        voice_type: voiceType === 'us' ? 'BV040_streaming' : 'BV504_streaming',
        encoding: 'mp3',
        compression_rate: 1,
        rate: 24000,
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0,
        emotion: text,
        language: voiceType === 'us' ? 'en' : 'en_uk'
      },
      request: {
        reqid: generateUUID(),
        text: text,
        text_type: 'plain',
        operation: 'query',
        silence_duration: '125',
        with_frontend: '1',
        frontend_type: 'unitTson',
        pure_english_opt: '1'
      }
    };
    // 发送 POST 请求
    const response = await axios.post(url, requestData, {
      timeout: 30000
    });

    console.log('TTS API 响应状态:', response.status);
    console.log('响应数据:', response.data);

    // 检查响应格式
    if (response.data.code !== undefined) {
      // 返回的是 JSON 格式
      if (response.data.code === 3000 && response.data.data) {
        // 成功返回，音频数据在 data 字段中（base64 编码）
        console.log('TTS 返回 base64 音频数据');
        
        // 将 base64 转换为 Blob
        const base64Data = response.data.data;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        
        console.log('转换后的音频 Blob 大小:', audioBlob.size, 'bytes');
        
        // 存入缓存
        audioCache.set(cacheKey, audioBlob);
        cacheStats.size += audioBlob.size;
        console.log(`💾 音频已缓存: "${normalizedText}" [${voiceType}] (缓存总数: ${audioCache.size})`);
        
        return audioBlob;
      } else {
        // API 返回错误
        console.error('TTS API 返回错误:', response.data);
        throw new Error(response.data.message || 'TTS 服务返回错误');
      }
    } else if (response.data instanceof Blob) {
      // 返回的是直接的音频流
      console.log('TTS 返回音频流，大小:', response.data.size, 'bytes');
      
      // 存入缓存
      audioCache.set(cacheKey, response.data);
      cacheStats.size += response.data.size;
      console.log(`💾 音频已缓存: "${normalizedText}" [${voiceType}] (缓存总数: ${audioCache.size})`);
      
      return response.data;
    } else {
      
      throw new Error('TTS API 返回的数据格式不正确');
    }
  } catch (error) {
    console.error('TTS API 调用失败:', error.response?.data || error.message);
    console.error('错误状态码:', error.response?.status);
    
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      throw new Error('语音合成服务暂时无法访问，请稍后重试');
    }
    
    throw new Error('语音合成失败: ' + (error.response?.data?.message || error.message));
  }
};

/**
 * 播放音频 Blob
 * @param {Blob} audioBlob - 音频 Blob 数据
 * @returns {Promise<HTMLAudioElement>} - 返回 Audio 元素
 */
export const playAudioBlob = (audioBlob) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('创建音频对象，Blob 类型:', audioBlob.type, '大小:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      console.log('音频 URL 已创建:', audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        console.log('音频元数据加载完成，时长:', audio.duration, '秒');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('音频可以开始播放');
      });
      
      audio.addEventListener('ended', () => {
        console.log('音频播放结束');
        URL.revokeObjectURL(audioUrl); // 清理资源
      });
      
      audio.addEventListener('error', (e) => {
        console.error('音频播放错误:', e);
        console.error('Audio error code:', audio.error?.code);
        console.error('Audio error message:', audio.error?.message);
        URL.revokeObjectURL(audioUrl);
        reject(new Error('音频播放失败: ' + (audio.error?.message || '未知错误')));
      });
      
      // 开始播放
      audio.play()
        .then(() => {
          console.log('音频开始播放');
          resolve(audio);
        })
        .catch((error) => {
          console.error('播放失败:', error);
          URL.revokeObjectURL(audioUrl);
          reject(new Error('无法播放音频: ' + error.message));
        });
        
    } catch (error) {
      console.error('创建音频失败:', error);
      reject(error);
    }
  });
};

/**
 * 朗读文本（合成 + 播放）
 * @param {string} text - 要朗读的文本
 * @param {string} voiceType - 发音类型 'us' 美式 或 'uk' 英式
 * @returns {Promise<HTMLAudioElement>}
 */
export const speakText = async (text, voiceType = 'us') => {
  const audioBlob = await textToSpeech(text, voiceType);
  return playAudioBlob(audioBlob);
};

