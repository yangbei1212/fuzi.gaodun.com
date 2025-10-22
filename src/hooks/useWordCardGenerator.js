import { useCallback } from 'react';
import { message } from 'antd';
import { generateImage } from '../services/api';
import { generateLocalWordCard } from '../services/imageGenerator';

export const useWordCardGenerator = () => {
  const generateWordCard = useCallback(async (userMessage, imageUrl) => {
    try {
      // 构建发送给AI的消息
      let aiMessage = '';
      
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
        aiMessage = `帮我生成图片：我想把这个图片p成一个单词卡，单词卡分为正反两面，共2张图
正面需要把图中的人物或者动物p成和单词相关的动作和场景，以p好的图作为背景，同时需要把对应的单词，词性，中文释义，发音等信息展示在卡片上，其中，单词主体在图片中间，展示字体和颜色需要清晰，词性、中文释义和发音等展示在图片下方
反面需要展示目标单词的2个简单例句（包含对应的中文注释）和记忆的小贴士，其中例句简单，贴近生活，避免复杂结构，反面图片将以白色作为背景，把图中的人物或者动物扣出来，p成和例句相关的场景，展示在右下角
我的单词是：${userMessage}`;
      } else {
        aiMessage = `生成英语单词学习卡片，单词：${userMessage}

要求：
1. 正面卡片：展示单词、词性、中文释义、发音，设计简洁美观
2. 反面卡片：展示2个简单例句（含中文注释）和记忆小贴士，白色背景
3. 卡片尺寸：1024x1024像素
4. 风格：现代简约，适合学习使用

请生成两张图片：正面卡片和反面卡片。`;
      }
      
      // 调用图片生成API
      console.log('使用的图片URL:', imageUrl);
      console.log('图片来源:', imageUrl ? (imageUrl.startsWith('data:') ? '本地生成' : '云存储') : '无图片');
      const generatedImages = await generateImage(aiMessage, imageUrl);
      console.log('生成的图片数组:', generatedImages);
      console.log('图片数量:', generatedImages ? generatedImages.length : 0);
      return generatedImages;
    } catch (error) {
      console.error('图片生成失败:', error);
      // 如果API调用失败，使用本地生成
      return await generateLocalWordCard(aiMessage, imageUrl);
    }
  }, []);

  return { generateWordCard };
};
