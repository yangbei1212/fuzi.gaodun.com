import React, { useState, useEffect } from 'react';
import { Button, Upload, Image, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './ImageUpload.css';

const ImageUpload = ({ 
  fileList, 
  uploadingImages, 
  lastUploadedImage,
  onUploadChange, 
  beforeUpload 
}) => {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null);

  // 从 localStorage 加载上传历史
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    setUploadHistory(history.slice(0, 10)); // 最多显示 10 张历史图片
  }, []);

  // 监听 localStorage 变化，实时更新历史列表
  useEffect(() => {
    const handleStorageChange = () => {
      const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
      setUploadHistory(history.slice(0, 10));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 也监听自定义事件（用于同一页面内的更新）
    window.addEventListener('uploadHistoryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('uploadHistoryUpdated', handleStorageChange);
    };
  }, []);

  // 监听 fileList 变化，如果选中的历史图片被删除，清除选中状态
  useEffect(() => {
    if (selectedHistoryImage) {
      // 检查选中的历史图片是否还在文件列表中
      const stillExists = fileList.some(file => 
        file.url === selectedHistoryImage.url || 
        file.thumbUrl === selectedHistoryImage.url ||
        file.cloudUrl === selectedHistoryImage.url
      );
      
      // 如果不在了，清除选中状态
      if (!stillExists) {
        setSelectedHistoryImage(null);
        console.log('✓ 已清除历史图片选中状态');
      }
    }
  }, [fileList, selectedHistoryImage]);

  // 点击历史图片
  const handleHistoryImageClick = (historyImage) => {
    // 检查是否已在上传列表中
    const alreadyExists = fileList.some(file => 
      file.url === historyImage.url || 
      file.thumbUrl === historyImage.url ||
      file.cloudUrl === historyImage.url
    );
    
    if (alreadyExists) {
      message.warning('该图片已在上传列表中');
      console.log('⚠️ 该图片已在上传列表中，无需重复添加');
      return;
    }
    
    // 检查最大数量限制
    if (fileList.length >= 3) {
      message.warning('最多只能上传3张图片');
      console.log('⚠️ 已达到最大上传数量限制（3张）');
      return;
    }
    
    setSelectedHistoryImage(historyImage);
    
    // 模拟添加到 fileList
    const mockFile = {
      uid: Date.now(),
      name: historyImage.name || '历史图片',
      status: 'done',
      url: historyImage.url,
      thumbUrl: historyImage.url,
      cloudUrl: historyImage.url,
    };
    
    onUploadChange({ fileList: [...fileList, mockFile] });
    message.success('已添加到上传列表');
    console.log('✅ 已添加历史图片到上传列表');
  };

  // 删除历史图片
  const handleRemoveHistoryImage = (e, historyImage) => {
    e.stopPropagation(); // 防止触发点击选择事件
    
    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    const newHistory = history.filter(item => item.url !== historyImage.url);
    localStorage.setItem('uploadHistory', JSON.stringify(newHistory));
    setUploadHistory(newHistory);
    
    // 触发自定义事件
    window.dispatchEvent(new Event('uploadHistoryUpdated'));
    
    console.log('🗑️ 已从历史记录中删除:', historyImage.url);
  };

  const uploadProps = {
    beforeUpload,
    onChange: onUploadChange,
    fileList: fileList,
    multiple: true,
    listType: "picture-card",
    showUploadList: {
      showPreviewIcon: false,  // 不显示预览图标
      showRemoveIcon: true,    // 只显示删除按钮
    }
  };

  return (
    <div className="page-dialog-upload-area">
      <div className="upload-label">
        <span className="required-mark">*</span>
        添加图片
      </div>
      <Upload {...uploadProps} className="image-upload">
        {fileList.length < 3 && ( // 最多只允许上传3张图片
          <div className="upload-btn-wrapper">
            <PlusOutlined style={{ fontSize: '20px' }} />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>选择图片</div>
          </div>
        )}
      </Upload>

      {/* 历史上传图片区域 - 始终显示 */}
      {uploadHistory.length > 0 && (
        <div className="history-upload-section">
          <div className="history-upload-title">历史上传</div>
          <div className="history-upload-list">
            {uploadHistory.map((item, index) => {
              // 检查该历史图片是否已在上传列表中
              const isInUploadList = fileList.some(file => 
                file.url === item.url || 
                file.thumbUrl === item.url ||
                file.cloudUrl === item.url
              );
              
              return (
                <div
                  key={index}
                  className={`history-upload-item ${selectedHistoryImage?.url === item.url ? 'selected' : ''} ${isInUploadList ? 'in-upload-list' : ''}`}
                  onClick={() => handleHistoryImageClick(item)}
                  title={isInUploadList ? '该图片已在上传列表中' : '点击使用此图片'}
                >
                  <img src={item.url} alt={item.name || `历史图片${index + 1}`} />
                {isInUploadList && (
                  <div className="already-added-badge">
                    已添加
                  </div>
                )}
                  <div 
                    className="history-remove-btn"
                    onClick={(e) => handleRemoveHistoryImage(e, item)}
                    title="删除此图片"
                  >
                    ❌
                  </div>
                </div>
              );
            })}
          </div>
          <div className="history-upload-hint">💡 点击历史图片可快速使用</div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
