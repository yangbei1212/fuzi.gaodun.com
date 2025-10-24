import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Badge, Modal } from 'antd';
import { 
  PictureOutlined, 
  RocketOutlined, 
  ThunderboltOutlined,
  StarOutlined,
  FireOutlined,
  HeartOutlined,
  TrophyOutlined,
  BulbOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const WelcomePage = ({ onStartChat, cardImages = [] }) => {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    users: 0,
    cards: 0,
    success: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const fullText = '专属单词卡';
  
  // 案例组数据：每个案例包含封面图和对应的组图
  const cardGroups = [
    {
      id: 1,
      cover: 'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/ec9d1_20251024152449.jpeg',
      images: [
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/ec9d1_20251024152449.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/da766_20251024153226.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/c1a11_20251024153604.jpeg'
      ]
    },
    {
      id: 2,
      cover: 'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/7a597_20251024155618.jpeg',
      images: [
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/7a597_20251024155618.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/12bd7_20251024161702.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/ba71c_20251024160656.jpeg'
      ]
    },
    {
      id: 3,
      cover: 'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/53be3_20251024154908.jpeg',
      images: [
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/53be3_20251024154908.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/567dd_20251024155445.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/20e3a_20251024155243.jpeg'
      ]
    },
    {
      id: 4,
      cover: 'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/bb600_20251024154510.jpeg',
      images: [
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/bb600_20251024154510.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/f60c9_20251024154610.jpeg',
        'https://simg01.gaodunwangxiao.com/uploadfiles/tmp/upload/202510/24/eda15_20251024155933.jpeg'
      ]
    }
  ];
  
  // 当前选中组的图片
  const currentGroupImages = cardGroups[currentGroupIndex]?.images || [];

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

  const handleCardClick = (groupIndex) => {
    setCurrentGroupIndex(groupIndex);
    setCurrentCardIndex(0); // 从第一张开始
    setModalVisible(true);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev === 0 ? currentGroupImages.length - 1 : prev - 1));
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev === currentGroupImages.length - 1 ? 0 : prev + 1));
  };

  const handleFanCardClick = (index) => {
    setCurrentCardIndex(index);
  };

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
        {/* 上部分：左右分布 */}
        <div className="welcome-top-section">
          {/* 左侧区域 70% */}
          <div className="welcome-left-area">
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
            </div>
          </div>

      
        </div>

        {/* 下部分：三个9:16卡片 */}
        <div className="welcome-bottom-section">
          <div className="card-showcase-title">
            <Title level={3} className="showcase-title">精选案例</Title>
            <Paragraph className="showcase-subtitle">查看AI生成的精美单词卡（ 流行ip 偶像 宠物 萌娃 ）</Paragraph>
          </div>
          
          <div className="card-showcase-grid">
            {cardGroups.map((group, index) => (
              <div 
                key={group.id} 
                className="showcase-card-item"
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => handleCardClick(index)}
              >
                <div className="showcase-card-inner">
                  <img 
                    src={group.cover} 
                    alt={`Card ${index + 1}`}
                    className="showcase-card-image"
                  />
                  <div className="showcase-card-overlay">
                    <div className="showcase-card-hover-text">
                      <span>点击查看</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 走马灯轮播图弹窗 */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="60vw"
        centered
        className="carousel-modal-wrapper"
        styles={{
          body: { padding: 0 }
        }}
      >
        <div className="carousel-container">
          {/* 主图区域 */}
          <div className="carousel-main-area">
            {/* 左箭头 */}
            <button className="carousel-nav-btn carousel-prev" onClick={handlePrevCard}>
              <LeftOutlined />
            </button>

            {/* 轮播图片 */}
            <div className="carousel-track-wrapper">
              <div 
                className="carousel-track"
                style={{
                  transform: `translateX(calc(-${currentCardIndex * 100}% - ${currentCardIndex * 24}px))`
                }}
              >
                {currentGroupImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === currentCardIndex ? 'active' : ''}`}
                    onClick={() => index !== currentCardIndex && setCurrentCardIndex(index)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Card ${index + 1}`}
                      className="carousel-item-image"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 右箭头 */}
            <button className="carousel-nav-btn carousel-next" onClick={handleNextCard}>
              <RightOutlined />
            </button>
          </div>

          {/* 底部指示器 */}
          <div className="carousel-indicators">
            {currentGroupImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentCardIndex ? 'active' : ''}`}
                onClick={() => setCurrentCardIndex(index)}
              />
            ))}
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default WelcomePage;
