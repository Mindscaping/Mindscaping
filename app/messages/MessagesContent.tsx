"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string };
  receiver: { id: string; name: string };
}

interface Conversation {
  otherUser: { id: string; name: string; role: string };
  lastMessage: { content: string; createdAt: string; sender: { name: string } } | null;
  unread: number;
}

export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !withUserId) return;
    const fetchMessages = () => {
      fetch(`/api/messages?with=${withUserId}`)
        .then((r) => r.json())
        .then((d) => setMessages(d.messages || []));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, withUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !withUserId) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: withUserId, content: newMessage }),
    });

    setNewMessage("");
    const d = await fetch(`/api/messages?with=${withUserId}`).then((r) => r.json());
    setMessages(d.messages || []);
  }

  if (!user) return null;

  // If viewing a conversation
  if (withUserId) {
    const otherUser = conversations.find((c) => c.otherUser.id === withUserId)?.otherUser;

    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/messages" className="text-brand-brown/60 hover:text-brand-brown">
              &larr;
            </Link>
            <h1 className="text-xl font-serif text-brand-brown">
              {otherUser?.name || "Messages"}
            </h1>
            <span className="text-xs text-brand-brown/50 capitalize">{otherUser?.role}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[calc(100vh-200px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-brand-brown/50 py-8">No messages yet. Say hello!</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender.id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender.id === user.id
                        ? "bg-brand-brown text-brand-offwhite rounded-br-md"
                        : "bg-brand-offwhite text-brand-brown rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender.id === user.id ? "text-brand-offwhite/60" : "text-brand-brown/40"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-brand-brown/10 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-full border border-brand-brown/20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-brand-brown text-brand-offwhite px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-taupe transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif text-brand-brown">Messages</h1>
          <Link
            href={user.role === "clinician" ? "/dashboard/clinician" : "/dashboard/patient"}
            className="px-4 py-2 text-sm text-brand-brown border border-brand-brown/20 rounded-lg hover:bg-brand-offwhite"
          >
            Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-brand-brown/50">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-brand-brown/50 mb-2">No conversations yet</p>
            <p className="text-sm text-brand-brown/40">Start a conversation from your dashboard.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-brand-brown/10">
            {conversations.map((conv) => (
              <Link
                key={conv.otherUser.id}
                href={`/messages?with=${conv.otherUser.id}`}
                className="flex items-center justify-between p-4 hover:bg-brand-offwhite/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-brand-brown">{conv.otherUser.name}</p>
                  {conv.lastMessage && (
                    <p className="text-sm text-brand-brown/60 truncate max-w-xs">
                      {conv.lastMessage.sender.name}: {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {conv.unread > 0 && (
                    <span className="bg-brand-brown text-brand-offwhite text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                  {conv.lastMessage && (
                    <span className="text-xs text-brand-brown/40">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
