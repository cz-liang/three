import React, { use, useEffect } from 'react';
import { Layout, Space, Button, Dropdown } from 'antd';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import layoutRoutes from '@/router/routes';
const { Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路由信息
  const [pages, setPages] = React.useState([]);
  useEffect(() => {
    setPages(layoutRoutes.filter(im => !im.hidden).map(item => ({ ...item, path: item.path || '/' })));
  }, [layoutRoutes]);

  const [selectTitle, setSelectTitle] = React.useState('');

  useEffect(() => {
    setSelectTitle(pages.find(scene => scene.path === location.pathname)?.title || '');
  }, [location.pathname, pages]);

  return (
    <Layout style={{ height: '100vh' }}>
      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 2 }}>
        <Dropdown
          menu={{
            items: pages.map(item => ({
              key: item.path,
              label: item.title,
              icon: item.icon,
              onClick: () => {
                setSelectTitle(item.title);
                navigate(item.path);
              },
            })),
          }}
        >
          <Button size="small" type="primary">
            <Space>
              {selectTitle}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
      <Content>
        <div style={{ width: '100%', height: '100%' }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
