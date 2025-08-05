import { useState, useCallback } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const useCameraControl = (initialPosition = [0, 2, 5]) => {
  const [viewIndex, setViewIndex] = useState(0);
  const views = [
    { position: new THREE.Vector3(...initialPosition), lookAt: new THREE.Vector3(0, 0, 0) },
    { position: new THREE.Vector3(0, 3, 0), lookAt: new THREE.Vector3(0, 0, 0) },
    { position: new THREE.Vector3(5, 2, 5), lookAt: new THREE.Vector3(0, 0, 0) },
    { position: new THREE.Vector3(-5, 2, 5), lookAt: new THREE.Vector3(0, 0, 0) },
  ];

  // Callback to handle camera switching
  const switchView = useCallback(
    camera => {
      if (!camera) return; // Ensure the camera is available

      const nextIndex = (viewIndex + 1) % views.length;
      const { position, lookAt } = views[nextIndex];

      // Animate the camera position and rotation
      new TWEEN.Tween(camera.position).to(position, 1000).easing(TWEEN.Easing.Quadratic.Out).start();

      new TWEEN.Tween(camera.rotation)
        .to(
          {
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z,
          },
          1000,
        )
        .onUpdate(() => camera.lookAt(lookAt))
        .start();

      setViewIndex(nextIndex); // Update the current view index
    },
    [viewIndex, views],
  );

  return { switchView };
};

export default useCameraControl;
