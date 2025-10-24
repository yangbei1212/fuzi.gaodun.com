import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Badge } from 'antd';
import { 
  PictureOutlined, 
  RocketOutlined, 
  ThunderboltOutlined,
  StarOutlined,
  FireOutlined,
  HeartOutlined,
  TrophyOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const WelcomePage = ({ onStartChat }) => {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    users: 0,
    cards: 0,
    success: 0
  });

  const fullText = '专属单词卡';

  // 鼠标跟随效果
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 打字机效果
  useEffect(() => {
    setMounted(true);
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  // 光标闪烁
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // 数字滚动动画
  useEffect(() => {
    if (!mounted) return;
    
    const targetStats = {
      users: 10000,
      cards: 50000,
      success: 98
    };
    
    const duration = 2000; // 2秒
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);
      
      setStats({
        users: Math.floor(targetStats.users * easeOutQuad),
        cards: Math.floor(targetStats.cards * easeOutQuad),
        success: Math.floor(targetStats.success * easeOutQuad)
      });
      
      if (currentStep >= steps) {
        setStats(targetStats);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <Card className="welcome-page-card">
      {/* 鼠标跟随光晕 */}
      <div 
        className="mouse-glow"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`
        }}
      />

      {/* 动态光效层 */}
      <div className="glow-orbs">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      {/* 精致粒子背景 - 多层效果 */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${12 + Math.random() * 12}s`,
              width: i % 3 === 0 ? '4px' : '3px',
              height: i % 3 === 0 ? '4px' : '3px',
              opacity: 0.3 + Math.random() * 0.5
            }}
          />
        ))}
      </div>

      {/* 浮动装饰元素 */}
      <div className="floating-shapes">
        <div className="shape shape-1"><StarOutlined /></div>
        <div className="shape shape-2"><FireOutlined /></div>
        <div className="shape shape-3"><HeartOutlined /></div>
        <div className="shape shape-4"><TrophyOutlined /></div>
        <div className="shape shape-5"><BulbOutlined /></div>
      </div>

      <div className={`welcome-page-content ${mounted ? 'mounted' : ''}`}>
        {/* Hero Section - Apple Style */}
        <div className="hero-section">
          {/* 小标签 */}
          <div className="hero-badge-top">
            <Badge 
              count={<span style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>AI驱动</span>} 
            />
          </div>
          
          {/* 超大标题区 */}
          <div className="hero-title-section">
            <Title level={1} className="hero-title">
              用AI创作
            </Title>
            <Title level={1} className="hero-title-highlight">
              {typedText}
              <span className={`typing-cursor ${showCursor ? 'visible' : 'hidden'}`}>|</span>
            </Title>
            <Paragraph className="hero-description hero-description-animated">
              告别枯燥背单词，用你喜欢的照片生成个性化学习卡片
            </Paragraph>
          </div>

          {/* 主CTA */}
          <div className="hero-cta">
            <Button 
              type="primary" 
              size="large" 
              onClick={onStartChat}
              className="primary-cta-btn"
              icon={<RocketOutlined />}
            >
              开始创作
            </Button>
            <Text className="hero-cta-hint">
              免费试用 · 无需注册
            </Text>
          </div>

          {/* 社会证明 - 精简版 */}
          <div className="social-proof">
            <div className="proof-item">
              <span className="proof-number">{stats.users.toLocaleString()}+</span>
              <span className="proof-label">学习用户</span>
            </div>
            <div className="proof-divider">·</div>
            <div className="proof-item">
              <span className="proof-number">{stats.cards.toLocaleString()}+</span>
              <span className="proof-label">生成卡片</span>
            </div>
            <div className="proof-divider">·</div>
            <div className="proof-item">
              <span className="proof-number">{stats.success}%</span>
              <span className="proof-label">好评率</span>
            </div>
          </div>
        </div>

        {/* Features Section - 极简三列 */}
        <div className="features-section">
          <div className="feature-card" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon-minimal">
              <PictureOutlined />
            </div>
            <Title level={4} className="feature-title-minimal">个性化卡片</Title>
            <Paragraph className="feature-desc-minimal">
              上传照片，AI智能生成专属学习卡
            </Paragraph>
          </div>
          
          <div className="feature-card" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon-minimal">
              <ThunderboltOutlined />
            </div>
            <Title level={4} className="feature-title-minimal">场景记忆</Title>
            <Paragraph className="feature-desc-minimal">
              结合图片场景，让单词印象更深刻
            </Paragraph>
          </div>
          
          <div className="feature-card" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon-minimal">
              <RocketOutlined />
            </div>
            <Title level={4} className="feature-title-minimal">高效学习</Title>
            <Paragraph className="feature-desc-minimal">
              正反两面设计，科学记忆更轻松
            </Paragraph>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WelcomePage;
