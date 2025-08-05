import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const useThreeRenderer = initScene => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const statsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const animationsRef = useRef(null); // 🚀 保存所有模块的动画回调

  // 注册新动画回调
  const setAnimation = useCallback(callback => {
    animationsRef.current = callback;
  }, []);

  // 初始化渲染器
  const initRenderer = useCallback(() => {
    // antialias:true 开启抗锯齿
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // 适配高分辨率屏幕
    renderer.setClearColor(0x181a1f, 1); //设置背景颜色
    containerRef.current.appendChild(renderer.domElement);
    return renderer;
  }, []);

  // 初始化场景和相机
  const initSceneAndCamera = useCallback(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    // 调整 near 和 far 属性以扩大视野范围
    camera.near = 0.01;
    camera.far = 10000;
    camera.updateProjectionMatrix(); // 更新相机投影矩阵
    camera.position.set(1000, 1000, 1000);
    camera.lookAt(0, 0, 0);
    return { scene, camera };
  }, []);

  // 初始化灯光
  const initLight = useCallback(scene => {
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
  }, []);

  // 初始化控制器
  const initControls = useCallback((camera, renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 添加惯性
    return controls;
  }, []);

  // 处理窗口大小变化
  const handleResize = useCallback((renderer, camera) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }, []);

  // 重置场景
  const reset = useCallback(() => {
    if (sceneRef.current && cameraRef.current && controlsRef.current) {
      // 重置相机位置
      cameraRef.current.position.set(1000, 1000, 1000);
      cameraRef.current.lookAt(0, 0, 0);

      // 重置控制器
      controlsRef.current.reset();

      // 清空场景
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }

      // 重新初始化灯光
      initLight(sceneRef.current);

      // 重新初始化场景
      if (initScene) initScene(sceneRef.current, rendererRef.current, cameraRef.current, controlsRef.current);
    }
  }, [initScene]);

  const disposeScene = useCallback(scene => {
    scene.traverse(obj => {
      if (!obj.isMesh) return;

      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
      if (obj.texture) obj.texture.dispose();
    });
    scene.clear();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = initRenderer();
    const { scene, camera } = initSceneAndCamera();
    initLight(scene);
    const controls = initControls(camera, renderer);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    // 确保初始化场景的回调中传递正确的参数
    if (initScene) initScene(scene, renderer, camera, controls);
    //创建stats对象
    const stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = 'auto';
    stats.domElement.style.top = 'auto';
    stats.domElement.style.right = '0px';
    stats.domElement.style.bottom = '0px';
    // 将监视器添加到页面中
    document.body.appendChild(stats.domElement);
    statsRef.current = stats;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // 执行动画回调
      animationsRef.current && animationsRef.current();

      controls.update();
      //requestAnimationFrame循环调用的函数中调用方法update(),来刷新时间
      stats.update();
      renderer.render(scene, camera);
    };
    animate();

    // 监听窗口大小变化
    const resizeHandler = () => handleResize(renderer, camera);
    window.addEventListener('resize', resizeHandler);

    return () => {
      // 清理动画帧
      setAnimation(null);

      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeHandler);

      renderer.dispose(); // 释放 WebGLRenderer
      controls.dispose(); // 释放 OrbitControls

      // 释放场景中的所有对象
      disposeScene(sceneRef.current);

      renderer.forceContextLoss(); // 强制释放 WebGL 上下文
      // WARNING: Too many active WebGL contexts. Oldest context will be lost.
      // 在使用 Three.js 等库创建 WebGL 场景时，
      // 如果在组件卸载或者不再需要某个场景时，没有正确清理和销毁相关的 WebGL 上下文，
      // 这些上下文会一直保留在内存中，随着新的上下文不断创建，数量就会超出浏览器的限制。
      // 这也是内存泄漏的常见原因（）越来越占内存。

      // 移除 stats 监视器
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.domElement);
      }

      // 清空容器，防止残留的 canvas 影响下一次渲染
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [initScene]);

  return { containerRef, reset, setAnimation };
};

export default useThreeRenderer;
