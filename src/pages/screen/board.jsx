import React, { useRef } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const PaintBoard = () => {
  const { containerRef, setAnimation } = useThreeRenderer((scene, renderer, camera, controls) => {
    // 创建平面几何体作为画板
    const width = 100;
    const height = 100;
    const widthSegments = 100;
    const heightSegments = 100;
    const color = new THREE.Color('#00e9ec');

    const planeGeometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

    // 创建点材质，开启顶点颜色
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.5,
      transparent: true,
      opacity: 1,
      vertexColors: true,
      color: 0xffffff,
    });

    // 为每个顶点设置初始颜色
    const colors = new Float32Array(planeGeometry.attributes.position.count * 3);
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    planeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 创建点云
    const points = new THREE.Points(planeGeometry, pointMaterial);
    scene.add(points);
    camera.position.set(0, 0, 100);
    // 禁用 controls
    controls.enabled = false;

    // 🎯 鼠标交互 & 追踪状态
    let isMouseDown = false;
    let lastMouse = new THREE.Vector2(); // 记录上一帧鼠标位置
    const container = containerRef.current;

    // 🎯 按下、抬起监听
    container.addEventListener('mousedown', e => {
      isMouseDown = true;
      lastMouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });

    container.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // 🎯 射线检测配置
    const raycaster = new THREE.Raycaster();

    const mouse = new THREE.Vector2();

    // 🎯 改进鼠标移动：只更新鼠标坐标，不执行绘制
    const onMouseMove = event => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 🎯 重置画板功能
    const resetBoard = () => {
      const colorsAttribute = planeGeometry.attributes.color;
      for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
        colorsAttribute.setXYZ(i, color.r, color.g, color.b);
      }
      colorsAttribute.needsUpdate = true;
    };

    const resetButton = document.createElement('button');
    resetButton.textContent = '重置画板';
    resetButton.style.position = 'absolute';
    resetButton.style.top = '50px';
    resetButton.style.left = '50%';
    resetButton.style.transform = 'translateX(-50%)';
    resetButton.addEventListener('click', resetBoard);
    container.appendChild(resetButton);

    // 🎯 优化后的动画循环
    const drawColor = new THREE.Color('#ff0000'); // 笔迹颜色

    const animate = () => {
      if (isMouseDown) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(points);

        if (intersects.length > 0) {
          const colorsAttribute = planeGeometry.attributes.color;

          // 🎯 插值补点 —— 防止长按时断线
          const currentIntersect = intersects[0];
          const currentIndex = currentIntersect.index;
          const distance = lastMouse.distanceTo(mouse);

          if (distance > 0.01) {
            const step = Math.ceil(distance / 0.005); // 插值步数
            for (let j = 0; j <= step; j++) {
              const interpX = THREE.MathUtils.lerp(lastMouse.x, mouse.x, j / step);
              const interpY = THREE.MathUtils.lerp(lastMouse.y, mouse.y, j / step);

              raycaster.setFromCamera({ x: interpX, y: interpY }, camera);
              const midIntersects = raycaster.intersectObject(points);

              if (midIntersects.length > 0) {
                const midIndex = midIntersects[0].index;
                colorsAttribute.setXYZ(midIndex, drawColor.r, drawColor.g, drawColor.b);
              }
            }
            colorsAttribute.needsUpdate = true; // 只在有变化时更新
          }

          lastMouse.copy(mouse);
        }
      }
    };

    setAnimation(animate);
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default PaintBoard;
