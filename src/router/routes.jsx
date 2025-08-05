import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// layout中的页面路由信息，也是菜单当作是目录（后续存在菜单不展示的，加字段过滤，hidden:true）
const layoutRoutes = [
  {
    index: true, // 默认首页
    title: '火车',
    component: 'screen/train',
  },
  {
    path: '/stars',
    title: '繁星',
    component: 'screen/stars',
  },
  {
    path: '/fireworks',
    title: '烟花',
    component: 'screen/fireworks',
  },
  {
    path: '/time-tunnel',
    title: '时光隧道',
    component: 'screen/timeTunnel',
  },
  {
    path: '/board',
    title: '画板',
    component: 'screen/board',
  },
  {
    path: '/map',
    title: '地图',
    component: 'screen/map/index',
  },
  {
    path: '/car',
    title: '奔驰',
    component: 'screen/Car',
  },
  {
    path: '/car2',
    title: '车',
    component: 'screen/Car2',
  },
  {
    path: '/robot',
    title: '机器人',
    component: 'screen/Robot',
  },
  {
    path: '/eye',
    title: '眼睛',
    component: 'screen/eye',
  },
  {
    path: '/car3',
    title: '小车',
    component: 'screen/Car3',
  },
  {
    path: '/screen1',
    title: '场景1',
    component: 'screen/Screen1',
  },
  {
    path: '/screen2',
    title: '场景2',
    component: 'screen/Screen2',
  },
  {
    path: '/screen3',
    title: '场景3',
    component: 'screen/Screen3',
  },
  {
    path: '/screen4',
    title: '场景4',
    component: 'screen/Screen4',
  },
  {
    path: '/screen5',
    title: '场景5',
    component: 'screen/Screen5',
  },
];

// 定义菜单数据
const routers = [
  {
    path: '/',
    title: '首页',
    component: 'Layout',
    children: layoutRoutes,
  },
  {
    path: '*',
    title: '404',
    component: 'NotFound/index',
  },
];

// 预加载所有页面组件
const modules = import.meta.glob('/src/pages/**/*.jsx'); // 递归匹配所有 `jsx` 文件

// 加载中样式
const loadingStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// 递归生成路由
const generateRoutes = routers => {
  return routers.map(item => {
    // 方式一：使用 import 函数动态导入组件（vite 有警告提示）
    // const Component = lazy(() => import(`/src/pages/${item.component}`));
    // 方式二：使用预加载的模块（modules[componentPath] 相当于返回一个 () => import(`/src/pages/${item.component}`)函数 ）
    const componentPath = `/src/pages/${item.component}.jsx`;
    const Component = lazy(modules[componentPath]);
    const route = {
      path: item.path,
      title: item.title || '',
      index: item.index || false,
      element: (
        <Suspense
          fallback={
            <div style={loadingStyle}>
              <Spin size="large" />
            </div>
          }
        >
          <Component />
        </Suspense>
      ),
      children: !item.index && item.children && item.children.length ? generateRoutes(item.children) : null, // 设为首页index: true,时，不能存在子路由
    };
    return route;
  });
};

export default layoutRoutes;

// 初始化路由
export const initRoutes = generateRoutes(routers);
