"use client";
import { useCallback, useRef } from "react";

type SoundType = "click" | "success" | "alert" | "transition";

const soundPaths: Record<SoundType, string> = {
  click: "/sounds/click.wav",
  success: "/sounds/success.wav",
  alert: "/sounds/alert.mp3",
  transition: "/sounds/transition.wav",
};

export function useSound() {
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const play = useCallback((type: SoundType, volume: number = 0.5) => {
    try {
      // Get or create audio element
      let audio = audioRefs.current.get(type);

      if (!audio) {
        audio = new Audio(soundPaths[type]);
        audio.preload = "auto";
        audioRefs.current.set(type, audio);
      }

      // Reset and play
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch((err) => {
        // Ignore autoplay errors (user interaction required)
        if (err.name !== "NotAllowedError") {
          console.warn("Sound playback failed:", err);
        }
      });
    } catch (err) {
      console.warn("Sound error:", err);
    }
  }, []);

  return { play };
}
