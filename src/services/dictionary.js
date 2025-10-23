import axios from 'axios';

/**
 * 使用免费词典API验证英文单词是否存在
 * @param {string} word - 要验证的单词
 * @returns {Promise<{valid: boolean, message: string, data?: object}>}
 */
export const validateEnglishWord = async (word) => {
  try {
    // 清理输入：去除首尾空格，转小写
    const cleanWord = word.trim().toLowerCase();
    
    // 检查是否为空
    if (!cleanWord) {
      return {
        valid: false,
        message: '请输入单词'
      };
    }
    
    // 检查是否只包含字母（不包含空格）
    if (!/^[a-z]+$/i.test(cleanWord)) {
      return {
        valid: false,
        message: '请输入单个英文单词（不包含空格和特殊字符）'
      };
    }
    
    // 检查长度（一般英文单词不会超过45个字母，最长的英文单词是45个字母）
    if (cleanWord.length > 45) {
      return {
        valid: false,
        message: '单词长度过长，请输入有效的英文单词'
      };
    }
    
    // 调用免费词典API验证单词
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`,
      {
        timeout: 5000
      }
    );
    
    if (response.data && response.data.length > 0) {
      const wordData = response.data[0];
      return {
        valid: true,
        message: '单词验证通过',
        data: {
          word: wordData.word,
          phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text,
          meanings: wordData.meanings?.[0]?.definitions?.[0]?.definition
        }
      };
    }
    
    return {
      valid: false,
      message: '未找到该单词，请检查拼写是否正确'
    };
    
  } catch (error) {
    console.error('单词验证失败:', error);
    
    // 如果是404错误，说明单词不存在
    if (error.response?.status === 404) {
      return {
        valid: false,
        message: '这不是一个有效的英文单词，请检查拼写'
      };
    }
    
    // 如果是网络错误，允许通过（降级处理）
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('词典API超时，跳过验证');
      return {
        valid: true,
        message: '词典服务暂时无法访问，已跳过验证'
      };
    }
    
    // 其他错误也允许通过（降级处理）
    console.warn('词典API调用失败，跳过验证:', error.message);
    return {
      valid: true,
      message: '词典服务暂时无法访问，已跳过验证'
    };
  }
};

/**
 * 快速验证单词格式（不调用API）
 * @param {string} word - 要验证的单词
 * @returns {boolean}
 */
export const isValidWordFormat = (word) => {
  const cleanWord = word.trim();
  return /^[a-zA-Z]+$/.test(cleanWord) && cleanWord.length > 0 && cleanWord.length <= 45;
};

