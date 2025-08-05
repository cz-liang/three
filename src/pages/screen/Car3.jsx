import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const CarScene = () => {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const wheelRef = useRef(null);
  const carRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const targetPointRef = useRef(new THREE.Vector3(0, 0, 0));
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y = 0 平面
  const dotRef = useRef(null);
  const prevPositionRef = useRef(new THREE.Vector3()); // 位置跟踪引用
  const isMovingRef = useRef(false);

  // 初始化场景
  const initScene = useCallback((scene, renderer, camera, controls) => {
    sceneRef.current = scene;
    cameraRef.current = camera;
    camera.position.set(50, 70, 50);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 可选，柔和阴影

    // 修改平行光设置，使其成为主阴影光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.8);
    directionalLight.position.set(-40, 100, -40); // 提高Y轴位置
    directionalLight.castShadow = true; // 启用阴影
    directionalLight.shadow.mapSize.width = 2048; // 提高阴影质量
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);

    // 平行光助手
    // const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(helper);

    // // 添加坐标轴
    // const axesHelper = new THREE.AxesHelper(20);
    // scene.add(axesHelper);

    // 创建地板
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI * -0.5;
    plane.receiveShadow = true; // ✅ 接收阴影
    scene.add(plane);

    // 创建车子- 主方向为X轴正方向
    const carGroup = new THREE.Group();
    carGroup.position.set(0, 2, 0);
    carGroup.rotation.y = Math.PI / 2; // 初始旋转90度，面向X轴正方向

    // 创建车轮
    const createWheel = (x, z) => {
      const group = new THREE.Group();
      group.position.x = x;
      group.position.z = z;

      // 车轮 圆柱
      const wheelGeometry = new THREE.CylinderGeometry(2, 2, 2, 32);
      const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0xd58923,
        shininess: 100,
        transparent: true,
        opacity: 1, // 适当减少透明度
        side: THREE.DoubleSide,
      });
      wheelGeometry.rotateX(Math.PI / 2);
      // wheelGeometry.rotateY(Math.PI / 2);

      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);

      group.add(wheel);
      // 添加胎痕方块
      const treadCount = 8; // 胎痕数量
      const treadWidth = 0.5; // 胎痕宽度
      const treadHeight = 2.4; // 胎痕高度
      const treadLength = 0.8; // 胎痕长度

      for (let i = 0; i < treadCount; i++) {
        // 计算胎痕在圆周上的位置
        const angle = (i / treadCount) * Math.PI * 2;
        const radius = 2; // 车轮半径

        // 创建胎痕方块
        const treadGeometry = new THREE.BoxGeometry(treadLength, treadHeight, treadWidth);
        const treadMaterial = new THREE.MeshPhongMaterial({ color: 0xd58923 });
        const tread = new THREE.Mesh(treadGeometry, treadMaterial);

        // 定位胎痕
        tread.position.x = Math.cos(angle) * radius;
        tread.position.y = Math.sin(angle) * radius;
        tread.position.z = 0;

        // 旋转胎痕使其与车轮表面垂直
        tread.rotation.z = angle;

        tread.rotateX(Math.PI / 2);
        tread.rotateY(Math.PI / 2);

        // 将胎痕添加到车轮组
        group.add(tread);
      }
      return group;
    };
    // 创建轴线
    const createAxis = (x, z, length = 8) => {
      // 车轮 轴承
      const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, length, 32);
      const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0xd58923,
      });
      wheelGeometry.rotateX(Math.PI / 2);
      const axis = new THREE.Mesh(wheelGeometry, wheelMaterial);
      axis.position.x = x;
      axis.position.z = z;
      return axis;
    };
    // 创建底盘
    const createChassis = (x, z) => {
      // 底盘 长方体
      const chassisGeometry = new THREE.BoxGeometry(10, 0.6, 5);
      const chassisMaterial = new THREE.MeshPhongMaterial({
        color: 0xd58923,
      });

      const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
      chassis.position.x = x;
      chassis.position.z = z;
      return chassis;
    };

    // 创建四个车轮
    const wheels = [createWheel(-5, -4), createWheel(5, -4), createWheel(-5, 4), createWheel(5, 4)];
    wheelRef.current = wheels;
    // 创建两个轴
    const axis = [createAxis(5, 0), createAxis(-5, 0)];
    // 当作车灯
    const axis1 = createAxis(6, -1, 2);
    const axis2 = createAxis(6, 1, 2);
    axis1.rotation.y = Math.PI / 2; // 旋转90度
    axis2.rotation.y = Math.PI / 2; // 旋转90度
    // 创建底盘
    const chassis = createChassis(0, 0);
    carGroup.add(...wheels, ...axis, chassis, axis1, axis2);
    carGroup.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    carRef.current = carGroup;

    scene.add(carGroup);

    const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.name = 'targetDot';
    dotRef.current = dot;
    scene.add(dot);
  }, []);

  // 获取Three.js渲染器钩子
  const { containerRef, setAnimation } = useThreeRenderer(initScene);

  useEffect(() => {
    // 添加鼠标移动事件监听
    const handleMouseMove = event => {
      // 1. 将鼠标从屏幕坐标转换为 NDC 坐标
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 2. 使用 raycaster 从相机发射射线
      raycaster.setFromCamera(mouse, cameraRef.current);

      // 3. 计算射线与 y=0 平面的交点
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, point);

      // 4. 存储交点
      targetPointRef.current.copy(point);
      dotRef.current.position.copy(point);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 设置动画循环
  useEffect(() => {
    setAnimation(() => {
      if (!carRef.current) return true;
      const car = carRef.current;
      const target = targetPointRef.current;
      // 计算朝向角度
      const dx = target.x - car.position.x;
      const dz = target.z - car.position.z;
      // Math.sqrt 计算平方根，勾股定理（计算 直角三角形的斜边长度， 也就是车子和目标点的直线长度）
      const distance = Math.sqrt(dx * dx + dz * dz); // 计算距离
      // 判断是否到达目标点（停止条件）
      const isStopped = distance < 1.0; // 1.0是停止阈值，可根据需要调整
      if (!isStopped) {
        // 车辆移动逻辑
        // 车子角度
        const targetAngle = Math.atan2(dz, dx);
        car.rotation.y = -targetAngle;
        // 解释： 0.02是移动速度，Math.min(distance, 10)是限制最大速度
        const moveSpeed = 0.02 * Math.min(distance, 10); // 限制最大速度
        // 解释： 创建一个向量，并设置其X、Y和Z分量为移动速度和距离的比值，然后乘以移动方向
        const v3 = new THREE.Vector3((moveSpeed * dx) / distance, 0, (moveSpeed * dz) / distance);
        car.position.add(v3);

        // 旋转车轮（速度与移动距离相关）
        const wheelSpeed = 0.05 * (moveSpeed / 0.1); // 动态车轮速度
        wheelRef.current.forEach(wheel => {
          wheel.rotation.z -= wheelSpeed;
        });

        isMovingRef.current = true;
      } else if (isMovingRef.current) {
        // 刚从运动状态变为停止状态
        isMovingRef.current = false;
        // 可以在这里添加停止特效或其他逻辑
      }

      // 更新前一帧位置（用于更精确的移动检测）
      prevPositionRef.current.copy(car.position);
      return true;
    });
  }, [setAnimation]);

  return <div style={{ width: '100%', height: '100vh' }} ref={containerRef} />;
};

export default CarScene;
