"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { VenomAttackOverlay } from "./VenomAttackOverlay";

interface VenomContextType {
  isVenomMode: boolean;
  triggerVenomAttack: () => void;
  revertToSpidey: () => void;
  toggleVenom: () => void;
}

const VenomContext = createContext<VenomContextType>({
  isVenomMode: false,
  triggerVenomAttack: () => {},
  revertToSpidey: () => {},
  toggleVenom: () => {},
});

export function VenomProvider({ children }: { children: React.ReactNode }) {
  const [isVenomMode, setIsVenomMode] = useState<boolean>(false);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cmhs_venom_mode");
      if (stored === "true") {
        setIsVenomMode(true);
        document.documentElement.classList.add("venom-mode");
      }
    } catch {
      // ignore SSR
    }
  }, []);

  const triggerVenomAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
  };

  const onAttackComplete = () => {
    setIsAttacking(false);
    setIsVenomMode(true);
    document.documentElement.classList.add("venom-mode");
    try {
      localStorage.setItem("cmhs_venom_mode", "true");
    } catch {}
  };

  const revertToSpidey = () => {
    setIsVenomMode(false);
    setIsAttacking(false);
    document.documentElement.classList.remove("venom-mode");
    try {
      localStorage.setItem("cmhs_venom_mode", "false");
    } catch {}
  };

  const toggleVenom = () => {
    if (isVenomMode) {
      revertToSpidey();
    } else {
      triggerVenomAttack();
    }
  };

  // Easter Egg detection: Listen to search inputs and keystrokes
  useEffect(() => {
    // 1. Listen for typing in any input or textarea
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && typeof target.value === "string") {
        const val = target.value.toLowerCase().trim();
        if (val === "venom" || val.includes("venom")) {
          if (!isVenomMode && !isAttacking) {
            triggerVenomAttack();
          }
        } else if (
          val === "spider" ||
          val === "spidey" ||
          val === "purge" ||
          val === "normal" ||
          val === "exit" ||
          val === "reset" ||
          val === "back"
        ) {
          if (isVenomMode) {
            revertToSpidey();
          }
        }
      }
    };

    // 2. Global keystroke buffer: typing v-e-n-o-m anywhere
    let keyBuffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key && e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 12) {
          keyBuffer = keyBuffer.slice(-12);
        }

        if (keyBuffer.includes("venom")) {
          keyBuffer = "";
          toggleVenom();
        } else if (
          keyBuffer.includes("spider") ||
          keyBuffer.includes("spidey") ||
          keyBuffer.includes("purge") ||
          keyBuffer.includes("exit") ||
          keyBuffer.includes("reset") ||
          keyBuffer.includes("back")
        ) {
          keyBuffer = "";
          revertToSpidey();
        }
      }
    };

    window.addEventListener("input", handleInput);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("input", handleInput);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVenomMode, isAttacking]);

  return (
    <VenomContext.Provider
      value={{ isVenomMode, triggerVenomAttack, revertToSpidey, toggleVenom }}
    >
      {children}

      {/* Cinematic Venom Attack Transition Overlay */}
      <VenomAttackOverlay isActive={isAttacking} onComplete={onAttackComplete} />

      {/* No indicator light or floating button as requested */}
    </VenomContext.Provider>
  );
}

export function useVenom() {
  return useContext(VenomContext);
}
