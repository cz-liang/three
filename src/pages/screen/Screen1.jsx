import React from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';

const Demo = () => {
  const { containerRef } = useThreeRenderer((scene, renderer, camera) => {
    //创建一个长方体几何对象Geometry
    const geometry = new THREE.BoxGeometry(100, 60, 40);
    //创建一个材质对象Material

    //纹理贴图加载器TextureLoader
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load('/public/textures/wood.jpg');

    // 高光材质
    const material = new THREE.MeshPhongMaterial({
      // color: 0x408f00, // 一般设置了颜色贴图.map,不用设置color的值，color默认白色0xffffff
      map: texture, // map表示材质的颜色贴图属性
      side: THREE.DoubleSide,
    });

    // 两个参数分别为几何体geometry、材质material
    const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    //设置网格模型在三维空间中的位置坐标，默认是坐标原点
    mesh.position.set(0, -100, 0);
    // 将网格模型添加到场景中
    scene.add(mesh);

    const cloneMesh = mesh.clone();
    cloneMesh.position.z = 100;
    cloneMesh.material = mesh.material.clone();
    cloneMesh.material.color.set('#f28c4a');
    scene.add(cloneMesh);

    const sphereGeometry = new THREE.SphereGeometry(50, 30, 30);
    const texture2 = texLoader.load('/public/textures/nature.jpg');
    const cloneMaterial = material.clone();
    cloneMaterial.map = texture2;
    const sphereMesh = new THREE.Mesh(sphereGeometry, cloneMaterial);
    sphereMesh.position.set(100, -50, 0);
    scene.add(sphereMesh);

    const geometry1 = new THREE.PlaneGeometry(200, 100); //矩形平面
    const geometry2 = new THREE.BoxGeometry(100, 100, 100); //长方体
    const geometry3 = new THREE.SphereGeometry(100, 30, 30); //球体
    console.log('uv1', geometry1.attributes.uv);
    console.log('uv2', geometry2.attributes.uv);
    console.log('uv3', geometry3.attributes.uv);

    // 矩阵对象
    // const newGeometry = new THREE.BoxGeometry(50, 50, 50);
    // //材质对象Material
    // const newMaterial = new THREE.MeshLambertMaterial({
    //   color: 0x00ffff, //设置材质颜色
    //   transparent: true, //开启透明
    //   opacity: 0.5, //设置透明度
    // });
    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 10; j++) {
    //     for (let k = 0; k < 10; k++) {
    //       const mesh = new THREE.Mesh(newGeometry, newMaterial); //网格模型对象Mesh
    //       // 在XOZ平面上分布
    //       mesh.position.set(i * 60, k * 60, j * 60);
    //       scene.add(mesh); //网格模型添加到场景中
    //     }
    //   }
    // }

    // 批量创建多个长方体表示高层楼
    // const group1 = new THREE.Group(); //所有高层楼的父对象
    // group1.name = '高层';
    // for (let i = 0; i < 5; i++) {
    //   const geometry = new THREE.BoxGeometry(20, 60, 10);
    //   const material = new THREE.MeshLambertMaterial({
    //     color: 0x00ffff,
    //   });
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.x = i * 30; // 网格模型mesh沿着x轴方向阵列
    //   group1.add(mesh); //添加到组对象group1
    //   mesh.name = i + 1 + '号楼';
    //   // console.log('mesh.name',mesh.name);
    // }
    // group1.position.y = 30;

    // const group2 = new THREE.Group();
    // group2.name = '洋房';
    // // 批量创建多个长方体表示洋房
    // for (let i = 0; i < 5; i++) {
    //   const geometry = new THREE.BoxGeometry(20, 30, 10);
    //   const material = new THREE.MeshLambertMaterial({
    //     color: 0x00ffff,
    //   });
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.x = i * 30;
    //   group2.add(mesh); //添加到组对象group2
    //   mesh.name = i + 6 + '号楼';
    // }
    // group2.position.z = 50;
    // group2.position.y = 15;

    // const model = new THREE.Group();
    // model.name = '小区房子';
    // model.add(group1, group2);
    // model.position.set(-50, 0, -25);
    // 返回名.name为"4号楼"对应的对象
    // const nameNode = scene.getObjectByName('4号楼');
    // nameNode.material.color.set(0x408f00);
    // scene.add(model);

    // 点光源
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.intensity = 6.0; // 强度
    pointLight.distance = 0; // 距离
    pointLight.decay = 0.1; // 衰减率 设置光源不随距离衰减
    pointLight.position.set(20, 150, 250); // 点光源位置
    // 将点光源添加到场景中
    scene.add(pointLight);

    // 设置相机位置
    camera.position.set(300, 300, 300);

    // 动画循环
    const animate = () => {
      // const spt = clock.getDelta() * 1000; //毫秒
      // console.log('两帧渲染时间间隔(毫秒)', spt);
      // console.log('帧率FPS', 1000 / spt);
      requestAnimationFrame(animate);
      // 让物体绕 Y 轴旋转，可以控制每次旋转弧度大小控制转速
      // mesh.rotateY(0.01); //每次绕y轴旋转0.01弧度
      mesh.rotation.y += 0.01; //每次绕y轴旋转0.05弧度 (两种写法一致)
      cloneMesh.rotation.copy(mesh.rotation); // 复制

      renderer.render(scene, camera);
    };
    animate();
  });

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />; // 这里的style是为了让这个组件占满整个屏
};

export default Demo;
