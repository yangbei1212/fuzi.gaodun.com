import React, { useState, useRef } from 'react';
import { Modal, message as antdMessage } from 'antd';
import { MessageOutlined, UserOutlined, SoundOutlined } from '@ant-design/icons';
import { formatTime } from '../utils';
import { speakText } from '../services/tts';

const MessageItem = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState({});
  const [previewVisible, setPreviewVisible] = useState({});
  const audioRef = useRef({});

  const handleImageClick = (imageUrl, index) => {
    setPreviewVisible(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handlePlayToggle = async (index, e) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发图片放大
    
    // 如果正在播放，停止播放
    if (isPlaying[index] && audioRef.current[index]) {
      audioRef.current[index].pause();
      audioRef.current[index].currentTime = 0;
      setIsPlaying(prev => ({
        ...prev,
        [index]: false
      }));
      return;
    }
    
    // 获取要朗读的单词
    const wordToSpeak = message.word || message.content;
    
    if (!wordToSpeak) {
      antdMessage.warning('没有找到要朗读的内容');
      return;
    }
    
    console.log('准备朗读单词:', wordToSpeak);
    
    // 开始播放
    setIsPlaying(prev => ({
      ...prev,
      [index]: true
    }));
    
    try {
      const audio = await speakText(wordToSpeak);
      audioRef.current[index] = audio;
      
      // 监听播放结束
      audio.addEventListener('ended', () => {
        setIsPlaying(prev => ({
          ...prev,
          [index]: false
        }));
      });
      
      audio.addEventListener('error', () => {
        setIsPlaying(prev => ({
          ...prev,
          [index]: false
        }));
        antdMessage.error('语音播放失败');
      });
      
    } catch (error) {
      console.error('语音合成失败:', error);
      setIsPlaying(prev => ({
        ...prev,
        [index]: false
      }));
      antdMessage.error(error.message || '语音合成失败，请稍后重试');
    }
  };

  const handlePreviewClose = (index) => {
    // 停止播放音频
    if (audioRef.current[index]) {
      audioRef.current[index].pause();
      audioRef.current[index].currentTime = 0;
    }
    
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
                <img
                  src={imageUrl} 
                  alt={`Generated image ${index + 1}`}
                  className="generated-image"
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    margin: '5px',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageClick(imageUrl, index)}
                />
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
              className={`preview-play-button ${isPlaying[index] ? 'playing' : ''}`}
              onClick={() => handlePlayToggle(index, { stopPropagation: () => {} })}
              title={isPlaying[index] ? '停止播放' : '播放'}
            >
              <SoundOutlined className="preview-sound-icon" />
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
