import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import { ReloadOutlined } from '@ant-design/icons';

const Demo = () => {
  const { containerRef, reset, setAnimation } = useThreeRenderer((scene, renderer, camera, controls) => {
    // 创建轨道（S 形曲线）
    // const path = new THREE.CatmullRomCurve3([
    //   new THREE.Vector3(200, 0, 0),
    //   new THREE.Vector3(100, 0, 100),
    //   new THREE.Vector3(0, 0, 200),
    //   new THREE.Vector3(-100, 0, 100),
    //   new THREE.Vector3(-200, 0, 0),
    //   new THREE.Vector3(-100, 0, -100),
    //   new THREE.Vector3(0, 0, -200),
    // ]);
    // 生成随机控制点
    const points = [];
    const numPoints = 10; // 控制点数量
    const maxHeight = 20; // 最大起伏高度
    const maxDeviation = 100; // 最大水平偏移
    const stepSize = 100; // 每个点在 X 方向上的步长
    let x = 1000; // 初始 X 坐标
    for (let i = 0; i < numPoints; i++) {
      // X 坐标单调递增
      x -= stepSize;
      // Z 坐标随机变化
      const z = -(Math.random() - 0.5) * maxDeviation;
      // // 在 XZ 平面上生成不规则的点
      // const x = (i - numPoints / 2) * 100 + (Math.random() - 0.5) * maxDeviation;
      // const z = (i - numPoints / 2) * 100 + (Math.random() - 0.5) * maxDeviation;

      // 在 Y 轴上引入起伏
      const y = Math.sin(i * 0.5) * maxHeight + (Math.random() - 0.5) * maxHeight * 0.5;

      points.push(new THREE.Vector3(x, y, z));
    }

    // 创建 Catmull-Rom 曲线
    const path = new THREE.CatmullRomCurve3(points);

    // 设置曲线为闭合曲线（可选）
    // path.closed = true;

    // 定义一个二维形状，用于拉伸成面体
    const shape = new THREE.Shape();
    const width = 30; // 面体的宽度
    const halfWidth = width / 2;
    const pathHeight = 2;
    // 创建一个有厚度的矩形形状
    shape.moveTo(-pathHeight, -halfWidth);
    shape.lineTo(pathHeight, -halfWidth);
    shape.lineTo(pathHeight, halfWidth);
    shape.lineTo(-pathHeight, halfWidth);
    shape.closePath();

    // 定义拉伸设置
    const extrudeSettings = {
      steps: 200, // 拉伸的步数
      bevelEnabled: false, // 不启用倒角
      extrudePath: path, // 指定拉伸路径
    };

    // 创建拉伸几何体
    const extrudedGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // 创建材质
    const extrudedMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, side: THREE.DoubleSide });

    // 创建网格模型
    const extrudedMesh = new THREE.Mesh(extrudedGeometry, extrudedMaterial);
    scene.add(extrudedMesh);

    // 创建火车（多个长方体首尾相连）
    const trainGroup = new THREE.Group(); // 创建一个组来包含火车的各个部分
    const carriageCount = 5; // 火车车厢的数量
    const carriageLength = 20; // 每个车厢的长度
    const carriageWidth = 10; // 每个车厢的宽度
    const carriageHeight = 10; // 每个车厢的高度
    const gap = 2; // 车厢之间的间隙

    for (let i = 0; i < carriageCount; i++) {
      const trainGeometry = new THREE.BoxGeometry(carriageWidth, carriageHeight, carriageLength);
      const trainMaterial = new THREE.MeshPhongMaterial({ color: '#cda25f' });
      const carriage = new THREE.Mesh(trainGeometry, trainMaterial);
      // 设置每个车厢的位置，让它们首尾相连
      carriage.position.z = -(carriageLength + gap) * i;
      trainGroup.add(carriage);
    }

    scene.add(trainGroup);

    // 设置相机位置
    camera.position.set(1100, 260, 0);
    // camera.lookAt(new THREE.Vector3(200, 0, 200));
    controls.target.set(500, 0, 0);
    controls.update();
    // 点光源
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.intensity = 6.0; // 强度
    pointLight.distance = 0; // 距离
    pointLight.decay = 0.1; // 衰减率 设置光源不随距离衰减
    pointLight.position.set(1050, 260, 0); // 点光源位置
    // 将点光源添加到场景中
    scene.add(pointLight);

    // 动画循环
    let t = 0;
    // 新增变量，用于控制移动方向，1 表示正向，-1 表示反向
    let direction = 1;

    // 动画循环
    const animate = () => {
      // 为每节车厢计算位置和方向
      for (let i = 0; i < trainGroup.children.length; i++) {
        // 计算每个车厢在轨道上的位置，考虑车厢长度和间隙
        const distanceAlongPath = t * path.getLength() - i * (carriageLength + gap);
        // 确保距离在轨道长度范围内
        let adjustedDistance = Math.max(0, Math.min(path.getLength(), distanceAlongPath));
        // 根据距离计算参数 t
        const adjustedT = path.getUtoTmapping(0, adjustedDistance);

        // 根据参数 adjustedT 计算轨道上的点和切线
        const point = path.getPoint(adjustedT);
        const tangent = path.getTangent(adjustedT);

        // 设置车厢的位置，添加 y 轴偏移量
        const yOffset = point.y + carriageHeight / 2 + pathHeight; // 火车高度本身 + 轨道高度
        point.y = yOffset;
        trainGroup.children[i].position.copy(point);

        // 计算车厢的旋转角度
        const lookAtPoint = point.clone().add(tangent);
        trainGroup.children[i].lookAt(lookAtPoint);
      }

      // 更新参数 t
      t += 0.001 * direction;

      // 反向判断，只改方向不重置 t
      if (t >= 1) direction = -1;
      if (t <= 0) direction = 1;
    };
    setAnimation(animate);
  });

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
      <ReloadOutlined
        onClick={reset}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#ffffff50',
          fontSize: '20px',
        }}
      />
    </div>
  );
};

export default Demo;
