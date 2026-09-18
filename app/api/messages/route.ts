import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateToken, verifyToken } from "@/lib/csrf";

// GET /api/messages - list conversations
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  if (withUserId) {
    // Get conversation with specific user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  }

  // Get all conversations (latest message per user)
  const sent = await prisma.message.findMany({
    where: { senderId: user.id },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: user.id },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const userIds = [...new Set([...sent.map((m) => m.receiverId), ...received.map((m) => m.senderId)])];

  const conversations = await Promise.all(
    userIds.map(async (otherId) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherId },
            { senderId: otherId, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { name: true } } },
      });
      const unread = await prisma.message.count({
        where: { senderId: otherId, receiverId: user.id, read: false },
      });
      const otherUser = await prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, name: true, role: true },
      });
      return { otherUser, lastMessage, unread };
    })
  );

  return NextResponse.json({ conversations });
}

// POST /api/messages - send a message
export async function POST(req: NextRequest) {
  if (!(await verifyToken(req))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();
  if (!receiverId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
