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
        aiMessage = `你是一个英语教学卡片设计师，请你根据我上传的图片，为单词 “{{word}}” 制作一张单词卡。单词卡由两张图片拼接而成，拼接比例为 9:16（上下拼接）。你需要按照以下流程完成任务：
第一步：图像处理（基于我上传的图片）
分析我上传的图片内容：
图片中是否有明确的人物、动物或物品？如有，请指出；
如果没有明确对象，你可自行创作一个虚拟人物或拟人化物品（如一个会说话的花盆、一个跳舞的铅笔等）。
根据目标单词${userMessage}，对图片进行图像处理（P图）：
将图片中的人物/动物/物品修改为与单词相关的动作或场景；
-例如：如果单词是“flower”，可将人物P成在花园中赏花的样子；
如果单词是“swim”，可将人物P成在水中游泳的样子；
-保持画面自然，人物与场景协调，风格统一；
输出处理后的图片作为“图一”的背景图。
第二步：生成图一内容（单词信息图）
使用P图后的图片作为背景图；
在图片上叠加以下文字内容（居中+下方）：
单词：${userMessage}>
-词性：请参考《牛津高阶英文词典》列出主要词性（如 noun, verb）>
发音：美式 /.../，英式 /.../（使用标准 IPA 国际音标，固定斜杠，避免乱码）>
中文释义（最多5个，参考《牛津高阶英文词典》）>
文字排版要求：
单词主体居中显示，字体清晰、与背景对比度高（如白色字体配深色背景）；
-词性、发音、中文释义展示在图片下方，字体清晰、排版整齐；
使用标准字体（如 Arial、Roboto、思源黑体等）；
避免文字重叠或模糊；
第三步：生成图二内容（例句与小贴士）
背景统一为纯白色；
展示以下内容：
-例句1（英文 + 中文翻译）：
英文例句需简单、贴近生活，避免复杂结构；
中文翻译准确自然；
-例句2（英文 + 中文翻译）：同上；
记忆小贴士（背景高亮）：
提供一个与单词相关的记忆技巧；
使用有背景色的文案样式（如浅绿色背景）；
人物/动物/物品处理：
-从图一中扣出人物/动物/物品；
放置在图二下方，与例句内容相关（如单词是“flower”，则人物可手持一朵花）；
文字排版要求：
字体清晰，字号适中；
-例句与小贴士之间用空行分隔；
第四步：图片拼接>
将图一和图二上下拼接；
总比例为9:16（如1080×1920像素）；
每张图各占一半高度；
确保文字不被裁剪，人物展示完整；
第五步：生成3张单词卡并挑选最优>
根据以上流程，生成3张不同风格的单词卡；
对比清晰度、排版、风格美观度；
挑选出一张最清晰、风格最好看的返回给我；`;
      } else {
        aiMessage = `生成英语单词学习卡片，单词：${userMessage}

要求：
1. 正面卡片：展示单词、词性、中文释义、发音，设计简洁美观
2. 反面卡片：展示2个简单例句（含中文注释）和记忆小贴士，白色背景
3. 卡片尺寸：1024x1024像素
4. 风格：现代简约，适合学习使用

请生成两张图片：正面卡片和反面卡片。`;
      }
      
      const generatedImages = await generateImage(aiMessage, imageUrl);
      return generatedImages;
    } catch (error) {
      // 如果API调用失败，使用本地生成
      return await generateLocalWordCard(aiMessage, imageUrl);
    }
  }, []);

  return { generateWordCard };
};
