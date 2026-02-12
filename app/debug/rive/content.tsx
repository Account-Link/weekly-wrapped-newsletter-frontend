"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import DeletingDataRiv from "@/assets/rive/disconnect_tiktok.riv";

export default function DebugRiveContent() {
  const [log, setLog] = useState<string[]>([]);
  const [scrubValue, setScrubValue] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(
    null,
  );

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const { RiveComponent, rive } = useRive({
    src: DeletingDataRiv,
    autoplay: false,
    stateMachines: "State Machine 1", // 用户指定的状态机名称
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    // 重要逻辑：Rive 文件加载成功后触发，可用于验证资源是否损坏
    onLoad: () => {
      addLog("onLoad: Rive 文件加载完成");
    },
    // 重要逻辑：Rive 文件加载失败时触发，便于定位损坏或路径问题
    onLoadError: (event) => {
      addLog(`onLoadError: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
    // 重要逻辑：开始播放时触发（play 调用或自动播放）
    onPlay: (event) => {
      addLog(`onPlay: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
    // 重要逻辑：暂停时触发
    onPause: (event) => {
      addLog(`onPause: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
    // 重要逻辑：停止时触发（非必然触发，Loop 动画可能不会触发）
    onStop: (event) => {
      addLog(`onStop: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
    // 重要逻辑：每次循环触发，可用于确认是否处于 Loop 模式
    onLoop: (event) => {
      addLog(`onLoop: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
    // 重要逻辑：状态机状态变化触发，event.data 包含进入的状态名
    onStateChange: (event) => {
      addLog(`onStateChange: ${JSON.stringify(event?.data ?? "unknown")}`);
    },
  });

  const animations = useMemo(() => {
    if (!rive) return [];
    // 获取所有动画名称，便于调试
    return rive.animationNames.map((name, index) => ({
      name,
      duration: rive.durations[index],
    }));
  }, [rive]);

  useEffect(() => {
    if (!rive) return;
    // 优先选中用户指定的 "Timeline 1" 动画，如果不存在则选中第一个
    const target =
      rive.animationNames.find((n) => n === "Timeline 1") ||
      rive.animationNames[0] ||
      null;
    setSelectedAnimation(target);

    // 输出调试信息，确认 Rive 文件中包含的内容
    addLog(
      `Rive instance ready. Available Animations: [${rive.animationNames.join(", ")}]`,
    );
    addLog(`Available State Machines: [${rive.stateMachineNames.join(", ")}]`);
  }, [rive]);

  const currentDuration = useMemo(() => {
    if (!selectedAnimation || !rive) return 0;
    const index = rive.animationNames.indexOf(selectedAnimation);
    if (index < 0) return 0;
    return rive.durations[index] || 0;
  }, [selectedAnimation, rive]);

  const handlePlay = () => {
    if (!rive) return;
    const target = selectedAnimation || rive.animationNames[0];
    console.log(target);
    if (!target) {
      addLog("No animation found");
      return;
    }
    // 修复：play 方法不接受第二个参数为 0，仅需传入动画名称
    rive.play(target);
    addLog(`Play Animation: ${target}`);
  };

  const handlePlayStateMachine = () => {
    if (!rive) return;
    const sm = "State Machine 1";
    // 尝试播放状态机
    if (rive.stateMachineNames.includes(sm)) {
      rive.play(sm);
      addLog(`Play State Machine: ${sm}`);
    } else {
      addLog(
        `State Machine "${sm}" not found in [${rive.stateMachineNames.join(", ")}]`,
      );
    }
  };

  const handlePause = () => {
    if (!rive) return;
    const target = selectedAnimation || rive.animationNames[0];
    if (!target) {
      addLog("No animation found");
      return;
    }
    rive.pause(target);
    addLog(`Pause: ${target}`);
  };

  const handleStop = () => {
    if (!rive) return;
    const target = selectedAnimation || rive.animationNames[0];
    if (!target) {
      addLog("No animation found");
      return;
    }
    rive.stop(target);
    addLog(`Stop: ${target}`);
  };

  const handleReset = () => {
    if (!rive) return;
    rive.reset();
    setScrubValue(0);
    addLog("Reset");
  };

  const handleScrub = (value: number) => {
    if (!rive) return;
    const target = selectedAnimation || rive.animationNames[0];
    if (!target) {
      addLog("No animation found");
      return;
    }
    rive.scrub(target, value);
    setScrubValue(value);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4 text-[#FF5678]">
        Debug: Rive Playback
      </h1>

      <div className="mb-6 p-4 border border-gray-700 rounded bg-gray-900">
        <p>
          Status:{" "}
          {rive ? (
            <span className="text-green-400">Ready</span>
          ) : (
            <span className="text-yellow-400">Loading...</span>
          )}
        </p>
        <p className="text-sm text-gray-400 mt-2">Asset: deleting_data.riv</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="w-full aspect-square bg-black rounded flex items-center justify-center">
            <div className="w-[26rem] h-[26rem]">
              <RiveComponent />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">
              Animation
            </label>
            <select
              value={selectedAnimation || ""}
              onChange={(e) => setSelectedAnimation(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2"
            >
              <option value="" disabled>
                No animation
              </option>
              {animations.map((anim) => (
                <option key={anim.name} value={anim.name}>
                  {anim.name} ({anim.duration?.toFixed(2)}s)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handlePlay}
              className="bg-[#FF5678] text-black font-bold py-2 px-4 rounded-full hover:bg-[#ff7b95]"
            >
              Play Animation
            </button>
            <button
              onClick={handlePlayStateMachine}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600"
            >
              Play State Machine
            </button>
            <button
              onClick={handlePause}
              className="bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600"
            >
              Pause
            </button>
            <button
              onClick={handleStop}
              className="bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600"
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          <div className="mb-2 text-sm text-gray-300">
            Scrub: {scrubValue.toFixed(2)}s / {currentDuration.toFixed(2)}s
          </div>
          <input
            type="range"
            min={0}
            max={currentDuration || 0}
            step={0.01}
            value={scrubValue}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h2 className="text-xl font-bold mb-2">Logs:</h2>
        <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto border border-gray-700 text-sm">
          {log.length === 0 ? (
            <span className="text-gray-500">No logs yet...</span>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="mb-1 border-b border-gray-800 pb-1">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
