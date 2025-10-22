import React from 'react';
import { Card, Typography, Button } from 'antd';
import { MessageOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const WelcomePage = ({ onStartChat }) => {
  return (
    <Card className="welcome-page-card">
      <div className="welcome-page-content">
        <div className="welcome-hero">
          <div className="welcome-icon">
            <MessageOutlined />
          </div>
          <Title level={1} className="welcome-title">
            欢迎使用夫子单词卡
          </Title>
          <Paragraph className="welcome-subtitle">
            智能AI助手，让英语学习更高效
          </Paragraph>
        </div>
        
        <div className="welcome-features">
          <div className="feature-item">
            <div className="feature-icon">
              <MessageOutlined />
            </div>
            <div className="feature-content">
              <Title level={4}>智能对话</Title>
              <Paragraph>与AI助手进行自然对话，解答学习疑问</Paragraph>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <PlusOutlined />
            </div>
            <div className="feature-content">
              <Title level={4}>图片识别</Title>
              <Paragraph>上传图片，AI智能识别并生成学习内容</Paragraph>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <UserOutlined />
            </div>
            <div className="feature-content">
              <Title level={4}>个性化学习</Title>
              <Paragraph>根据您的学习进度，提供定制化学习方案</Paragraph>
            </div>
          </div>
        </div>
        
        <div className="welcome-actions">
          <Button 
            type="primary" 
            size="large" 
            onClick={onStartChat}
            className="start-chat-btn"
            icon={<MessageOutlined />}
          >
            开始对话
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WelcomePage;
