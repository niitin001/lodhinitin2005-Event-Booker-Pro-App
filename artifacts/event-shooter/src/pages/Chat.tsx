import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import {
  useListConversations,
  getListConversationsQueryKey,
  useGetMessages,
  getGetMessagesQueryKey,
  useSendMessage,
  useMarkMessagesRead,
} from "@workspace/api-client-react";

export default function Chat() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convLoading } = useListConversations(undefined, {
    query: { enabled: !!user, queryKey: getListConversationsQueryKey(), refetchInterval: 10000 }
  });

  const { data: messages, isLoading: msgLoading } = useGetMessages(activeId || 0, {
    query: { enabled: !!activeId, queryKey: getGetMessagesQueryKey(activeId || 0), refetchInterval: 5000 }
  });

  const sendMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

  useEffect(() => {
    if (activeId && messages) {
      const hasUnread = messages.some((m: any) => !m.isRead && m.senderId !== user?.id);
      if (hasUnread) {
        markReadMutation.mutate({ id: activeId });
      }
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, activeId, user?.id]);

  const handleSend = () => {
    if (!message.trim() || !activeId) return;
    sendMutation.mutate({
      id: activeId,
      data: { content: message.trim(), type: "text" } as any
    }, {
      onSuccess: () => setMessage("")
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConv = conversations?.find(c => c.id === activeId);
  const getOtherParticipant = (c: any) => {
    if (c.participantA?.id === user?.id) return c.participantB;
    if (c.participantB) return c.participantB;
    return { name: "User" };
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        <Card className="flex-1 flex overflow-hidden border-border/50 shadow-sm">
          {/* Sidebar */}
          <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-border`}>
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-serif text-xl font-bold tracking-tight">Messages</h2>
            </div>
            <ScrollArea className="flex-1">
              {convLoading ? (
                <div className="p-4 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : conversations?.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No conversations yet.</div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations?.map(c => {
                    const other = getOtherParticipant(c);
                    return (
                      <div
                        key={c.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${activeId === c.id ? 'bg-muted' : ''}`}
                        onClick={() => setActiveId(c.id)}
                      >
                        <div className="flex gap-3 items-center">
                          <Avatar>
                            <AvatarImage src={other?.avatarUrl} />
                            <AvatarFallback>{other?.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-semibold text-sm truncate">{other?.name || "User"}</h3>
                              {c.lastMessageAt && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(c.lastMessageAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage || "No messages yet"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Main Chat Area */}
          <div className={`${!activeId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-background/50`}>
            {activeId && activeConv ? (
              <>
                <div className="h-16 px-4 border-b border-border flex items-center gap-3 bg-card shrink-0">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveId(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={getOtherParticipant(activeConv)?.avatarUrl} />
                    <AvatarFallback>{getOtherParticipant(activeConv)?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">{getOtherParticipant(activeConv)?.name || "User"}</h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                  {msgLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : messages?.map((m: any) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                        }`}>
                          {m.content}
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {messages?.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Send a message to start the conversation.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-card border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="bg-muted/50 border-0 focus-visible:ring-1"
                    />
                    <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} size="icon">
                      {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-serif text-xl text-foreground font-semibold mb-2">Your Messages</h3>
                <p className="text-sm max-w-sm text-center">Select a conversation from the sidebar to view or send messages.</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
