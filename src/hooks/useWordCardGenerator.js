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
        aiMessage = `帮我生成图片：我想把这个图片p成一个单词卡，单词卡由两张图片拼接而成
你的工作流程如下：
第一步，生成两张符合如下要求的图片，做拼接准备
图一要求：首先需要把图中的人物或者动物p成和单词相关的动作和场景，如果图中无特定人物或动物，可以选择一个物品进行拟人化或者自己创作虚拟人物。然后以p好的图片作为背景，把对应的单词，词性，中文释义，发音等信息展示在卡片上。其中，单词主体在图片中间，需要你根据图片主题色自己选择字体颜色，实现字体清晰可见；词性、中文释义和发音等展示在图片下方位置，词性、中文释义和发音请参考《牛津高阶英文词典》，多个中文释义最多展示5个，发音展示美式和英式两种
图二要求：固定以纯白色作为背景，展示目标单词的2个简单例句（包含对应的中文注释）和记忆的小贴士。其中，例句简单，贴近生活，避免复杂结构，小帖士格式样式尽量统一为有背景底色的文案，高亮突出。根据你生成的例句，将图中的人物或者动物扣出来（没有就自己创作），p成和例句相关的场景，展示在图片下方位置。
第二步，进行拼接，拼接后的单词卡固定为 9:16 的图片比例，请根据16:9的比例控制拼接的两张图片大小，均上下拼接的形式，不可随意更改拼接样式！
你最好多生成几张，然后自己挑选一张看起来最符合要求的返回
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
