"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  date: string;
  type: string;
  status: string;
  clinician: { id: string; name: string };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  session: { id: string; date: string; type: string };
}

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "patient") {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ]).then(([s, p]) => {
      setSessions(s.sessions || []);
      setPayments(p.payments || []);
      setLoading(false);
    });
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handlePay(sessionId: string) {
    setPaymentLoading(sessionId);
    setMessage("");

    try {
      // Create order
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, amount: 50000 }), // ₹500
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Payment failed");
        setPaymentLoading(null);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: data.amount,
        currency: data.currency,
        name: "Mindscaping",
        description: "Session Payment",
        order_id: data.orderId,
        handler: function () {
          setMessage("Payment successful!");
          setPaymentLoading(null);
          // Refresh payments
          fetch("/api/payments").then((r) => r.json()).then((d) => setPayments(d.payments || []));
        },
        prefill: { name: user?.name || "" },
        theme: { color: "#6b5b95" },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      new RazorpayConstructor(options).open();
    } catch {
      setMessage("Payment initialization failed");
      setPaymentLoading(null);
    }
  }

  if (!user || loading) return null;

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const pastSessions = sessions.filter((s) => s.status !== "scheduled");
  const totalPaid = payments.filter((p) => p.status === "captured").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-brand-brown">My Dashboard</h1>
            <p className="text-brand-brown/60 text-sm mt-1">Welcome, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/messages"
              className="px-4 py-2 text-sm text-brand-brown border border-brand-brown/20 rounded-lg hover:bg-brand-offwhite"
            >
              Messages
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-brand-brown border border-brand-brown/20 rounded-lg hover:bg-brand-offwhite"
            >
              Sign Out
            </button>
          </div>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${message.includes("failed") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-brand-brown/60">Upcoming Sessions</p>
            <p className="text-3xl font-serif text-brand-brown mt-1">{upcomingSessions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-brand-brown/60">Completed Sessions</p>
            <p className="text-3xl font-serif text-brand-brown mt-1">{pastSessions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-brand-brown/60">Total Paid</p>
            <p className="text-3xl font-serif text-brand-brown mt-1">₹{(totalPaid / 100).toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-serif text-brand-brown mb-4">Upcoming Sessions</h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-brand-brown/50">No upcoming sessions. <Link href="/book" className="text-brand-brown underline">Book one now</Link>.</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => (
                <div key={s.id} className="p-4 rounded-lg border border-brand-brown/10 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-brown">with {s.clinician.name}</p>
                    <p className="text-sm text-brand-brown/60">
                      {new Date(s.date).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs text-brand-brown/50 capitalize">{s.type} therapy</p>
                  </div>
                  {!payments.find((p) => p.session.id === s.id && p.status === "captured") && (
                    <button
                      onClick={() => handlePay(s.id)}
                      disabled={paymentLoading === s.id}
                      className="bg-brand-brown text-brand-offwhite px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-taupe transition-colors disabled:opacity-50"
                    >
                      {paymentLoading === s.id ? "Processing..." : "Pay ₹500"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-serif text-brand-brown mb-4">Payment History</h2>
          {payments.length === 0 ? (
            <p className="text-brand-brown/50">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="p-4 rounded-lg border border-brand-brown/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-brown">
                      Session on {new Date(p.session.date).toLocaleDateString("en-IN")}
                    </p>
                    <p className="text-xs text-brand-brown/50">
                      Paid on {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-brand-brown">₹{(p.amount / 100).toLocaleString("en-IN")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "captured" ? "bg-green-100 text-green-700"
                      : p.status === "failed" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
