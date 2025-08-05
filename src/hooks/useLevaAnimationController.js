import { useEffect, useRef } from 'react';
import { useControls, button } from 'leva';

export default function useLevaAnimationController() {
  const actionRef = useRef(null);
  const fpsRef = useRef(30);
  const durationRef = useRef(0);

  const setAction = (action, fps = 30) => {
    actionRef.current = action;
    fpsRef.current = fps;
    durationRef.current = action.getClip().duration;

    set({
      Frame: {
        min: 0,
        max: durationRef.current * fpsRef.current,
        value: 0,
      },
      Progress: {
        min: 0,
        max: 1,
        value: 0,
      },
    });
  };
  let isPlaying = false; // 播放状态标记
  const [, set] = useControls('Animation Controller', () => ({
    Play: button(() => {
      if (actionRef.current) {
        isPlaying = true;
        actionRef.current.paused = false;
        actionRef.current.play();
      }
    }),
    Pause: button(() => {
      if (actionRef.current) {
        isPlaying = false;
        actionRef.current.paused = true;
      }
    }),
    Reset: button(() => {
      if (actionRef.current) {
        isPlaying = false;
        actionRef.current.reset();
        actionRef.current.paused = true;
        set({
          Frame: 0,
          Progress: 0,
        });
      }
    }),
    Frame: {
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      onChange: v => {
        if (isPlaying) return; // 播放时不触发暂停
        if (actionRef.current && durationRef.current) {
          const time = v / fpsRef.current;
          actionRef.current.time = time;
          actionRef.current.paused = true;
          set({ Progress: time / durationRef.current });
        }
      },
    },
    Progress: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.001,
      onChange: v => {
        if (isPlaying) return; // 播放时不触发暂停
        if (actionRef.current && durationRef.current) {
          const time = v * durationRef.current;
          actionRef.current.time = time;
          actionRef.current.paused = true;
          set({ Frame: time * fpsRef.current });
        }
      },
    },
    Speed: {
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
      onChange: v => {
        if (actionRef.current) {
          actionRef.current.timeScale = v;
        }
      },
    },
  }));

  // 自动更新 Frame 和 Progress
  useEffect(() => {
    const update = () => {
      if (actionRef.current && !actionRef.current.paused) {
        const time = actionRef.current.time;
        const duration = durationRef.current;
        const fps = fpsRef.current;
        set({
          Frame: time * fps,
          Progress: time / duration,
        });
      }
      requestAnimationFrame(update);
    };
    update();
  }, []);

  return { setAction };
}
