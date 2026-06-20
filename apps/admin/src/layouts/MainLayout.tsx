import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  PictureOutlined,
  BgColorsOutlined,
  TagOutlined,
  MessageOutlined,
  UserOutlined,
  NotificationOutlined,
  AuditOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/assets', icon: <PictureOutlined />, label: '素材管理' },
  { key: '/themes', icon: <BgColorsOutlined />, label: '主题配置' },
  { key: '/tags', icon: <TagOutlined />, label: '标签管理' },
  { key: '/feedbacks', icon: <MessageOutlined />, label: '用户反馈' },
  { key: '/reviews', icon: <AuditOutlined />, label: '内容审核' },
  { key: '/announcements', icon: <NotificationOutlined />, label: '公告推送' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 48, margin: 16, color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: '48px' }}>
          足迹手帐
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.nickname || '管理员'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
