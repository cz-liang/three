import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const Demo = () => {
  /// 记录每个粒子的恢复定时器
  const restoreColorTimers = new Map();
  const container = useRef();
  const defaultRotationSpeed = 0.003; // 默认旋转速度
  let rotationSpeed = defaultRotationSpeed;
  let isMouseDown = false;
  const mouse = new THREE.Vector2();

  const onMouseDown = () => (isMouseDown = true);
  const onMouseUp = () => {
    isMouseDown = false;
    rotationSpeed = defaultRotationSpeed;
  };
  // 鼠标移动事件处理函数
  const onMouseMove = event => {
    // 计算鼠标在标准化设备坐标中的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  // 鼠标移出窗口事件处理函数
  const onMouseLeave = () => {
    // 将 mouse 置空，禁用射线检测
    mouse.x = Infinity; // 设置为无效值
    mouse.y = Infinity;
  };

  const { containerRef, setAnimation, removeAnimation } = useThreeRenderer((scene, renderer, camera, controls) => {
    container.current = containerRef.current;

    // 创建正圆圆环几何体
    const radius = 20; // 圆环半径
    const tubeRadius = 4; // 管道半径
    const radialSegments = 150; // 径向分段数
    const tubularSegments = 400; // 管道分段数

    const torusGeometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);

    // 创建点材质，开启顶点颜色
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 1,
      vertexColors: true, // 确保启用顶点颜色
      color: 0xffffff, // 设置默认颜色为白色，避免覆盖顶点颜色
    });

    // 为每个顶点设置初始颜色
    const colors = new Float32Array(torusGeometry.attributes.position.count * 3);
    for (let i = 0; i < torusGeometry.attributes.position.count; i++) {
      const color = new THREE.Color('#00e9ec');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    torusGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 创建点云
    const points = new THREE.Points(torusGeometry, pointMaterial);
    points.rotation.x = Math.PI / 2; // 使圆环垂直于 X 轴
    // controls.target.set(0, 0, 0);
    // 添加圆环点云到场景
    scene.add(points);

    camera.position.set(20, 0, 5);
    controls.target.set(20, 0, 5);

    container.current.addEventListener('mousedown', onMouseDown);
    container.current.addEventListener('mouseup', onMouseUp);
    container.current.addEventListener('mousemove', onMouseMove);
    container.current.addEventListener('mouseleave', onMouseLeave);

    // 用于射线检测的对象
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.5; // 缩小射线检测范围

    // 动画循环
    const animate = () => {
      if (isMouseDown) {
        // 逐渐增加旋转速度
        rotationSpeed += 0.00005;
      }
      // 圆环围绕 y 轴滚动
      points.rotation.z += rotationSpeed; // 绕 z 轴旋转（模拟滚动）

      // 检测鼠标与粒子的碰撞
      if (!isNaN(mouse.x) && !isNaN(mouse.y)) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(points);

        if (intersects.length > 0) {
          const closestIntersect = intersects[0];
          const index = closestIntersect.index;

          // 如果命中新的点，且它没有恢复定时器
          if (!restoreColorTimers.has(index)) {
            const color = new THREE.Color('#ff0000');
            const colorsAttribute = torusGeometry.attributes.color;
            colorsAttribute.setXYZ(index, color.r, color.g, color.b);
            colorsAttribute.needsUpdate = true;

            // 创建该点的恢复颜色定时器
            const timer = setTimeout(() => {
              const defaultColor = new THREE.Color('#00e9ec');
              colorsAttribute.setXYZ(index, defaultColor.r, defaultColor.g, defaultColor.b);
              colorsAttribute.needsUpdate = true;

              restoreColorTimers.delete(index); // 清理已完成的定时器
            }, 500);

            restoreColorTimers.set(index, timer);
          }
        }
      }
      // requestAnimationFrame(animate);
      // renderer.render(scene, camera);
    };

    setAnimation(animate);
  });

  useEffect(() => {
    return () => {
      console.log('时光隧道,清理');
      restoreColorTimers.forEach(timer => clearTimeout(timer));
      restoreColorTimers.clear();

      container.current.removeEventListener('mousedown', onMouseDown);
      container.current.removeEventListener('mouseup', onMouseUp);
      container.current.removeEventListener('mouseleave', onMouseLeave);
      container.current.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Demo;
