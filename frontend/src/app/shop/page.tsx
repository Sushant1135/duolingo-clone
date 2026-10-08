"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StreakModal } from "@/components/StreakModal";
import { HeartsModal } from "@/components/HeartsModal";
import { DevBar } from "@/components/DevBar";
import { api, User, ShopItem } from "@/lib/api";
import { ShoppingBag, Gem, Heart, ShieldCheck, Sparkles, Check } from "lucide-react";
import { sound } from "@/lib/audio";

export default function ShopPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const loadData = () => {
    Promise.all([api.getUser(), api.getShopItems()])
      .then(([u, shopItems]) => {
        setUser(u);
        setItems(shopItems);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    if (!item.can_afford) {
      sound.playIncorrect();
      setPurchaseMsg(`You need ${item.cost - (user?.gems || 0)} more gems for ${item.title}!`);
      setTimeout(() => setPurchaseMsg(null), 3000);
      return;
    }

    try {
      const res = await api.purchaseShopItem(item.id);
      sound.playCorrect();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setPurchaseMsg(res.message);
      setTimeout(() => setPurchaseMsg(null), 3500);
      loadData();
    } catch (e: any) {
      setPurchaseMsg(e.message || "Purchase failed");
      setTimeout(() => setPurchaseMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#131f24] text-[#4b4b4b] dark:text-white transition-colors">
      <div className="flex">
        <Sidebar onOpenDevTools={() => setShowDevModal(true)} />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <TopBar
            user={user}
            onOpenStreakModal={() => setShowStreakModal(true)}
            onOpenHeartsModal={() => setShowHeartsModal(true)}
          />

          <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8 space-y-8">
            {/* Shop Header & Gems Balance Banner */}
            <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-[#e5e5e5] bg-gradient-to-r from-[#e8f7ff] to-[#f4faff]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1cb0f6] text-white flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-[#4b4b4b]">Shop</h1>
                  <p className="text-xs text-[#777777] font-semibold">
                    Power-ups, heart refills, and gear for your journey
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-[#84d8ff] shadow-sm">
                <Gem className="w-6 h-6 text-[#1cb0f6] fill-[#1cb0f6]" />
                <span className="text-xl font-extrabold text-[#1cb0f6]">
                  {user?.gems || 0}
                </span>
              </div>
            </div>

            {/* Notification alert */}
            {purchaseMsg && (
              <div className="p-4 rounded-2xl bg-[#ddf4ff] border-2 border-[#84d8ff] text-[#1cb0f6] font-extrabold text-sm text-center animate-fade-in">
                {purchaseMsg}
              </div>
            )}

            {/* Shop Categories */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-[#4b4b4b]">Power-ups & Items</h3>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border-2 border-[#e5e5e5] hover:border-[#84d8ff] transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-[#f7f7f7] border border-[#e5e5e5] flex items-center justify-center text-3xl shrink-0">
                        {item.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-[#4b4b4b]">
                            {item.title}
                          </h4>
                          {item.badge && (
                            <span className="text-[10px] font-extrabold bg-[#fff4e5] text-[#ff9600] px-2 py-0.5 rounded-full uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#777777] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="sm:w-36 shrink-0 flex justify-end">
                      <button
                        onClick={() => handlePurchase(item)}
                        className={`w-full py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          item.can_afford ? "duo-btn-blue" : "duo-btn-gray opacity-80"
                        }`}
                      >
                        <Gem className="w-4 h-4 fill-current" />
                        <span>{item.cost}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onSimulateStreak={() => {}}
      />
      <HeartsModal
        isOpen={showHeartsModal}
        onClose={() => setShowHeartsModal(false)}
        user={user}
        onRefill={() => {}}
      />
      <DevBar
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        onSimulateStreak={() => {}}
        onRefillHearts={() => {}}
        onDeductHeart={() => {}}
        onResetProgress={() => {}}
      />
    </div>
  );
}
