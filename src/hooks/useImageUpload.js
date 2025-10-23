import { useState, useCallback } from 'react';
import { message } from 'antd';
import { uploadImageToCloud } from '../services/api';
import { validateFile } from '../utils';
import { UPLOAD_CONFIG } from '../constants';

export const useImageUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState(null); // 记住最后上传的图片

  const handleUploadChange = useCallback(async ({ fileList: newFileList }) => {
    // 如果文件列表为空（说明用户删除了图片），直接清空
    if (newFileList.length === 0) {
      setFileList([]);
      setUploadingImages(false);
      return;
    }
    
    setUploadingImages(true);
    
    // 先生成本地预览
    const updated = newFileList.map(file => {
      const cloned = { ...file };
      if (cloned.originFileObj && !cloned.url && !cloned.thumbUrl) {
        cloned.url = URL.createObjectURL(cloned.originFileObj);
        cloned.thumbUrl = cloned.url;
      }
      return cloned;
    });
    
    setFileList(updated);
    
    // 异步上传到图床
    const finalUpdated = await Promise.all(updated.map(async (file) => {
      const cloned = { ...file };
      if (cloned.originFileObj) {
        try { 
          const httpsUrl = await uploadImageToCloud(cloned.originFileObj);
          if (httpsUrl) {
            // 释放本地blob URL
            if (cloned.url && cloned.url.startsWith('blob:')) {
              URL.revokeObjectURL(cloned.url);
            }
            cloned.url = httpsUrl;
            cloned.thumbUrl = httpsUrl;
            cloned.cloudUrl = httpsUrl; // 标记为云存储地址
            
            // 保存最后上传的图片信息
            setLastUploadedImage({
              url: httpsUrl,
              name: cloned.name,
              size: cloned.size,
              type: cloned.type,
              uploadTime: Date.now()
            });
          }
        } catch (error) {
          console.error('图片上传失败:', error);
          message.error('图片上传失败，将使用本地预览');
        }
      }
      return cloned;
    }));
    
    setFileList(finalUpdated);
    setUploadingImages(false);
  }, []);

  const beforeUpload = useCallback((file) => {
    const validation = validateFile(file, UPLOAD_CONFIG.MAX_FILE_SIZE, UPLOAD_CONFIG.ALLOWED_TYPES);
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }
    return false; // 阻止自动上传
  }, []);

  const clearFileList = useCallback(() => {
    setFileList([]);
  }, []);

  const clearLastUploadedImage = useCallback(() => {
    setLastUploadedImage(null);
  }, []);

  const getFirstImageUrl = useCallback(() => {
    // 优先使用当前文件列表中的图片
    if (fileList.length > 0) {
      const firstFile = fileList[0];
      return firstFile.cloudUrl || firstFile.url || firstFile.thumbUrl;
    }
    // 如果没有当前文件，使用最后上传的图片
    if (lastUploadedImage) {
      console.log('使用最后上传的图片:', lastUploadedImage.url);
      return lastUploadedImage.url;
    }
    return null;
  }, [fileList, lastUploadedImage]);

  // 保存当前使用的图片到历史记录（生成成功后调用）
  const saveToHistory = useCallback(() => {
    const imageToSave = lastUploadedImage || (fileList.length > 0 ? {
      url: fileList[0].cloudUrl || fileList[0].url || fileList[0].thumbUrl,
      name: fileList[0].name,
      size: fileList[0].size,
      type: fileList[0].type,
      uploadTime: Date.now()
    } : null);

    if (imageToSave && imageToSave.url) {
      const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
      
      // 检查是否已存在
      const exists = history.some(item => item.url === imageToSave.url);
      if (!exists) {
        const newHistory = [imageToSave, ...history].slice(0, 10); // 最多保存 10 张
        localStorage.setItem('uploadHistory', JSON.stringify(newHistory));
        
        // 触发自定义事件通知其他组件更新
        window.dispatchEvent(new Event('uploadHistoryUpdated'));
        
        console.log('✅ 图片已保存到历史记录:', imageToSave.url);
      }
    }
  }, [fileList, lastUploadedImage]);

  return {
    fileList,
    uploadingImages,
    lastUploadedImage,
    handleUploadChange,
    beforeUpload,
    clearFileList,
    clearLastUploadedImage,
    getFirstImageUrl,
    saveToHistory
  };
};
