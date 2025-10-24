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
        {message.type === 'user' ? (
          <UserOutlined />
        ) : (
          <img 
            src="https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/e9360_20251024105135.jpg" 
            alt="fufu"
            className="assistant-avatar-image"
          />
        )}
      </div>
      <div className="message-content">
        <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
          {message.content}
        </div>
        {message.images && message.images.length > 0 && (
          <div className="message-images">
            {message.images.map((imageUrl, index) => (
              <div key={index} className="image-container portrait-image-container">
                <img
                  src={imageUrl} 
                  alt={`Generated image ${index + 1}`}
                  className="generated-image portrait-generated-image"
                  onClick={() => handleImageClick(imageUrl, index)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="message-time">{message.time}</div>
      </div>

      {/* 自定义预览模态框 - 只在AI生成的单词卡上添加播放功能 */}
      {message.images && message.images.map((imageUrl, index) => (
        <Modal
          key={index}
          open={previewVisible[index]}
          onCancel={() => handlePreviewClose(index)}
          footer={null}
          width="auto"
          centered
          className="image-preview-modal portrait-preview-modal"
          styles={{
            body: { padding: 0 }
          }}
        >
          <div className="preview-container portrait-preview-container">
            <img 
              src={imageUrl} 
              alt={`Preview ${index + 1}`}
              className="preview-image portrait-preview-image"
            />
            {/* 只在 AI 生成的单词卡（assistant 消息且有 word 属性）上显示发音按钮 */}
            {message.type === 'assistant' && message.word && (
              <div 
                className={`preview-play-button ${isPlaying[index] ? 'playing' : ''}`}
                onClick={() => handlePlayToggle(index, { stopPropagation: () => {} })}
                title={isPlaying[index] ? '停止播放' : '播放'}
              >
                <SoundOutlined className="preview-sound-icon" />
              </div>
            )}
          </div>
        </Modal>
      ))}
    </div>
  );
};

const LoadingMessage = () => (
  <div className="message-item assistant-message">
    <div className="message-avatar">
      <img 
        src="https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/e9360_20251024105135.jpg" 
        alt="fufu"
        className="assistant-avatar-image"
      />
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

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const isInitialMount = useRef(true);
  const scrollTimeoutRef = useRef(null);
  const userScrolling = useRef(false);
  const scrollCheckTimeoutRef = useRef(null);

  // 检测用户是否在手动滚动
  const handleScroll = React.useCallback(() => {
    userScrolling.current = true;
    
    // 清除之前的定时器
    if (scrollCheckTimeoutRef.current) {
      clearTimeout(scrollCheckTimeoutRef.current);
    }
    
    // 1秒后重置用户滚动状态
    scrollCheckTimeoutRef.current = setTimeout(() => {
      userScrolling.current = false;
    }, 1000);
  }, []);

  // 自动滚动到底部
  const scrollToBottom = () => {
    // 如果用户正在手动滚动，不执行自动滚动
    if (userScrolling.current) {
      return;
    }

    // 清除之前的滚动计时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // 延迟滚动，确保 DOM 已更新，且只执行一次
    scrollTimeoutRef.current = setTimeout(() => {
      if (!userScrolling.current && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    }, 100);
  };

  // 只在有新消息添加时滚动到底部
  React.useEffect(() => {
    // 跳过初始渲染
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    // 只有当消息数量增加时才滚动
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollCheckTimeoutRef.current) {
        clearTimeout(scrollCheckTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={messagesContainerRef}
      className="page-dialog-messages"
      onScroll={handleScroll}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      
      {/* 加载中消息 */}
      {isLoading && <LoadingMessage />}
      
      {/* 用于滚动定位的元素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
