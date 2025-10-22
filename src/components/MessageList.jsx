import React, { useState } from 'react';
import { Image, Modal } from 'antd';
import { MessageOutlined, UserOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { formatTime } from '../utils';

const MessageItem = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState({});
  const [previewVisible, setPreviewVisible] = useState({});

  const handleImageClick = (imageUrl, index) => {
    setPreviewVisible(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handlePlayToggle = (index, e) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片放大
    setIsPlaying(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePreviewClose = (index) => {
    setPreviewVisible(prev => ({
      ...prev,
      [index]: false
    }));
    setIsPlaying(prev => ({
      ...prev,
      [index]: false
    }));
  };

  return (
    <div 
      className={`message-item ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
    >
      <div className="message-avatar">
        {message.type === 'user' ? <UserOutlined /> : <MessageOutlined />}
      </div>
      <div className="message-content">
        <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
          {message.content}
        </div>
        {message.images && message.images.length > 0 && (
          <div className="message-images">
            {message.images.map((imageUrl, index) => (
              <div key={index} className="image-container">
                <Image
                  src={imageUrl} 
                  alt={`Generated image ${index + 1}`}
                  className="generated-image"
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    margin: '5px',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}
                  preview={{
                    mask: '点击放大',
                    maskClassName: 'image-preview-mask'
                  }}
                />
                
                {/* 播放状态覆盖层 */}
                <div 
                  className={`play-overlay ${isPlaying[index] ? 'playing' : ''}`}
                  onClick={(e) => handlePlayToggle(index, e)}
                >
                  {isPlaying[index] ? (
                    <PauseCircleOutlined className="play-icon" />
                  ) : (
                    <PlayCircleOutlined className="play-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="message-time">{message.time}</div>
      </div>

      {/* 自定义预览模态框 - 在Ant Design预览基础上添加播放功能 */}
      {message.images && message.images.map((imageUrl, index) => (
        <Modal
          key={index}
          open={previewVisible[index]}
          onCancel={() => handlePreviewClose(index)}
          footer={null}
          width="auto"
          centered
          className="image-preview-modal"
        >
          <div className="preview-container">
            <img 
              src={imageUrl} 
              alt={`Preview ${index + 1}`}
              className="preview-image"
            />
            <div 
              className={`preview-play-overlay ${isPlaying[index] ? 'playing' : ''}`}
              onClick={() => handlePlayToggle(index, { stopPropagation: () => {} })}
            >
              {isPlaying[index] ? (
                <PauseCircleOutlined className="preview-play-icon" />
              ) : (
                <PlayCircleOutlined className="preview-play-icon" />
              )}
            </div>
          </div>
        </Modal>
      ))}
    </div>
  );
};

const LoadingMessage = () => (
  <div className="message-item assistant-message">
    <div className="message-avatar">
      <MessageOutlined />
    </div>
    <div className="message-content">
      <div className="message-text loading-message" style={{ whiteSpace: 'pre-line' }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        AI正在思考中...
      </div>
      <div className="message-time">{formatTime(Date.now())}</div>
    </div>
  </div>
);

const MessageList = ({ messages, isLoading }) => (
  <div className="page-dialog-messages">
    {messages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ))}
    
    {/* 加载中消息 */}
    {isLoading && <LoadingMessage />}
  </div>
);

export default MessageList;
