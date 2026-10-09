"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { api } from "@/services/api";
import { sound } from "@/services/audio";
import type { ShopItem, User } from "@/models/api";

export function useShopController() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const loadShop = useCallback(async () => {
    try {
      const [nextUser, nextItems] = await Promise.all([api.getUser(), api.getShopItems()]);
      setUser(nextUser);
      setItems(nextItems);
    } catch (error) {
      console.error("Failed to load shop:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadShop);
  }, [loadShop]);

  const refillHearts = useCallback(async (method: "gems" | "practice" | "free") => {
    await api.refillHearts(method);
    await loadShop();
  }, [loadShop]);

  const simulateStreak = useCallback(async (
    action: "advance_day" | "miss_day" | "freeze" | "reset",
  ) => {
    await api.simulateStreak(action);
    await loadShop();
  }, [loadShop]);

  const deductHeart = useCallback(async () => {
    if (!user) return;
    await api.updateUserStats({ hearts: Math.max(0, user.hearts - 1) });
    await loadShop();
  }, [loadShop, user]);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    await loadShop();
  }, [loadShop]);

  const purchaseItem = useCallback(async (item: ShopItem) => {
    if (!item.can_afford) {
      sound.playIncorrect();
      setPurchaseMessage(`You need ${item.cost - (user?.gems || 0)} more gems for ${item.title}!`);
      return;
    }

    try {
      const result = await api.purchaseShopItem(item.id);
      sound.playCorrect();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setPurchaseMessage(result.message);
      await loadShop();
    } catch (error: unknown) {
      setPurchaseMessage(error instanceof Error ? error.message : "Purchase failed");
    }
  }, [loadShop, user]);

  useEffect(() => {
    if (!purchaseMessage) return;
    const timeout = window.setTimeout(() => setPurchaseMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [purchaseMessage]);

  return {
    user,
    items,
    loading,
    purchaseMessage,
    loadShop,
    refillHearts,
    simulateStreak,
    deductHeart,
    resetProgress,
    purchaseItem,
  };
}
