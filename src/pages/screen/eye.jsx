import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const EyeScene = () => {
  const pupilRef = useRef(null);
  const mousePositionRef = useRef(new THREE.Vector2());

  // 初始化场景
  const initScene = useCallback((scene, renderer, camera, controls) => {
    camera.position.set(0, 0, 30);
    // 禁用 controls
    controls.enabled = false;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 10);
    scene.add(directionalLight);

    // 创建一个函数用于创建单个眼睛
    const createEye = x => {
      const group = new THREE.Group();
      group.position.x = x;

      // 白色眼球
      const eyeGeometry = new THREE.SphereGeometry(2, 24, 24);
      const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.95, // 适当减少透明度
        side: THREE.DoubleSide,
      });
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      group.add(eye);

      // 黑色瞳孔
      const pupilGeometry = new THREE.SphereGeometry(0.8, 50, 50);
      const pupilMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        specular: 0x222222,
        shininess: 150,
        reflectivity: 1, // 反射让瞳孔有镜面效果
      });
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.z = 1.6;
      group.add(pupil);

      scene.add(group);
      return { group, pupil };
    };

    // 创建左眼和右眼
    const leftEye = createEye(-2.8);
    const rightEye = createEye(2.8);

    // 保存两个瞳孔引用
    pupilRef.current = [leftEye.pupil, rightEye.pupil];
  }, []);

  // 获取Three.js渲染器钩子
  const { containerRef, setAnimation } = useThreeRenderer(initScene);

  // 监听鼠标移动事件;
  useEffect(() => {
    const handleMouseMove = event => {
      // 将鼠标位置归一化到[-1, 1]范围
      mousePositionRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePositionRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 设置动画循环
  useEffect(() => {
    setAnimation(() => {
      if (pupilRef.current.length === 2) {
        const maxOffset = 0.6;
        pupilRef.current.forEach(pupil => {
          pupil.position.x = mousePositionRef.current.x * maxOffset;
          pupil.position.y = mousePositionRef.current.y * maxOffset;
        });
      }
      return true;
    });
  }, [setAnimation]);

  return <div style={{ width: '100%', height: '100vh' }} ref={containerRef} />;
};

export default EyeScene;
