import React from 'react';
import { Button, Upload, Image } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './ImageUpload.css';

const ImageUpload = ({ 
  fileList, 
  uploadingImages, 
  lastUploadedImage,
  onUploadChange, 
  beforeUpload,
  onClearLastImage 
}) => {
  // 判断是否有图片
  const hasImage = fileList.length > 0 || lastUploadedImage;
  
  // 获取当前显示的图片
  const getCurrentImage = () => {
    if (fileList.length > 0) {
      return fileList[0];
    }
    return lastUploadedImage;
  };

  // 删除当前图片
  const handleDeleteImage = (e) => {
    e.stopPropagation();
    // 同时清空 fileList 和 lastUploadedImage，确保一次点击就能删除
    onUploadChange({ fileList: [] });
    onClearLastImage();
  };

  const uploadProps = {
    beforeUpload,
    onChange: onUploadChange,
    fileList: [],
    multiple: false,
    showUploadList: false,
  };

  const currentImage = getCurrentImage();

  return (
    <div className="page-dialog-upload-area">
      <div className="upload-label">
        <span className="required-mark">*</span>
        {hasImage ? '已上传图片' : '添加图片'}
      </div>
      
      {/* 当有图片时显示图片预览 */}
      {hasImage && currentImage && (
        <div className="single-image-preview">
          <div className="preview-image-wrapper">
            <Image
              src={currentImage.url || currentImage.thumbUrl} 
              alt="上传的图片"
              className="preview-image"
              preview={false}
            />
            
            {/* 上传中状态 */}
            {fileList.length > 0 && !currentImage.cloudUrl && uploadingImages && (
              <div className="upload-status">
                <div className="upload-spinner"></div>
                <span>上传中...</span>
              </div>
            )}
            
            {/* 删除按钮 */}
            <div className="delete-image-btn" onClick={handleDeleteImage}>
              <CloseCircleOutlined />
            </div>
          </div>
        </div>
      )}
      
      {/* 当没有图片时显示上传按钮 */}
      {!hasImage && (
        <Upload {...uploadProps} className="image-upload">
          <Button 
            icon={<PlusOutlined />} 
            className="upload-btn"
            size="large"
          >
            选择图片
          </Button>
        </Upload>
      )}
    </div>
  );
};

export default ImageUpload;
