import React, { useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import useThreeRenderer from '@/hooks/useThreeRenderer';
import * as d3 from 'd3';
import gsap from 'gsap';
import { smoothMoveCamera, createProvinceMesh, drawSpot, drawLine } from './methods';

const defaultCityCode = 100000;
const defaultCenter = [104.0, 37.5];

const Demo = () => {
  const cityRef = React.useRef();
  const [cityInfo, setCityInfo] = React.useState(null);
  const sceneRef = React.useRef();
  const cameraRef = React.useRef();
  const [cityCode, setCityCode] = React.useState(defaultCityCode);
  const [showCountry, setShowCountry] = React.useState(true);
  // 使用 useCallback 来确保函数引用不变
  const initMapRender = useCallback(
    (scene, renderer, camera, controls) => {
      sceneRef.current = scene;
      cameraRef.current = camera;

      let center = defaultCenter;
      // 倍率
      let scale = 5;
      const projection = d3
        .geoMercator()
        .center(center) // 中国中心点坐标
        .scale(80)
        .translate([0, 0]); // 投影到画布中心
      // .translate([window.innerWidth / 2, window.innerHeight / 2]); // 投影到画布中心

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.intensity = 8.0; // 强度
      scene.add(light);

      // 加载中国地图数据
      fetch(`https://geojson.cn/api/china/${cityCode}.json`).then(res => {
        res.json().then(data => {
          const json = data;
          // 重新获取当前地图中心点
          let mapCenter = json.properties.center;
          let [centerX, centerY] = projection(mapCenter);
          if (!showCountry) {
            centerX = centerX * scale;
            centerY = centerY * scale;
          }

          // 遍历每个省份
          json.features.forEach((elem, index) => {
            const { name, code } = elem.properties;
            // 每个的 坐标 数组
            const { coordinates, type } = elem.geometry;
            // 使用 d3 插值函数生成颜色，根据省份在所有省份中的相对位置，在红色和蓝色之间进行插值
            const color = d3.interpolateRdBu(index / json.features.length);

            const extrudeSettings = {
              depth: 2, // 高度
              bevelEnabled: false, // 是否有倒角
            };

            // 平面部分材质
            const material = new THREE.MeshStandardMaterial({
              metalness: 1, // 金属度
              color: color, // 颜色
            });

            const province = createProvinceMesh(
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
            );
            // 增加了厚度（就是高度，高度往z轴伸展），所以为了让面在z轴为0，调整-2
            province.position.setZ(-2);
            scene.add(province);
          });

          // 相机位置重新计算，让省份正好在视野中心
          const distance = 200; // 控制视角距离
          camera.position.set(centerX, -centerY, distance);
          camera.lookAt(centerX, -centerY, 0);

          // 确保 controls.target 跟随新中心点
          controls.target.set(centerX, -centerY, 0);
          controls.update();

          // 🔥 灯光位置也要同步更新
          light.position.set(centerX, -centerY, 200);

          // 定位点位置
          const spots = [
            [103.82, 36.05], // 甘肃 定位点
            [113.28, 23.12], // 定位点
            [85.29, 41.37], // 定位点
            [101.48, 25.0], // 定位点
            [119.48, 32.98], // 定位点
            [127.69, 48.04], // 定位点
            [91.13, 29.66], // 西藏
          ];
          const circleObjects = [];
          const ringObjects = [];
          const lineObjects = [];

          // 根据 showCountry 控制显示与隐藏
          if (!showCountry) {
            circleObjects.forEach(circle => {
              scene.remove(circle);
              circle.geometry.dispose();
              circle.material.dispose();
            });
            ringObjects.forEach(ring => {
              scene.remove(ring);
              ring.geometry.dispose();
              ring.material.dispose();
            });
            lineObjects.forEach(ring => {
              scene.remove(line);
              line.geometry.dispose();
              line.material.dispose();
            });
          } else {
            // 重新创建对象
            spots.forEach(spot => {
              let { circle, ring } = drawSpot(spot, projection);
              circleObjects.push(circle);
              ringObjects.push(ring);
              scene.add(circle);
              scene.add(ring);
            });

            // 以索引为0的点作为中心点画线
            for (let i = 1; i < spots.length; i++) {
              const line = drawLine(spots[0], spots[i], projection);
              lineObjects.push(line);
              scene.add(line);
            }
          }

          // 🎯 重新获取中心点并调用动画
          smoothMoveCamera(camera, controls, centerX, centerY, distance);
        });
      });

      // 坐标系
      // const axesHelper = new THREE.AxesHelper(500);
      // scene.add(axesHelper);
    },
    [cityCode, showCountry],
  );

  const { containerRef, setAnimation } = useThreeRenderer(initMapRender);

  // 渲染动画
  const animate = () => {};
  setAnimation(animate);

  // 🛠️ 独立的鼠标交互逻辑
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let lastIntersected = null; // 记录上一次被选中的对象
    let lastProvinceCode = null; // 记录上一次投射的省份代码
    // 定义一个加深颜色的函数，这里设置加深系数为 0.8，你可以根据需要调整
    const darkenColor = (color, factor) => {
      return {
        isColor: color.isColor,
        r: color.r * factor,
        g: color.g * factor,
        b: color.b * factor,
      };
    };

    const onMouseMove = event => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (!intersectedObject.type || intersectedObject.type !== 'map') return;
        if (lastIntersected && lastIntersected !== intersectedObject) {
          lastIntersected.material?.color.set(lastIntersected._color);
        }
        // 检查当前省份代码是否与上一次不同
        if (lastProvinceCode !== intersectedObject.code) {
          // 高亮省份
          // 调用函数加深颜色
          const darkenedColor = darkenColor(intersectedObject.material?.color, 0.3);
          // 将加深后的颜色应用到材质上
          intersectedObject.material?.color.setRGB(darkenedColor.r, darkenedColor.g, darkenedColor.b);
        }

        // 更新上一次投射的省份代码
        lastProvinceCode = intersectedObject.code;
        setCityInfo(intersectedObject._name);
        lastIntersected = intersectedObject;

        cityRef.current.style.left = event.clientX + 12 + 'px';
        cityRef.current.style.top = event.clientY + 'px';
        cityRef.current.style.visibility = 'visible';
      } else if (lastIntersected) {
        lastIntersected.material?.color.set(lastIntersected._color);
        lastIntersected = null;
        lastProvinceCode = null;
        cityRef.current.style.visibility = 'hidden';
      }
    };

    const onMouseDblClick = event => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (showCountry) {
          setShowCountry(false);
          setCityCode(intersectedObject.code);
          console.log('切换到省份视图，省份代码:', intersectedObject.code);
        } else {
          setShowCountry(true);
          setCityCode(defaultCityCode);
          console.log('切换到国家视图');
        }
      }
      // 切换视图后，隐藏城市信息
      cityRef.current.style.visibility = 'hidden';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('dblclick', onMouseDblClick);

    // 🎯 清理事件监听
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('dblclick', onMouseDblClick);
    };
  }, [sceneRef.current, cameraRef.current, showCountry]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
      <div
        ref={cityRef}
        style={{
          padding: '4px 8px',
          position: 'absolute',
          visibility: 'hidden',
          backgroundColor: '#ffffff20',
          color: '#fff',
          borderRadius: '4px',
        }}
      >
        {cityInfo}
      </div>
    </div>
  );
};

export default Demo;
