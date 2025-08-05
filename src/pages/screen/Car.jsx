import React, { useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ColorPicker, Switch } from 'antd';

const Demo = () => {
  const sceneRef = React.useRef();
  const cameraRef = React.useRef();
  const modelRef = React.useRef();
  const [doors, setDoors] = React.useState([]); // 存储门的引用
  const doorsOpenRef = useRef({});
  const [allDoorsOpen, setAllDoorsOpen] = React.useState(false);
  const [color, setColor] = React.useState('#181a1f'); // 初始颜色

  // 车身材质
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 1.0, // 金属材质
    roughness: 0.1, // 粗糙度，越低越平滑
    transmission: 1.0, // 允许光线穿透
    ior: 1.5, // 折射率
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    sheen: 0.5,
  });
  // 细节材质
  const detailsMaterial = new THREE.MeshStandardMaterial({
    color: '#181a1f',
    metalness: 1.0, //
    roughness: 0.5, // 粗糙度，越低越平滑
  });
  // 玻璃材质
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: color,
    transparent: true,
    opacity: 0.2,
    metalness: 1, // 减少金属度
    roughness: 0,
    transmission: 1.0,
  });
  // 网格材质
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      radius: { value: 200 }, // 渐变开始的半径
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float radius;
      varying vec3 vWorldPosition;
      void main() {
        float distance = length(vWorldPosition.xz);
        float alpha = smoothstep(radius, radius + 100.0, distance);
        gl_FragColor = vec4(0.5, 0.5, 0.5, 0.5 - alpha);
      }
    `,
    transparent: true,
  });

  // 使用 useCallback 来确保函数引用不变
  const initMapRender = useCallback((scene, renderer, camera, controls) => {
    sceneRef.current = scene;
    cameraRef.current = camera;

    const grid = new THREE.GridHelper(1400, 100, 0x000000, 0x000000);
    grid.material = gridMaterial;
    grid.position.y = -8.5;
    scene.add(grid);
    // 使用gsap.to让网格持续向后移动
    gsap.to(grid.position, {
      z: 100, // 结束位置
      duration: 1, // 持续时间
      ease: 'linear', // 线性运动
      repeat: -1, // 无限循环
      yoyo: false, // 不往返
    });

    // 添加环境光;
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
    ambientLight.position.set(-100, 50, -160);
    scene.add(ambientLight);

    const rgbeLoader = new RGBELoader();
    scene.environment = rgbeLoader.load('/public/textures/lakeside_sunrise_1k.hdr');
    scene.environment.mapping = THREE.EquirectangularReflectionMapping;

    // 添加平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // 增加强度
    directionalLight.position.set(-100, 150, 60);
    scene.add(directionalLight);

    // 加载GLB模型
    const loader = new GLTFLoader();
    loader.load(
      '/models/benchi.glb', // 替换为你的GLB模型路径
      gltf => {
        const model = gltf.scene;
        console.log(model);
        // 查找名为'车身'的children并添加材质
        model.traverse(child => {
          const KLP_tex = child.getObjectByName('KLP_tex');
          const KLZ_tex = child.getObjectByName('KLZ_tex');
          const KPP_tex = child.getObjectByName('KPP_tex');
          const KPZ_tex = child.getObjectByName('KPZ_tex');
          const KLP_p4b = child.getObjectByName('KLP_p4b');
          const KLZ_p4b = child.getObjectByName('KLZ_p4b');
          const KPP_p4b = child.getObjectByName('KPP_p4b');
          const KPZ_p4b = child.getObjectByName('KPZ_p4b');
          // 轮毂
          [KLP_tex, KLZ_tex, KPP_tex, KPZ_tex].forEach(item => {
            if (item) {
              item.material = detailsMaterial;
              // 使用gsap添加围绕X轴旋转动画
              gsap.to(item.rotation, {
                y: Math.PI * 5, // 绕X轴旋转一周
                duration: 1, // 持续时间
                ease: 'linear', // 线性运动
                repeat: -1, // 无限循环
                yoyo: false, // 不往返
              });
            }
          });
          // 轮胎
          [KLP_p4b, KLZ_p4b, KPP_p4b, KPZ_p4b].forEach(item => {
            if (item) {
              item.material = new THREE.MeshStandardMaterial({
                color: '#181a1f',
                metalness: 1.0, //
                roughness: 1, // 粗糙度，越低越平滑
              });
            }
          });

          if (child.name === '车身') {
            // 获取车身对象的所有子对象
            const Kar_alu = child.getObjectByName('Kar_alu');
            const Kar_cbs = child.getObjectByName('Kar_cbs');
            const Kar_chr = child.getObjectByName('Kar_chr');
            const Kar_gum = child.getObjectByName('Kar_gum');
            const Kar_sbs = child.getObjectByName('Kar_sbs');
            const Kar_skl = child.getObjectByName('Kar_skl');
            const Kar_tex = child.getObjectByName('Kar_tex');

            // 车底小部件
            Kar_alu.material = detailsMaterial;
            // 车灯灯泡
            Kar_cbs.material = glassMaterial;
            // 车底
            Kar_gum.material = detailsMaterial;
            // 车灯灯泡
            Kar_sbs.material = glassMaterial;
            // 车身玻璃
            Kar_skl.material = glassMaterial;
            // 标志等不锈钢
            Kar_chr.material = detailsMaterial;
            // 车牌等
            // Kar_tex.material = glassMaterial;
          }
          let bodyModel1 = model.getObjectByName('磨砂框架');
          let bodyModel2 = model.getObjectByName('车门');
          // 车身框架
          bodyModel1.traverse(function (value) {
            value.material = bodyMaterial;
          });
          // 车门包括细节
          bodyModel2.traverse(function (value) {
            // console.log(value.name)
            if (value.name.indexOf('_tex') > 0 || value.name.indexOf('_gum') > 0 || value.name.indexOf('_chr') > 0) {
              value.material = detailsMaterial;
            } else if (value.name.indexOf('_skl') > 0) {
              value.material = glassMaterial;
            } else {
              value.material = bodyMaterial;
              if (value.name == 'DLP' || value.name == 'DLZ' || value.name == 'DPP' || value.name == 'DPZ') {
                setDoors(prevData => [...prevData, value]);
              }
            }
          });
        });

        let neishi = model.getObjectByName('内饰');
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('/textures/leather_red_02_coll1_1k.png', texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(400, 400); // 根据需要调整重复次数
          texture.anisotropy = 16; // 提高清晰度

          neishi.traverse(value => {
            if (value.isMesh) {
              value.material = new THREE.MeshStandardMaterial({
                map: texture,
                color: '#181a1f',
                roughness: 0.9,
                metalness: 0.2,
                bumpMap: texture, // 加入 bumpMap 提升细节
                bumpScale: 0.05,
              });
            }
          });
        });

        scene.add(model);
        modelRef.current = model; // 缓存引用
      },
      undefined,
      error => {
        console.error('Error loading GLB model:', error);
      },
    );
    camera.position.set(-100, 50, -160);
    controls.target.set(0, 0, -60);
    // // 增加坐标系
    // const axesHelper = new THREE.AxesHelper(500);
    // scene.add(axesHelper);
  }, []);

  // 监听颜色变化
  useEffect(() => {
    if (!modelRef.current) return;

    const bodyMaterialColor = new THREE.Color(color);
    modelRef.current.traverse(child => {
      if (child.isMesh && child.material && child.material.color) {
        if (child.name.includes('磨砂框架') || child.name.includes('车门')) {
          child.material.color.set(bodyMaterialColor);
        }
      }
    });
  }, [color, doors]);

  // 监听车门开关变化
  useEffect(() => {
    if (!modelRef.current) return;
    // 设置目标角度（单位：弧度）
    const targetAngle = allDoorsOpen ? THREE.MathUtils.degToRad(65) : 0;
    // 为每个车门对象执行旋转动画
    doors.forEach(door => {
      const name = door.name.split('_')[0];
      // 执行动画到目标角度
      gsap.to(door.rotation, {
        z: name === 'DLP' || name === 'DLZ' ? targetAngle : -targetAngle,
        duration: 1,
        ease: 'power2.inOut', // 平滑动画曲线
      });
    });
  }, [allDoorsOpen]);

  const { containerRef, setAnimation } = useThreeRenderer(initMapRender);

  // 渲染动画
  const animate = () => {};
  setAnimation(animate);

  const toggleDoor = (doorMeshes, name) => {
    const isOpen = doorsOpenRef.current[name] || false;

    // 设置目标角度（单位：弧度）
    const targetAngle = isOpen
      ? 0
      : name === 'DLP' || name === 'DLZ'
      ? THREE.MathUtils.degToRad(65)
      : -THREE.MathUtils.degToRad(65);

    // 为每个车门对象执行旋转动画
    doorMeshes.forEach(door => {
      // 防止和已有动画冲突
      gsap.killTweensOf(door.rotation);

      // 执行动画到目标角度
      gsap.to(door.rotation, {
        z: targetAngle,
        duration: 1,
        ease: 'power2.inOut', // 平滑动画曲线
      });
    });

    // 更新状态
    doorsOpenRef.current[name] = !isOpen;
  };

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
        if (intersectedObject.name.indexOf('_lak') > 0) {
          const doorName = intersectedObject.name.split('_')[0];
          const relatedDoors = doors.filter(d => d.name === doorName);
          if (relatedDoors.length > 0) {
            toggleDoor(relatedDoors, doorName); // 只切换一次状态
          }
        }
      }
    };
    window.addEventListener('click', onMouseClick);
    return () => {
      window.removeEventListener('click', onMouseClick);
    };
  }, [sceneRef.current, doors]);

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          车身颜色：
          <ColorPicker
            value={color}
            onChange={v => {
              setColor(v.toHexString());
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
          车门开关：
          <Switch
            value={allDoorsOpen}
            checkedChildren="开启"
            unCheckedChildren="关闭"
            onChange={v => setAllDoorsOpen(v)}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;
