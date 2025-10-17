import React from 'react';
import { Layout, Menu, Button, Card, Row, Col, Typography, Space } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  SettingOutlined, 
  AppstoreOutlined 
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

const App = () => {
  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '2',
      icon: <AppstoreOutlined />,
      label: '应用',
    },
    {
      key: '3',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            高顿 React 项目
          </Title>
          <Space>
            <Button type="primary">登录</Button>
            <Button>注册</Button>
          </Space>
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <Title level={2}>欢迎使用 Ant Design + React</Title>
                  <Paragraph>
                    这是一个使用 Ant Design 和 React 构建的现代化 Web 应用程序。
                    本项目集成了 Vite 作为构建工具，提供了快速的开发体验。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card title="快速开始" hoverable>
                  <Paragraph>
                    运行 <code>npm install</code> 安装依赖
                  </Paragraph>
                  <Paragraph>
                    运行 <code>npm run dev</code> 启动开发服务器
                  </Paragraph>
                  <Button type="primary" block>
                    开始使用
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card title="组件库" hoverable>
                  <Paragraph>
                    内置 Ant Design 组件库，包含丰富的 UI 组件
                  </Paragraph>
                  <Paragraph>
                    支持主题定制和国际化
                  </Paragraph>
                  <Button block>
                    查看文档
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card title="开发工具" hoverable>
                  <Paragraph>
                    Vite 提供快速的开发服务器和热重载
                  </Paragraph>
                  <Paragraph>
                    ESLint 确保代码质量
                  </Paragraph>
                  <Button block>
                    了解更多
                  </Button>
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
