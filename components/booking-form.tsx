"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  sessionType?: string | null;
  onClose: () => void;
}

export function BookingForm({ sessionType, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name || !email) {
      setError("Please provide your name and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          email,
          phone,
          sessionType: sessionType ?? null,
          requestedAt: new Date().toISOString(),
          message: null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to save booking");
      }
      onClose();
      // proceed to Instagram
      window.open(
        "https://www.instagram.com/kcaptures_.1",
        "_blank",
        "noopener,noreferrer",
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to save booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white">
          Phone (optional)
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#515bd4]"
        >
          {loading ? "Saving..." : "Continue to Instagram DM"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
