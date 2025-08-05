import * as THREE from 'three';
import * as d3 from 'd3';
import gsap from 'gsap';

// 平滑移动相机到新位置
export const smoothMoveCamera = (camera, controls, centerX, centerY, distance) => {
  gsap.to(camera.position, {
    x: centerX,
    y: -centerY - 50,
    z: distance / 3,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.lookAt(centerX, -centerY, 0);
      controls.target.set(centerX, -centerY, 0);
      controls.update();
    },
  });
};

// 封装创建省份网格的逻辑
export const createProvinceMesh = (
  coordinates,
  type,
  projection,
  color,
  extrudeSettings,
  material,
  name,
  code,
  showCountry,
  scale,
) => {
  // 定一个省份3D对象
  const province = new THREE.Object3D();
  const processPolygon = polygon => {
    const shape = new THREE.Shape();
    for (let i = 0; i < polygon.length; i++) {
      let [x, y] = projection(polygon[i]);
      if (i === 0) {
        shape.moveTo(x, -y);
      }
      shape.lineTo(x, -y);
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new THREE.Mesh(geometry, material);

    // 设置0.2内的随机高度
    // mesh.scale.set(1, 1, 1 + Math.random() * 0.2);
    mesh._color = color;
    mesh._name = name;
    mesh.code = code;
    mesh.type = 'map';
    if (!showCountry) {
      mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
    }

    province.add(mesh);
  };

  if (type === 'MultiPolygon') {
    coordinates.forEach(multiPolygon => {
      multiPolygon.forEach(processPolygon);
    });
  } else if (type === 'Polygon') {
    processPolygon(coordinates[0]);
  }
  return province;
};

const spotHeartbeat = obj => {
  // 创建一个 gsap 时间线
  const timeline = gsap.timeline({
    duration: 0.3, // 动画持续时间为 1 秒
    ease: 'Elastic.easeOut.config(1, 0.3)', // 使用 Elastic.easeOut 并配置弹性参数
    yoyo: true, // 动画往返播放
    repeat: -1, // 无限循环
  });

  // 将位置和缩放动画添加到时间线中
  timeline.to(
    obj.scale,
    {
      x: 0.6,
      y: 0.6,
      z: 0.6,
    },
    0,
  ); // 第二个参数为 0 表示两个动画同时开始
};

// 绘制圆点
export const drawSpot = (coord, projection) => {
  if (coord && coord.length) {
    const [pointX, pointY] = projection(coord);
    const POSITION_Z = 0.1;

    // 绘制圆点
    const spotGeometry = new THREE.CircleGeometry(0.25, 100);
    const spotMaterial = new THREE.MeshBasicMaterial({
      color: '#ff8416',
      side: THREE.DoubleSide,
    });
    const circle = new THREE.Mesh(spotGeometry, spotMaterial);
    circle.position.set(pointX, -pointY, POSITION_Z);
    spotHeartbeat(circle);

    // 圆环
    const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 50);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: '#ed7000',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(pointX, -pointY, POSITION_Z);
    spotHeartbeat(ring);

    return { circle, ring };
  }
};

// 绘制线
export const drawLine = (point1, point2, projection) => {
  if (!point1 || !point2) return;
  const [x1, y1] = projection(point1);
  const [x2, y2] = projection(point2);

  // 计算控制点，使弧线向上凸起
  const controlX = (x1 + x2) / 2;
  const controlY = (y1 + y2) / 2;
  const controlZ = 10; // 可根据需要调整弧线高度

  // 创建二次贝塞尔曲线
  const startPoint = new THREE.Vector3(x1, -y1, 0.1);
  const controlPoint = new THREE.Vector3(controlX, -controlY, controlZ);
  const endPoint = new THREE.Vector3(x2, -y2, 0.1);
  const curve = new THREE.QuadraticBezierCurve3(startPoint, controlPoint, endPoint);

  // 获取曲线上的点
  const points = curve.getPoints(50); // 可根据需要调整点数
  const positions = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) {
    positions[i * 3] = points[i].x;
    positions[i * 3 + 1] = points[i].y;
    positions[i * 3 + 2] = points[i].z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: '#905b01',
    transparent: true,
    opacity: 0.3,
  });
  const line = new THREE.Line(geometry, material);
  // 创建圆点
  const dotGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const dotMaterial = new THREE.MeshBasicMaterial({
    color: '#feb943',
    transparent: true,
    opacity: 0.8,
  });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);

  // 添加圆点到场景中
  line.add(dot);

  // 定义圆点动画
  gsap.to(dot.position, {
    // 动画无限循环
    repeat: -1,
    // 线性缓动，匀速移动
    ease: 'linear',
    // 动画每次更新时执行的回调函数
    onUpdate: () => {
      // 获取当前的 t 值并增加 0.002
      let t = gsap.getProperty(dot.position, 't') + 0.002;
      // 确保 t 值在 0 到 1 之间循环
      t = gsap.utils.wrap(0, 1, t);
      // 更新到圆点的位置对象中
      gsap.set(dot.position, { t });
      // 根据新的 t 值更新圆点的位置
      dot.position.copy(curve.getPointAt(t));
    },
  });

  return line;
};
