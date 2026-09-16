"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

interface Session {
  id: string;
  date: string;
  type: string;
  status: string;
  patient: { id: string; name: string; email: string };
}

interface Note {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  patient: { id: string; name: string };
  session: { id: string; date: string; type: string } | null;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  sessionType: string;
  preferredDate: string;
  preferredTime: string;
  therapistPreference: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export default function ClinicianDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "patients" | "sessions" | "notes" | "chat">("bookings");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ patientId: "", type: "session", content: "", sessionId: "" });
  const [sessionForm, setSessionForm] = useState({ patientId: "", date: "", type: "individual" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "clinician") {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    fetch("/api/sessions").then((r) => r.json()).then((d) => setSessions(d.sessions || []));
    fetch("/api/notes").then((r) => r.json()).then((d) => setNotes(d.notes || []));
    fetch("/api/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings || []));
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionForm),
    });
    if (res.ok) {
      setMessage("Session created");
      setSessionForm({ patientId: "", date: "", type: "individual" });
      const d = await fetch("/api/sessions").then((r) => r.json());
      setSessions(d.sessions || []);
    } else {
      setMessage("Failed to create session");
    }
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    });
    if (res.ok) {
      setMessage("Note saved");
      setNoteForm({ patientId: "", type: "session", content: "", sessionId: "" });
      const d = await fetch("/api/notes").then((r) => r.json());
      setNotes(d.notes || []);
    } else {
      setMessage("Failed to save note");
    }
  }

  async function acceptBooking(booking: Booking) {
    setMessage("");
    // Update booking status to confirmed
    const patchRes = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: booking.id, status: "confirmed" }),
    });
    if (!patchRes.ok) {
      setMessage("Failed to confirm booking");
      return;
    }
    // Create a session from the booking data
    const sessionRes = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patients.find((p) => p.email === booking.email)?.id || "",
        date: `${booking.preferredDate}T${booking.preferredTime}:00`,
        type: booking.sessionType,
      }),
    });
    if (sessionRes.ok) {
      setMessage("Booking confirmed and session created");
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "confirmed" } : b));
      const d = await fetch("/api/sessions").then((r) => r.json());
      setSessions(d.sessions || []);
    } else {
      setMessage("Booking confirmed but failed to create session");
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "confirmed" } : b));
    }
  }

  async function declineBooking(booking: Booking) {
    setMessage("");
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: booking.id, status: "cancelled" }),
    });
    if (res.ok) {
      setMessage("Booking declined");
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "cancelled" } : b));
    } else {
      setMessage("Failed to decline booking");
    }
  }

  if (!user) return null;

  const tabs = [
    { id: "bookings" as const, label: "Bookings" },
    { id: "patients" as const, label: "Patients" },
    { id: "sessions" as const, label: "Sessions" },
    { id: "notes" as const, label: "Notes" },
    { id: "chat" as const, label: "Messages" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-brand-brown">Clinician Dashboard</h1>
            <p className="text-brand-brown/60 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-brand-brown border border-brand-brown/20 rounded-lg hover:bg-brand-offwhite"
            >
              Dashboard
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
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-brand-offwhite rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-brown text-brand-offwhite"
                  : "text-brand-brown/60 hover:text-brand-brown"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-serif text-brand-brown mb-4">Booking Requests</h2>
            {bookings.length === 0 ? (
              <p className="text-brand-brown/50">No booking requests yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-lg border border-brand-brown/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-brand-brown">{b.name}</p>
                        <p className="text-sm text-brand-brown/60">{b.email}</p>
                        {b.phone && <p className="text-sm text-brand-brown/60">{b.phone}</p>}
                        <p className="text-sm text-brand-brown/60 mt-1">
                          {b.sessionType} &middot; {b.preferredDate} at {b.preferredTime}
                        </p>
                        {b.therapistPreference && b.therapistPreference !== "No preference" && (
                          <p className="text-xs text-brand-brown/50">Therapist: {b.therapistPreference}</p>
                        )}
                        {b.notes && <p className="text-xs text-brand-brown/50 mt-1">Notes: {b.notes}</p>}
                        <p className="text-xs text-brand-brown/40 mt-1">
                          Requested {new Date(b.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "confirmed" ? "bg-green-100 text-green-700"
                          : b.status === "cancelled" ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {b.status}
                        </span>
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={() => acceptBooking(b)}
                              className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => declineBooking(b)}
                              className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-serif text-brand-brown mb-4">Your Patients</h2>
            {patients.length === 0 ? (
              <p className="text-brand-brown/50">No patients registered yet.</p>
            ) : (
              <div className="space-y-3">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient === p.id
                        ? "border-brand-brown bg-brand-offwhite"
                        : "border-brand-brown/10 hover:border-brand-brown/30"
                    }`}
                    onClick={() => setSelectedPatient(p.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-brand-brown">{p.name}</p>
                        <p className="text-sm text-brand-brown/60">{p.email}</p>
                        {p.phone && <p className="text-sm text-brand-brown/60">{p.phone}</p>}
                      </div>
                      <Link
                        href={`/messages?with=${p.id}`}
                        className="text-xs text-brand-brown/60 hover:text-brand-brown underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-brand-brown mb-4">Schedule Session</h2>
              <form onSubmit={createSession} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-brand-brown/70 mb-1">Patient</label>
                  <select
                    value={sessionForm.patientId}
                    onChange={(e) => setSessionForm((f) => ({ ...f, patientId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm text-brand-brown/70 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-sm text-brand-brown/70 mb-1">Type</label>
                  <select
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                  >
                    <option value="individual">Individual</option>
                    <option value="couples">Couples</option>
                    <option value="family">Family</option>
                    <option value="group">Group</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-brand-brown text-brand-offwhite px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-taupe transition-colors"
                >
                  Schedule
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-brand-brown mb-4">Upcoming Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-brand-brown/50">No sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-4 rounded-lg border border-brand-brown/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-brand-brown">{s.patient.name}</p>
                          <p className="text-sm text-brand-brown/60">
                            {new Date(s.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-xs text-brand-brown/50 capitalize">{s.type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          s.status === "completed" ? "bg-green-100 text-green-700"
                          : s.status === "cancelled" ? "bg-red-100 text-red-700"
                          : "bg-brand-offwhite text-brand-brown"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-brand-brown mb-4">Add Note</h2>
              <form onSubmit={createNote} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-brand-brown/70 mb-1">Patient</label>
                    <select
                      value={noteForm.patientId}
                      onChange={(e) => setNoteForm((f) => ({ ...f, patientId: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                      required
                    >
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-brand-brown/70 mb-1">Note Type</label>
                    <select
                      value={noteForm.type}
                      onChange={(e) => setNoteForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                    >
                      <option value="session">Session Note</option>
                      <option value="patient">Patient Note</option>
                    </select>
                  </div>
                  {noteForm.type === "session" && (
                    <div className="flex-1">
                      <label className="block text-sm text-brand-brown/70 mb-1">Session (optional)</label>
                      <select
                        value={noteForm.sessionId}
                        onChange={(e) => setNoteForm((f) => ({ ...f, sessionId: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-brand-brown/20 text-sm"
                      >
                        <option value="">No session</option>
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.patient.name} - {new Date(s.date).toLocaleDateString("en-IN")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-brand-brown/70 mb-1">Content</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    placeholder="Write your clinical notes here..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-brown text-brand-offwhite px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-taupe transition-colors"
                >
                  Save Note
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-brand-brown mb-4">Recent Notes</h2>
              {notes.length === 0 ? (
                <p className="text-brand-brown/50">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="p-4 rounded-lg border border-brand-brown/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-brand-brown">{n.patient.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-brand-offwhite text-brand-brown capitalize">
                            {n.type}
                          </span>
                          <span className="text-xs text-brand-brown/50">
                            {new Date(n.updatedAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                      {n.session && (
                        <p className="text-xs text-brand-brown/50 mb-1">
                          Session: {new Date(n.session.date).toLocaleDateString("en-IN")} ({n.session.type})
                        </p>
                      )}
                      <p className="text-sm text-brand-brown/80 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-serif text-brand-brown mb-4">Messages</h2>
            <p className="text-brand-brown/60 text-sm mb-4">Select a patient to start messaging.</p>
            <div className="space-y-2">
              {patients.map((p) => (
                <Link
                  key={p.id}
                  href={`/messages?with=${p.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-brand-brown/10 hover:border-brand-brown/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-brand-brown">{p.name}</p>
                    <p className="text-sm text-brand-brown/60">{p.email}</p>
                  </div>
                  <span className="text-brand-brown/40">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
