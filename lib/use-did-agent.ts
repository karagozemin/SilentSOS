"use client";

import type { AgentManager } from "@d-id/client-sdk/dist/src/types/entities/agents/manager";
import type { Message } from "@d-id/client-sdk/dist/src/types/entities/agents/chat";
import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionStatus = "idle" | "connecting" | "connected";

type ConnectOptions = {
  enableCamera?: boolean;
  enableMicrophone?: boolean;
};

type UseDidAgentOptions = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (message: string) => void;
  onNewMessage?: (messages: Message[], type: "answer" | "partial" | "user") => void;
  onSpeakingChange?: (speaking: boolean) => void;
};

export function useDidAgent(options: UseDidAgentOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const managerRef = useRef<AgentManager | null>(null);
  const srcObjectRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const stopLocalStreams = useCallback(() => {
    for (const stream of [micStreamRef.current, cameraStreamRef.current]) {
      stream?.getTracks().forEach((track) => track.stop());
    }
    micStreamRef.current = null;
    cameraStreamRef.current = null;
    setCameraEnabled(false);
  }, []);

  const ensureManager = useCallback(async () => {
    if (managerRef.current) return managerRef.current;

    const configRes = await fetch("/api/agent-config");
    if (!configRes.ok) {
      const body = (await configRes.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(body?.error ?? "D-ID agent is not configured");
    }

    const { agentId, clientKey } = (await configRes.json()) as {
      agentId: string;
      clientKey: string;
    };

    const sdk = await import("@d-id/client-sdk");

    const manager = await sdk.createAgentManager(agentId, {
      auth: { type: "key", clientKey },
      callbacks: {
        onSrcObjectReady(value) {
          srcObjectRef.current = value;
          const video = videoRef.current;
          if (!video) return;
          video.srcObject = value;
          void video.play().catch(() => undefined);
        },
        onVideoStateChange(state) {
          const speaking = state !== "STOP";
          setIsSpeaking(speaking);
          optionsRef.current.onSpeakingChange?.(speaking);

          const video = videoRef.current;
          const idleVideo = managerRef.current?.agent.presenter.idle_video;
          if (!video) return;

          if (state === "STOP" && idleVideo) {
            video.srcObject = null;
            video.src = idleVideo;
            void video.play().catch(() => undefined);
            return;
          }

          video.src = "";
          video.srcObject = srcObjectRef.current;
        },
        onConnectionStateChange(state) {
          if (state === "connected") {
            setStatus("connected");
            optionsRef.current.onConnect?.();
          }
          if (state === "disconnected" || state === "closed" || state === "fail") {
            setStatus("idle");
            setIsSpeaking(false);
            optionsRef.current.onDisconnect?.();
          }
        },
        onNewMessage(messages, type) {
          if (type === "answer" || type === "user") {
            optionsRef.current.onNewMessage?.(messages, type);
          }
        },
        onError(error) {
          optionsRef.current.onError?.(error.message);
        },
      },
    });

    managerRef.current = manager;
    return manager;
  }, []);

  const connect = useCallback(
    async (connectOptions: ConnectOptions = {}) => {
      const { enableCamera = false, enableMicrophone = true } = connectOptions;
      setStatus("connecting");

      try {
        const manager = await ensureManager();
        await manager.connect();

        if (enableMicrophone) {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          micStreamRef.current = micStream;
          if (manager.publishMicrophoneStream) {
            await manager.publishMicrophoneStream(micStream);
          }
        }

        if (enableCamera && manager.publishCameraStream) {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
          cameraStreamRef.current = camStream;
          await manager.publishCameraStream(camStream);
          setCameraEnabled(true);
        }
      } catch (error) {
        setStatus("idle");
        stopLocalStreams();
        throw error;
      }
    },
    [ensureManager, stopLocalStreams],
  );

  const disconnect = useCallback(async () => {
    stopLocalStreams();
    if (managerRef.current) {
      await managerRef.current.disconnect();
      managerRef.current = null;
    }
    srcObjectRef.current = null;
    setStatus("idle");
    setIsSpeaking(false);
  }, [stopLocalStreams]);

  const speak = useCallback(async (text: string) => {
    const manager = managerRef.current ?? (await ensureManager());
    if (status === "idle") {
      await manager.connect();
    }
    await manager.speak({ type: "text", input: text });
  }, [ensureManager, status]);

  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  return {
    videoRef,
    status,
    isConnected: status === "connected",
    isSpeaking,
    cameraEnabled,
    connect,
    disconnect,
    speak,
  };
}
