import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
const COUNT = 20 * 10 * 20;
const POSITIONS_LENGTH = COUNT * 3;
const Demo = () => {
  const { containerRef, setAnimation } = useThreeRenderer((scene, renderer, camera) => {
    const starsGeometry = new THREE.BufferGeometry();
    // 高斯随机生成函数
    const gaussianRandom = (mean = 0, stdDev = 1) => {
      let u = 1 - Math.random();
      let v = 1 - Math.random();
      return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    const positions = new Float32Array(POSITIONS_LENGTH);

    for (let i = 0; i < POSITIONS_LENGTH; i += 3) {
      positions[i] = gaussianRandom() * 50;
      positions[i + 1] = gaussianRandom() * 50;
      positions[i + 2] = gaussianRandom() * 50;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const colors = new Float32Array(POSITIONS_LENGTH);

    for (let i = 0; i < POSITIONS_LENGTH; i += 3) {
      const color = new THREE.Color().setHSL(Math.random(), 1.0, 0.8);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    const starsMaterial = new THREE.PointsMaterial({
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending, // ✨星星发光效果
    });

    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 设置相机位置
    camera.position.set(0, 0, 100);

    // 创建时钟优化动画时间间隔
    const clock = new THREE.Clock();
    // 动画循环
    const animate = () => {
      const delta = clock.getDelta();
      stars.rotation.y += delta * 0.05; // 星星缓慢旋转
    };
    setAnimation(animate);
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />; // 这里的style是为了让这个组件占满整个屏
};

export default Demo;
