import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import './App.css';

// 导入组件
import WelcomePage from './components/WelcomePage';
import MessageList from './components/MessageList';
import ChatForm from './components/ChatForm';

// 导入Hooks
import { useImageUpload } from './hooks/useImageUpload';
import { useMessages } from './hooks/useMessages';
import { useWordCardGenerator } from './hooks/useWordCardGenerator';

// 导入常量和工具
import { WELCOME_MESSAGE } from './constants';
import { formatTime } from './utils';

const { Header, Content } = Layout;
const { Title } = Typography;


const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [form] = Form.useForm();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 使用自定义Hooks
  const { 
    fileList, 
    uploadingImages, 
    lastUploadedImage,
    handleUploadChange, 
    beforeUpload, 
    clearFileList, 
    clearLastUploadedImage,
    getFirstImageUrl,
    saveToHistory
  } = useImageUpload();

  const { 
    messages, 
    isLoading, 
    addUserMessage, 
    addAssistantMessage, 
    setLoading 
  } = useMessages([{ ...WELCOME_MESSAGE, time: formatTime(WELCOME_MESSAGE.timestamp) }]);

  const { generateWordCard } = useWordCardGenerator();

  // 实时更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (values) => {
    // 验证图片是否上传

    if ( getFirstImageUrl() === null) {
      message.error('请至少上传一张图片！');
      return;
    }
    
    // 添加用户消息
    const userImages = fileList.map(file => file.url || file.thumbUrl);
    addUserMessage(values.message || '', userImages);
    form.resetFields();
    setLoading(true);
    
    try {
      // 获取第一张图片的地址
      const finalImageUrl = getFirstImageUrl();
      
      // 生成单词卡
      const generatedImages = await generateWordCard(values.message, finalImageUrl);
      
      // 生成成功后，保存图片到历史记录
      if (generatedImages && generatedImages.length > 0) {
        saveToHistory();
      }
      
      // 清空文件列表和最后上传的图片，允许用户重新上传
      clearFileList();
      clearLastUploadedImage();
      
      // 添加AI回复
      const content = generatedImages 
        ? `成功生成了 ${generatedImages.length} 张单词卡图片！${generatedImages[0].url.startsWith('data:') ? ' (使用本地生成)' : ' (使用AI生成)'}`
        : '抱歉，图片生成失败，请稍后再试。';
      
      const images = generatedImages ? generatedImages.map(img => img.url) : [];
      const message = addAssistantMessage(content, images);
      
      // 将单词文本附加到消息中，用于语音朗读
      if (message && values.message) {
        message.word = values.message;
      }
    } catch (error) {
      console.error('AI调用失败:', error);
      addAssistantMessage('抱歉，我现在无法回答您的问题，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ 
        background: 'rgba(255, 255, 255, 0.97)', 
        padding: '0 40px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '22px',
              fontWeight: '800',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.45), 0 0 40px rgba(118, 75, 162, 0.2)',
              animation: 'logoFloat 3s ease-in-out infinite',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer'
            }}>
              夫
            </div>
            <Title level={3} style={{ 
              margin: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              fontSize: '20px'
            }}>
              夫子单词卡
            </Title>
          </div>
        </div>
      </Header>
        
      <Layout className="main-content-wrapper" style={{ padding: '24px' }}>
        <Content>
          {showWelcome ? (
            <WelcomePage onStartChat={handleStartChat} />
          ) : (
            <div className="page-dialog-card full-width-dialog">
              <div className="page-dialog-header">
                <div className="page-dialog-header-left">
                  <div className="page-dialog-header-avatar">
                    <MessageOutlined />
                  </div>
                  <div className="page-dialog-header-info">
                    <div className="page-dialog-header-title">AI 单词卡助手</div>
                    <div className="page-dialog-header-subtitle">在线 · 即时回复</div>
                  </div>
                </div>
                <div className="page-dialog-header-actions">
                  {/* 可以添加更多操作按钮 */}
                </div>
              </div>
              
              <div className="page-dialog-content">
                <MessageList messages={messages} isLoading={isLoading} />
                
                <ChatForm
                  form={form}
                  fileList={fileList}
                  uploadingImages={uploadingImages}
                  lastUploadedImage={lastUploadedImage}
                  isLoading={isLoading}
                  onUploadChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
