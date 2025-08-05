import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const Screen3 = () => {
  const { containerRef } = useThreeRenderer((scene, camera) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#753f00' }),
    );
    scene.add(sphere);
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />; // 这里的style是为了让这个组件占满整个屏
};

export default Screen3;
