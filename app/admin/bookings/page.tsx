"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const UPLOAD_SOURCE_HEADER_VALUE = "kc-upload";
const AUTH_TOKEN_KEY = "uploadToken";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
      const res = await fetch("/api/bookings?admin=1", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        setBookings([]);
        return;
      }
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing");
      return;
    }
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchBookings();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const token = window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? "";
    if (!token) {
      alert("Upload key missing");
      return;
    }
    try {
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-upload-source": UPLOAD_SOURCE_HEADER_VALUE,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchBookings();
    } catch (e) {
      console.error(e);
      alert("Failed to delete booking");
    }
  };

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Bookings
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Manage customer booking requests.
          </h1>
          <p className="mt-2 text-gray-300">
            Manage incoming booking requests. Use the padlock in the footer to
            obtain an admin token.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-300">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {b.client_name} — {b.email}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(b.requested_at).toLocaleString()} •{" "}
                      {b.session_type}
                    </p>
                    <p className="mt-2 text-gray-300">{b.message}</p>
                    {b.admin_note && (
                      <p className="mt-2 text-sm text-gray-400">
                        Admin note: {b.admin_note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-200">{b.status}</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(b.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(b.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBooking(b.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
