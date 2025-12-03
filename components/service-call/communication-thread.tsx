"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreHorizontal,
  Lock,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  type ThreadMessage,
  type Employee,
  type Customer,
} from "@/lib/types/service-call";
import { mockEmployees } from "@/lib/mock-service-calls";

interface CommunicationThreadProps {
  type: "internal" | "external";
  serviceCallId: string;
  initialMessages?: ThreadMessage[];
  currentUser?: Employee;
}

// Mock initial messages generator
function getInitialMessages(type: "internal" | "external"): ThreadMessage[] {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  if (type === "internal") {
    return [
      {
        id: "msg-1",
        authorId: "emp-1",
        author: mockEmployees[0],
        content: "I've diagnosed the issue - it's a faulty switch port. Ordering replacement now.",
        createdAt: twoHoursAgo.toISOString(),
        isInternal: true,
      },
      {
        id: "msg-2",
        authorId: "emp-3",
        author: mockEmployees[2],
        content: "Switch arrived. I'll start the replacement tomorrow morning.",
        createdAt: oneHourAgo.toISOString(),
        isInternal: true,
      },
    ];
  } else {
    return [
      {
        id: "msg-3",
        authorId: "emp-1",
        author: mockEmployees[0],
        content: "We've identified the issue and are working on a solution. We'll keep you updated.",
        createdAt: twoHoursAgo.toISOString(),
        isInternal: false,
      },
      {
        id: "msg-4",
        authorId: "emp-3",
        author: mockEmployees[2],
        content: "Good news - the replacement part has arrived. We'll complete the repair tomorrow.",
        createdAt: oneHourAgo.toISOString(),
        isInternal: false,
      },
    ];
  }
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return format(date, "MMM d, yyyy");
}

function MessageBubble({
  message,
  isOwnMessage,
}: {
  message: ThreadMessage;
  isOwnMessage: boolean;
}) {
  const author = message.author as Employee | undefined;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={author?.avatar} alt={author?.name} />
        <AvatarFallback className="text-xs">
          {author?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className={`flex-1 max-w-[80%] ${isOwnMessage ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "justify-end" : ""}`}>
          <span className="font-medium text-sm">{author?.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
        <div
          className={`inline-block rounded-lg px-4 py-2 text-sm ${
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.content}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex gap-2 mt-2">
            {message.attachments.map((attachment, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Paperclip className="h-3 w-3 mr-1" />
                {attachment}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommunicationThread({
  type,
  serviceCallId,
  initialMessages,
  currentUser = mockEmployees[0], // Default to first employee for demo
}: CommunicationThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>(
    initialMessages || getInitialMessages(type)
  );
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInternal = type === "internal";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const message: ThreadMessage = {
      id: `msg-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isInternal,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {isInternal ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
              {isInternal ? "Internal Discussion" : "Customer Communication"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isInternal
                ? "Private thread for team coordination"
                : "External thread visible to customer"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark all as read</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Export conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.authorId === currentUser.id}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              placeholder={`Type a message${isInternal ? " (internal only)" : ""}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isInternal && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Only visible to team members
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
