import React, { useState, useEffect } from 'react';
import Scene1 from '../pages/screen/Screen1';

const SceneManager = () => {
  const [currentScene, setCurrentScene] = useState(null);

  useEffect(() => {
    // 默认加载场景1
    loadScene('scene1');
  }, []);

  const loadScene = sceneKey => {
    switch (sceneKey) {
      case 'scene1':
        setCurrentScene(new Scene1());
        break;
      // 可以添加更多场景
      default:
        break;
    }
  };

  const renderScene = () => {
    if (!currentScene) return null;

    return <canvas id="scene-canvas" style={{ width: '100%', height: '100%' }} />;
  };

  return <div style={{ width: '100%', height: '100%' }}>{renderScene()}</div>;
};

export default SceneManager;
