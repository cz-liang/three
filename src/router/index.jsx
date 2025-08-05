import { createHashRouter, RouterProvider } from 'react-router-dom';
import { useState } from 'react';
import { Spin } from 'antd';

// 路由
import { initRoutes } from './routes.jsx';

let Router;
const initialRouter = createHashRouter(initRoutes);
const RouterWithRedux = () => {
  const [router] = useState(initialRouter);

  if (!router) {
    return <Spin size="large" />;
  }

  return <RouterProvider router={router} />;
};

export { Router };
export default RouterWithRedux;
