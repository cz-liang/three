import React, { useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import useLevaAnimationController from '@/hooks/useLevaAnimationController';

const Demo = () => {
  const sceneRef = React.useRef();
  const cameraRef = React.useRef();
  const modelRef = React.useRef();
  const mixerRef = useRef(); // 用于存储动画混合器
  const { setAction } = useLevaAnimationController(); // 获取 Leva 动画控制器
  // 使用 useCallback 来确保函数引用不变
  const initMapRender = useCallback((scene, renderer, camera, controls) => {
    sceneRef.current = scene;
    cameraRef.current = camera;

    const color = 0xff0000; // white
    const near = 10; // 近平面
    const far = 50; // 远平面
    scene.fog = new THREE.Fog(color, near, far); // 创建雾

    // 添加环境光;
    const ambientLight = new THREE.AmbientLight('#ffffff', 1);
    ambientLight.position.set(-50, 25, -8);
    scene.add(ambientLight);

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 增加强度
    directionalLight.position.set(-50, 75, 30);
    scene.add(directionalLight);

    const grid = new THREE.GridHelper(40, 40, 0x24262b, 0x24262b);
    scene.add(grid);

    // 加载GLB模型
    const loader = new GLTFLoader();
    loader.load(
      '/models/robot.glb', // 替换为你的GLB模型路径
      glb => {
        console.log(glb);

        const model = glb.scene;
        scene.add(model);
        modelRef.current = model; // 缓存引用

        // 创建动画混合器
        mixerRef.current = new THREE.AnimationMixer(model);

        // 获取动画剪辑
        const clips = glb.animations;
        if (clips && clips.length > 0) {
          const clip = clips[0];
          // 裁剪最后一帧
          // clip.tracks.splice(0, 42);
          clip.tracks.splice(178, 5);
          // 裁剪直立到步行的过渡帧（0到42帧）
          // clip.tracks.forEach(track => {
          //   track.times = track.times.slice(42); // 从第42帧开始
          //   track.values = track.values.slice(42 * track.getValueSize()); // 裁剪对应的值
          // });
          clip.duration = clip.tracks[0].times[clip.tracks[0].times.length - 1]; // 更新duration
          const action = mixerRef.current.clipAction(clip);

          // 播放第一个动画剪辑
          // const action = mixerRef.current.clipAction(clips[0]);
          action.loop = THREE.LoopRepeat; // 设置循环模式
          action.reset(); // 重置动画状态
          action.play();
          setAction(action, 30); // 注册进控制器
        }
      },
      undefined,
      error => {
        console.error('Error loading GLB model:', error);
      },
    );
    camera.position.set(10, 10, 20);
    controls.target.set(0, 0, 0);
  }, []);

  const { containerRef, setAnimation } = useThreeRenderer(initMapRender);
  const clock = useRef(new THREE.Clock());
  // 渲染动画
  const animate = () => {
    if (mixerRef.current) {
      const delta = clock.current.getDelta();
      mixerRef.current.update(delta); // 更新动画混合器
    }
  };
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
      window.removeEventListener('mousemove', onMouseClick);
    };
  }, [sceneRef.current]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Demo;
