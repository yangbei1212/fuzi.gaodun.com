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
  API_URL: 'https://fuzi-api.gaodun.com/api/tts',
};

/**
 * 调用火山引擎 TTS API 合成语音
 * @param {string} text - 要朗读的英文文本
 * @returns {Promise<Blob>} - 返回音频 Blob
 */
export const textToSpeech = async (text) => {
  try {
    console.log('调用 TTS API，朗读文本:', text);
    
    // 将 text 作为 URL 查询参数
    const url = `${TTS_CONFIG.API_URL}?text=${encodeURIComponent(text)}`;
    
    console.log('TTS 请求 URL:', url);

    // 发送 POST 请求
    const response = await axios.post(url, null, {
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
        return audioBlob;
      } else {
        // API 返回错误
        console.error('TTS API 返回错误:', response.data);
        throw new Error(response.data.message || 'TTS 服务返回错误');
      }
    } else if (response.data instanceof Blob) {
      // 返回的是直接的音频流
      console.log('TTS 返回音频流，大小:', response.data.size, 'bytes');
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
 * @returns {Promise<HTMLAudioElement>}
 */
export const speakText = async (text) => {
  const audioBlob = await textToSpeech(text);
  return playAudioBlob(audioBlob);
};

