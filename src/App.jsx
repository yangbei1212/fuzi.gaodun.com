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
    getFirstImageUrl 
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
      
      // 清空文件列表
      clearFileList();
      
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
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '0 32px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              animation: 'logoFloat 3s ease-in-out infinite'
            }}>
              夫
            </div>
            <Title level={3} style={{ 
              margin: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              夫子单词卡
            </Title>
          </div>
        </div>
      </Header>
        
      <Layout style={{ padding: '24px' }}>
        <Content>
          {showWelcome ? (
            <WelcomePage onStartChat={handleStartChat} />
          ) : (
            <div className="page-dialog-card full-width-dialog">
              <div className="page-dialog-header">
                <MessageOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                <span>智能对话助手</span>
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
                  onClearLastImage={clearLastUploadedImage}
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
