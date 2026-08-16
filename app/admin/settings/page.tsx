"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const AUTH_TOKEN_KEY = "uploadToken";
const UPLOAD_SOURCE_HEADER_VALUE = "kc-upload";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [cashApp, setCashApp] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      setBusinessName(data.business_name ?? "");
      setEmail(data.email ?? "");
      setInstagramUrl(data.instagram_url ?? "");
      setTiktokUrl(data.tiktok_url ?? "");
      setCashApp(data.cash_app ?? "");
      setZelleEmail(data.zelle_email ?? "");
    } catch (e) {
      console.error("Failed to load settings", e);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({
          businessName,
          email,
          instagramUrl,
          tiktokUrl,
          cashApp,
          zelleEmail,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Save failed");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Site Settings</h1>
          <p className="mt-2 text-gray-300">
            Manage contact information and social media links.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
            Loading settings...
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Name
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Instagram URL
              </label>
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                type="url"
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                TikTok URL
              </label>
              <input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                type="url"
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cash App
              </label>
              <input
                value={cashApp}
                onChange={(e) => setCashApp(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                placeholder="e.g., $Kenstevens2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Zelle Email
              </label>
              <input
                value={zelleEmail}
                onChange={(e) => setZelleEmail(e.target.value)}
                type="email"
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              />
            </div>

            {success && (
              <p className="text-sm text-green-400">
                Settings saved successfully!
              </p>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
