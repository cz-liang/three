import React from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const Screen3 = () => {
  const { containerRef } = useThreeRenderer((scene, renderer, camera) => {
    // ✅ 加载 HDR 环境贴图
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(`${import.meta.env.BASE_URL}textures/shanghai_bund_4k.hdr`, texture => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // 创建天空盒
      const skybox = new THREE.Mesh(
        new THREE.SphereGeometry(150, 32, 32),
        new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide, // 让贴图在球体内部可见
        }),
      );

      // 旋转天空球
      skybox.rotation.y = 45.5; // 45.5 度
      scene.add(skybox);

      // scene.environment = texture;
      // scene.background = texture;
    });

    // ✅ 创建玻璃材质
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.1,
      roughness: 0.08, // 粗糙度
      metalness: 0, // 金属度
      transmission: 1, // 允许光线穿透
      ior: 1.5, // 折射率
      clearcoat: 1, // 清漆
      clearcoatRoughness: 0, // 清漆粗糙度
      envMap: scene.environment,
      envMapIntensity: 3,
    });

    // ✅ 创建玻璃球
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 200, 200), glassMaterial);
    scene.add(sphere);

    // ✅ 创建点光源
    const pointLight = new THREE.PointLight(0xffffff, 50, 100);
    pointLight.position.set(5, 100, 5);
    scene.add(pointLight);

    // ✅ 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    camera.position.set(200, 10, 200);
    camera.lookAt(0, 100, 0);
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Screen3;
