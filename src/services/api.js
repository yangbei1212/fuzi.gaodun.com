import axios from 'axios';
import { DOUBAO_CONFIG, DOUBAO_CONFIG_IMAGE, UPLOAD_CONFIG, IMAGE_CONFIG } from '../constants';
import { fileToBase64 } from '../utils';

// 上传到 gaodun.com
export const uploadToGaodun = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file_type', 'img');
    formData.append('is_cut', '0');
    formData.append('thumb', '');
    formData.append('file', file);
    formData.append('source', 'js');
    
    const res = await fetch(UPLOAD_CONFIG.UPLOAD_URL, {
      method: 'POST',
      body: formData,
      timeout: UPLOAD_CONFIG.TIMEOUT
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    if (data && data.url) {
      return data.url;
    }
    throw new Error(data.error?.message || '上传失败');
  } catch (e) {
    console.error('上传异常:', e);
    throw e;
  }
};

// 上传图片到图床
export const uploadImageToCloud = async (file) => {
  try {
    const url = await uploadToGaodun(file);
    console.log('上传成功，返回的URL:', `https://simg01.gaodunwangxiao.com/${url}`);
    return `https://simg01.gaodunwangxiao.com/${url}`;
  } catch (error) {
    console.error('上传失败，尝试备用方案:', error.message);
    
    // 备用方案：使用本地base64
    try {
      const base64 = await fileToBase64(file);
      const dataUrl = `data:${file.type};base64,${base64}`;
      console.log('使用本地base64作为备用方案');
      return dataUrl;
    } catch (base64Error) {
      console.error('备用方案也失败:', base64Error);
      throw new Error('图片上传失败');
    }
  }
};

// 豆包AI API调用函数
export const chatWithDoubao = async (userMessage) => {
  try {
    const response = await axios.post(DOUBAO_CONFIG.API_URL, {
      model: DOUBAO_CONFIG.ENDPOINT_ID,
      messages: [
        {
          role: 'system',
          content: '你是fufu，一个专业的英语单词学习助手。你的主要任务是帮助用户生成个性化的单词卡。当用户上传图片并输入单词时，你需要：1. 分析图片中的人物或动物，2. 结合单词含义设计相关动作和场景，3. 提供单词的详细信息（词性、中文释义、发音等），4. 用友好、有趣的语气回复，就像fufu一样活泼可爱。'
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('调用豆包AI失败:', error.response?.data || error.message);
    console.error('错误状态码:', error.response?.status);
    
    // 如果是CORS错误，提供更友好的错误信息
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      throw new Error('网络连接失败，请检查网络设置或稍后重试');
    }
    
    throw new Error('抱歉，我现在无法回答您的问题，请稍后再试。');
  }
};


// 生成图片API调用
export const generateImage = async (userMessage, imageUrl) => {
  try {
    console.log('调用图片生成API，prompt:', userMessage);
    console.log('API URL:', DOUBAO_CONFIG_IMAGE.API_URL);
    console.log('使用的图片URL:', imageUrl);
    
    const requestData = {
      model: DOUBAO_CONFIG_IMAGE.ENDPOINT_ID,
      prompt: userMessage,
      n: 1,
      size: IMAGE_CONFIG.SIZE,
      response_format: 'url'

    };
    
    console.log('API请求参数:', requestData);
    console.log('请求生成图片数量: 1');
    
    // 只有当imageUrl存在且有效时才添加到请求中
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
      requestData.image = imageUrl;
      console.log('添加图片参数到API请求:', imageUrl);
    }
    
    const response = await axios.post(DOUBAO_CONFIG_IMAGE.API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG_IMAGE.API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: IMAGE_CONFIG.TIMEOUT
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', response.data);
    
    if (response.data && response.data.data) {
      // 确保返回的是数组格式
      const images = Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
      
      console.log('API返回的图片数量:', images.length);
      console.log('图片数据:', images);
      
      return images;
    } else if (response.data && response.data.choices) {
      // 处理不同的响应格式
      const images = response.data.choices.map(choice => ({
        url: choice.message?.content || choice.text || choice.url,
        revised_prompt: choice.message?.role || choice.revised_prompt
      }));
      
      console.log('API返回的图片数量:', images.length);
      console.log('图片数据:', images);
      
      return images;
    } else {
      console.error('未知的响应格式:', response.data);
      throw new Error('响应数据格式错误');
    }
  } catch (error) {
    console.error('API调用失败:', error.response?.data || error.message);
    console.error('错误状态码:', error.response?.status);
    console.error('错误头信息:', error.response?.headers);
    
    // 如果是CORS错误，提供更友好的错误信息
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      throw new Error('网络连接失败，请检查网络设置或稍后重试');
    }
    
    throw error;
  }
};
