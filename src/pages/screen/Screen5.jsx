import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import * as CANNON from 'cannon-es'; // 引入Cannon.js

const CubeScene = () => {
  const { containerRef } = useThreeRenderer((scene, renderer, camera) => {
    // 创建物理世界
    const world = new CANNON.World();
    // world.gravity.set(0, -9.82, 0); // 设置重力
    world.gravity.set(0, -200, 0); // 增大重力，加快下落速度

    // 创建地面
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // 地面质量为0，表示静止
      shape: groundShape,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 旋转地面使其水平
    world.addBody(groundBody);

    const geometry = new THREE.SphereGeometry(50);
    const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 创建立方体的物理体
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cubeBody = new CANNON.Body({
      mass: 1, // 立方体质量
      shape: cubeShape,
    });
    cubeBody.position.set(0, 200, 0); // 设置立方体初始位置
    world.addBody(cubeBody);
    camera.position.set(300, 300, 300);

    const animate = () => {
      requestAnimationFrame(animate);

      // 更新物理世界
      world.step(1 / 60);

      // 更新立方体的位置和旋转
      cube.position.copy(cubeBody.position);
      cube.quaternion.copy(cubeBody.quaternion);

      // renderer.render(scene, camera);
    };

    animate();
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CubeScene;
