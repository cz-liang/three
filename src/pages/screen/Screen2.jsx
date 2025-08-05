import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer'; // 假设你的渲染hook在这里
import useCameraControl from '@/hooks/useCameraControl'; // 导入优化后的视角控制Hook
import TWEEN from '@tweenjs/tween.js';

const LoginScene = () => {
  const arrowRef = useRef();
  const cameraRef = useRef();
  const { switchView } = useCameraControl();
  useEffect(() => {
    switchView(cameraRef.current);
  }, [cameraRef]);

  const { containerRef } = useThreeRenderer((scene, renderer, camera) => {
    cameraRef.current = camera; // 更新cameraRef

    // 创建办公桌
    const deskGeometry = new THREE.BoxGeometry(5, 0.2, 3);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = 0;
    scene.add(desk);

    // 创建电脑显示器
    const monitorGeometry = new THREE.BoxGeometry(4, 2, 0.1);
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(0, 2, -1);
    scene.add(monitor);

    // 创建键盘
    const keyboardGeometry = new THREE.BoxGeometry(0.8, 2, 0.1);
    const keyboardMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.position.set(0, 0.2, 0);
    scene.add(keyboard);

    // 创建指示箭头
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 32);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(2, 1, 0);
    arrow.rotation.x = Math.PI / 2;
    arrowRef.current = arrow;
    scene.add(arrow);

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 相机位置初始化
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();

      if (arrowRef.current) {
        arrowRef.current.rotation.z += 0.02;
        arrowRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.2 + 1;
      }
    };
    animate();
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        cursor: 'pointer',
      }}
    />
  );
};

export default LoginScene;
