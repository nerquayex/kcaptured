"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { services } from "@/lib/services-data";

const AUTH_TOKEN_KEY = "uploadToken";
const UPLOAD_SOURCE_HEADER_VALUE = "kc-upload";

interface TestimonialData {
  id: string;
  clientName: string;
  clientRole: string;
  videoUrl: string;
  videoPublicId?: string;
  createdAt: string;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [editingItem, setEditingItem] = useState<TestimonialData | null>(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientRole, setEditClientRole] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editActive, setEditActive] = useState(true);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientRole, setClientRole] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
      const response = await fetch("/api/testimonials?admin=1", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (fetchError) {
      console.error("Failed to fetch testimonials", fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";

    if (!videoFile || !clientName || !clientRole) {
      setError(
        "Please provide a name, choose a session type, and attach a video.",
      );
      return;
    }

    if (!token) {
      setError("Upload key missing. Use the footer lock to request a session.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("clientName", clientName);
      formData.append("clientRole", clientRole);

      const response = await fetch("/api/testimonial-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: formData,
      });

      const body = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
          window.sessionStorage.removeItem("uploadTokenExpiry");
          window.location.reload();
          return;
        }

        setError(body?.error ?? "Testimonial upload failed. Please try again.");
        return;
      }

      // If API returned the created testimonial, prepend it to the list so UI updates immediately
      if (body?.testimonial) {
        setTestimonials((prev) => [body.testimonial, ...(prev ?? [])]);
      }

      setSuccess("Testimonial added successfully.");
      setVideoFile(null);
      setClientName("");
      setClientRole("");
      setTimeout(() => {
        setDialogOpen(false);
      }, 600);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Testimonial upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: TestimonialData) => {
    const ok = confirm(
      "Are you sure you want to delete this testimonial? This action cannot be undone.",
    );
    if (!ok) return;

    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing. Use the footer lock to request a session.");
      return;
    }

    try {
      const response = await fetch("/api/testimonial-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({
          id: item.id,
          videoPublicId: item.videoPublicId,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error ?? "Delete failed");
      }

      await fetchTestimonials();
    } catch (e) {
      console.error("Failed to delete testimonial", e);
      alert("Failed to delete testimonial. Check console for details.");
    }
  };

  const openEdit = (item: TestimonialData) => {
    setEditingItem(item);
    setEditClientName(item.clientName);
    setEditClientRole(item.clientRole);
    setEditImageUrl((item as any).imageUrl ?? null);
    setEditActive((item as any).active ?? true);
    setEditFeatured((item as any).featured ?? false);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing.");
      return;
    }

    try {
      let newVideoPublicId: string | undefined;
      let newVideoUrl: string | undefined;

      if (editVideoFile) {
        const fd = new FormData();
        fd.append("file", editVideoFile);
        fd.append("clientName", editClientName);
        fd.append("clientRole", editClientRole);

        const uploadRes = await fetch("/api/testimonial-upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
            "x-replace-id": editingItem.id,
          },
          body: fd,
        });

        const uploadBody = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadBody?.error ?? "Upload failed");
        newVideoPublicId = uploadBody?.testimonial?.videoPublicId;
        newVideoUrl = uploadBody?.testimonial?.videoUrl;
      }

      const patchBody: any = {
        id: editingItem.id,
        clientName: editClientName,
        clientRole: editClientRole,
        imageUrl: editImageUrl,
        active: editActive,
        featured: editFeatured,
      };
      if (newVideoPublicId) patchBody.newVideoPublicId = newVideoPublicId;
      if (newVideoUrl) patchBody.newVideoUrl = newVideoUrl;

      const res = await fetch("/api/testimonial", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify(patchBody),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Update failed");

      await fetchTestimonials();
      setEditingItem(null);
      setEditVideoFile(null);
    } catch (e) {
      console.error("Failed to save testimonial edit", e);
      alert("Failed to save changes. See console for details.");
    }
  };

  const handleMove = async (
    item: TestimonialData,
    direction: "up" | "down",
  ) => {
    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing.");
      return;
    }
    const idx = testimonials.findIndex((t) => t.id === item.id);
    if (idx === -1) return;
    const toIndex =
      direction === "up"
        ? Math.max(0, idx - 1)
        : Math.min(testimonials.length - 1, idx + 1);
    try {
      const res = await fetch("/api/testimonial-reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({ id: item.id, toIndex }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      await fetchTestimonials();
    } catch (e) {
      console.error("Failed to reorder", e);
      alert("Failed to reorder. See console.");
    }
  };

  const sessionOptions = Array.from(new Set(services.map((s) => s.name)));

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">
              Testimonials
            </p>
            <h1 className="mt-3 text-4xl font-semibold">Client testimonials</h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              Manage testimonial videos. Only the client name and session are
              required.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add new</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border border-white/10 p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle>Add testimonial</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">
                    Testimonial video
                  </label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      setVideoFile(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">
                    Client name
                  </label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="e.g. Jordan Smith"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-100">
                    Session type
                  </label>
                  <select
                    value={clientRole}
                    onChange={(e) => setClientRole(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">Select a session</option>
                    {sessionOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">{success}</p>}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit testimonial"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
              Loading testimonials...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
              No testimonials yet. Add a new one to get started.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm"
              >
                <div className="absolute right-4 bottom-4">
                  <button
                    onClick={() => handleDelete(testimonial)}
                    className="cursor-pointer rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="absolute left-4 top-4 flex gap-2">
                  <button
                    onClick={() => openEdit(testimonial)}
                    className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleMove(testimonial, "up")}
                    className="rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold text-white"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(testimonial, "down")}
                    className="rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold text-white"
                  >
                    ↓
                  </button>
                </div>

                {testimonial.videoUrl && (
                  <div className="mb-4 overflow-hidden rounded-2xl bg-black">
                    <video
                      src={testimonial.videoUrl}
                      controls
                      className="w-full h-auto"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {testimonial.clientName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {testimonial.clientRole}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
      {/* Edit dialog */}
      {editingItem && (
        <Dialog open={true} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-slate-950 border border-white/10 p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle>Edit testimonial</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-100">
                  Replace video (optional)
                </label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setEditVideoFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-100">
                  Client name
                </label>
                <Input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-100">
                  Session type
                </label>
                <Input
                  type="text"
                  value={editClientRole}
                  onChange={(e) => setEditClientRole(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />{" "}
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                  />{" "}
                  Featured
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-100">
                  Image URL (optional)
                </label>
                <Input
                  type="text"
                  value={editImageUrl ?? ""}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
