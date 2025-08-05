import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const COUNT = 3000; // 每次生成的粒子数量
const MAX_LIFETIME = 5; // 最大生命周期时间（秒）
const MIN_LIFETIME = 2; // 最小生命周期时间（秒）

const Demo = () => {
  const { containerRef, setAnimation } = useThreeRenderer((scene, renderer, camera, controls) => {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3); // 存储粒子的位置
    const velocities = new Float32Array(COUNT * 3); // 存储粒子的速度
    const lifeTimes = new Float32Array(COUNT); // 存储粒子的生命周期
    const opacities = new Float32Array(COUNT); // 存储每个粒子的透明度
    const removeTimes = new Float32Array(COUNT); // 存储每个粒子的随机移除时间

    const gravity = -9.8; // 重力常量

    // 粒子材质
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending, // 粒子更亮
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 设置相机位置
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 30, 10);
    controls.update();

    // 创建时钟对象，用来控制动画更新
    const clock = new THREE.Clock();

    // 初始化粒子
    const createParticle = i => {
      // 所有粒子从同一个点 (0, 0, 0) 喷射
      positions[i * 3] = 0; // X坐标
      positions[i * 3 + 1] = 0; // Y坐标
      positions[i * 3 + 2] = 0; // Z坐标

      // 随机角度范围更大（增大倒三角角度）
      const angle = Math.random() * Math.PI * 2; // 随机角度（0 到 2π）
      const speed = Math.random() * 10 + 5; // 随机速度

      // 给每个粒子一个随机的初始速度，向外扩散
      velocities[i * 3] = Math.random() * 0.6 * Math.cos(angle) * speed; // X方向
      velocities[i * 3 + 1] = Math.random() * 15 + 15; // Y方向，模拟向上喷发
      velocities[i * 3 + 2] = Math.random() * 0.6 * Math.sin(angle) * speed; // Z方向

      // 随机生命周期，粒子将在 1 到 3 秒之间消失
      lifeTimes[i] = Math.random() * (MAX_LIFETIME - MIN_LIFETIME) + MIN_LIFETIME;

      // 随机移除时间（在生命周期结束之前）
      removeTimes[i] = Math.random() * lifeTimes[i];

      opacities[i] = 1; // 初始透明度为1
    };

    // 为每个粒子设置随机颜色
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const color = new THREE.Color().setHSL(Math.random(), 1.0, 0.6); // 随机颜色
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 创建初始粒子
    for (let i = 0; i < COUNT; i++) {
      createParticle(i);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 动画循环
    const animate = () => {
      const delta = clock.getDelta(); // 获取时间差
      // 更新粒子的位置和透明度
      for (let i = 0; i < COUNT; i++) {
        // 更新每个粒子的速度，模拟重力
        velocities[i * 3 + 1] += gravity * delta; // 受重力影响，Y轴速度变化
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta; // 更新 Y 坐标

        // 更新 X 和 Z 坐标
        positions[i * 3] += velocities[i * 3] * delta; // 更新 X 坐标
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta; // 更新 Z 坐标

        // 如果粒子掉落至 y < 0，则重置粒子
        if (positions[i * 3 + 1] < 0) {
          createParticle(i); // 重置粒子
        }

        // 更新粒子的生命周期
        lifeTimes[i] -= delta;

        // 如果粒子生命周期结束或达到随机移除时间，则重置粒子
        if (lifeTimes[i] <= 0 || lifeTimes[i] <= removeTimes[i]) {
          createParticle(i); // 重置粒子
        }

        // 更新粒子的透明度
        opacities[i] = lifeTimes[i] / (MAX_LIFETIME - MIN_LIFETIME + MIN_LIFETIME);
      }

      // 更新粒子的属性
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.opacity = new THREE.BufferAttribute(opacities, 1); // 更新透明度
      particles.geometry.attributes.opacity.needsUpdate = true;
    };

    setAnimation(animate);
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Demo;
