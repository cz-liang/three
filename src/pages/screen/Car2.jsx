import React, { useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const Demo = () => {
  const sceneRef = React.useRef();
  const cameraRef = React.useRef();
  const modelRef = React.useRef();

  // 使用 useCallback 来确保函数引用不变
  const initMapRender = useCallback((scene, renderer, camera, controls) => {
    sceneRef.current = scene;
    cameraRef.current = camera;

    // 添加环境光;
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
    ambientLight.position.set(-100, 50, -160);
    scene.add(ambientLight);

    const rgbeLoader = new RGBELoader();
    scene.environment = rgbeLoader.load(`${import.meta.env.BASE_URL}textures/lakeside_sunrise_1k.hdr`);
    scene.environment.mapping = THREE.EquirectangularReflectionMapping;

    // 车身材质
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: '#e2c08d',
      metalness: 1.0, // 金属材质
      roughness: 0.1, // 粗糙度，越低越平滑
      transmission: 1.0, // 允许光线穿透
      ior: 1.5, // 折射率
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      sheen: 0.5,
    });
    // 玻璃材质
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#38eeff',
      transparent: true,
      opacity: 0.2,
      metalness: 1, // 减少金属度
      roughness: 0,
      transmission: 1.0,
    });

    // 加载GLB模型
    const loader = new GLTFLoader();
    const space = 2;
    loader.load(
      `${import.meta.env.BASE_URL}models/car.glb`, // 替换为你的GLB模型路径
      gltf => {
        const model = gltf.scene;
        console.log(model);
        // 所有原件各自位置相对(0,0,0)远离100
        model.traverse(child => {
          const { x, y, z } = child.position;
          child.position.set(x * space, y * space, z * space);
          // child.material = bodyMaterial;
          child.material = glassMaterial;
        });

        scene.add(model);
        modelRef.current = model; // 缓存引用
      },
      undefined,
      error => {
        console.error('Error loading GLB model:', error);
      },
    );
    camera.position.set(0, 0, 5);
    controls.target.set(0, 0, 0);
    // // 增加坐标系
    // const axesHelper = new THREE.AxesHelper(500);
    // scene.add(axesHelper);
  }, []);

  const { containerRef, setAnimation } = useThreeRenderer(initMapRender);

  // 渲染动画
  const animate = () => {};
  setAnimation(animate);

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onMouseClick = event => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log(intersectedObject.name);
      }
    };
    window.addEventListener('click', onMouseClick);
    return () => {
      window.removeEventListener('click', onMouseClick);
    };
  }, [sceneRef.current]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: 10,
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}></div>
      </div>
    </div>
  );
};

export default Demo;
