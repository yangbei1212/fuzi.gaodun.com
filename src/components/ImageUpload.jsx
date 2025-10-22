import React from 'react';
import { Button, Upload, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './ImageUpload.css';

const ImageUpload = ({ 
  fileList, 
  uploadingImages, 
  lastUploadedImage,
  onUploadChange, 
  beforeUpload 
}) => {
  const uploadProps = {
    beforeUpload,
    onChange: onUploadChange,
    fileList: fileList,
    multiple: true,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    }
  };

  return (
    <div className="page-dialog-upload-area">
      <div className="upload-label">
        <span className="required-mark">*</span>
        添加图片
      </div>
      <Upload {...uploadProps} className="image-upload">
        <Button 
          icon={<PlusOutlined />} 
          className="upload-btn"
          size="small"
        >
          选择图片
        </Button>
      </Upload>
      {(fileList.length > 0 || lastUploadedImage) && (
        <div className="upload-preview">
          {/* 显示当前文件列表中的图片 */}
          {fileList.map((file, index) => (
            <div key={index} className="preview-item">
              <Image
                src={file.url || file.thumbUrl} 
                alt={file.name}
                className="preview-image"
                preview={{
                  mask: '点击预览',
                  maskClassName: 'image-preview-mask'
                }}
              />
              {!file.cloudUrl && uploadingImages && (
                <div className="upload-status">
                  <div className="upload-spinner"></div>
                  <span>上传中...</span>
                </div>
              )}
              {file.cloudUrl && (
                <div className="upload-success">
                  <span>✓</span>
                </div>
              )}
            </div>
          ))}
          
          {/* 如果没有当前文件但有之前上传的图片，显示之前上传的图片 */}
          {fileList.length === 0 && lastUploadedImage && (
            <div className="preview-item">
              <Image
                src={lastUploadedImage.url} 
                alt={lastUploadedImage.name || '之前上传的图片'}
                className="preview-image"
                preview={{
                  mask: '点击预览',
                  maskClassName: 'image-preview-mask'
                }}
              />
              <div className="upload-success">
                <span>✓</span>
              </div>
              <div className="image-source-tag">
                <span>之前上传</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
