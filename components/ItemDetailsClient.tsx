'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, User, Phone, Tag, Trash2, CheckCircle2, MessageSquare, Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog } from './ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Message {
  _id: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Item {
  _id: string;
  title: string;
  category: string;
  type: 'lost' | 'found';
  description: string;
  location: string;
  date: string;
  personName: string;
  phone: string;
  imageUrl: string;
  status: string;
}

export default function ItemDetailsClient({ initialItem }: { initialItem: Item }) {
  const router = useRouter();
  const [item, setItem] = useState<Item>(initialItem);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Chat state
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Dialogs & Security state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);

  // Check for ownership on mount (or bypass in local development for testing mock items)
  useEffect(() => {
    const localToken = localStorage.getItem(`item-token-${item._id}`);
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (localToken || isLocalhost) {
      setHasEditAccess(true);
    }
  }, [item._id]);

  // Load sender name from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem('chatSenderName');
    if (savedName) setSenderName(savedName);
  }, []);

  // Fetch messages from API
  const fetchMessages = async (silent = false) => {
    try {
      const res = await fetch(`/api/messages/${item._id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (e) {
      if (!silent) console.error('Failed to fetch messages:', e);
    }
  };

  // Initial fetch + short polling (every 4 seconds)
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [item._id]);

  // Scroll to bottom on message list change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle post message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) return toast.error('Please enter your name to send a message');
    if (!messageText.trim()) return toast.error('Please type a message');

    setSendingMsg(true);
    localStorage.setItem('chatSenderName', senderName.trim());

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item._id,
          senderName: senderName.trim(),
          message: messageText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessageText('');
        fetchMessages(); // Refresh chat list
      } else {
        toast.error('Failed to send message: ' + data.error);
      }
    } catch (error: any) {
      toast.error('Error sending message: ' + error.message);
    } finally {
      setSendingMsg(false);
    }
  };

  // Toggle status of the item (requires ownership token)
  const handleToggleStatus = async () => {
    let nextStatus = '';
    if (item.type === 'lost') {
      nextStatus = item.status === 'searching' ? 'recovered' : 'searching';
    } else {
      nextStatus = item.status === 'waiting' ? 'returned' : 'waiting';
    }

    const localToken = localStorage.getItem(`item-token-${item._id}`) || '';

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-edit-token': localToken
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setItem(data.item);
        toast.success(`Status updated to: ${nextStatus === 'recovered' || nextStatus === 'returned' ? 'Completed 🎉' : 'Active status'}`);
      } else {
        toast.error('Failed to update status: ' + data.error);
      }
    } catch (error: any) {
      toast.error('Error updating status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete the report (requires ownership token)
  const handleDeleteReport = async () => {
    const localToken = localStorage.getItem(`item-token-${item._id}`) || '';

    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: 'DELETE',
        headers: {
          'x-edit-token': localToken
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Report deleted successfully');
        setIsDeleteOpen(false);
        router.push(item.type === 'lost' ? '/lost' : '/found');
      } else {
        toast.error('Failed to delete report: ' + data.error);
      }
    } catch (error: any) {
      toast.error('Error deleting report: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const isLost = item.type === 'lost';
  const isActive = isLost ? item.status === 'searching' : item.status === 'waiting';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Main Grid: Details (Left) + Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            {/* Large image */}
            <div className="relative aspect-video w-full bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4">
                <Badge className={isLost ? "bg-red-500/90 text-white text-sm px-3 py-1" : "bg-emerald-500/90 text-white text-sm px-3 py-1"}>
                  {isLost ? 'Lost Item' : 'Found Item'}
                </Badge>
              </div>
            </div>

            {/* Info contents */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {item.title}
                </h1>
                
                <Badge className="text-sm px-3 py-1" variant={isActive ? 'warning' : 'success'}>
                  {item.status.toUpperCase()}
                </Badge>
              </div>

              {/* Categorization & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 my-4 border-y border-border text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>Category: <strong className="text-foreground capitalize">{item.category}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{isLost ? 'Lost at' : 'Found at'}: <strong className="text-foreground">{item.location}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" suppressHydrationWarning>
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{isLost ? 'Lost on' : 'Found on'}: <strong className="text-foreground">{formatDate(item.date)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>Reporter: <strong className="text-foreground">{item.personName}</strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-6">
                <h3 className="font-bold text-foreground">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Phone/Contact Info Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reporter Phone Number</p>
                    <p className="font-bold text-foreground text-sm sm:text-base">{item.phone}</p>
                  </div>
                </div>
                <a href={`tel:${item.phone}`}>
                  <Button size="sm">Call Reporter</Button>
                </a>
              </div>
            </div>

            {/* Quick Actions Footer - Only visible to the owner with the token */}
            {hasEditAccess ? (
              <div className="border-t border-border px-6 py-4 bg-muted/20 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <span>🛡️ Post Creator Options</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={updatingStatus}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {updatingStatus ? 'Updating...' : isLost 
                        ? (isActive ? 'Mark as Recovered' : 'Reopen Search') 
                        : (isActive ? 'Mark as Returned' : 'Reopen Waiting')}
                    </span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Report</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-border px-6 py-3 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <span>Report created by {item.personName}. Use the open chat to coordinate.</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Section */}
        <div className="lg:col-span-5 border border-border bg-card rounded-xl shadow-sm flex flex-col h-[580px] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/10 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <h3 className="font-bold text-foreground">Open Communication Chat</h3>
              <p className="text-xs text-muted-foreground">No registration. Chat directly to return items.</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/30 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                <MessageSquare className="h-8 w-8 text-neutral-300" />
                <p className="text-sm">No messages yet.</p>
                <p className="text-xs max-w-[200px]">Ask details about the item or coordinate a meeting spot!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderName.trim().toLowerCase() === senderName.trim().toLowerCase();
                return (
                  <div key={msg._id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-0.5" suppressHydrationWarning>
                      <span className="text-xs font-semibold text-foreground/80">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isSelf
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none'
                      }`}
                    >
                      <p className="break-words leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-muted/10 space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Your Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                className="w-1/3 bg-background"
                disabled={sendingMsg}
              />
              <Input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                className="flex-1 bg-background"
                disabled={sendingMsg}
              />
              <Button type="submit" size="icon" disabled={sendingMsg} className="rounded-lg h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Item Report?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete this report? This will remove all matching messages from our database. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteReport} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
