'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen, Trash2, Clock, Check, Eye } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

export function MessageManager({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const toggleReadStatus = async (msg: ContactMessage) => {
    try {
      const nextRead = !msg.read;
      const res = await fetch(`/api/v1/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: nextRead }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setMessages(messages.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m)));
      toast({
        title: nextRead ? 'Marked as Read' : 'Marked as Unread',
      });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await toggleReadStatus(msg);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/v1/messages/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');

      setMessages(messages.filter((m) => m.id !== deleteTarget.id));
      toast({ title: 'Message Deleted', description: 'Message removed from database.' });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Contact Inquiries ({messages.length})</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground">No inquiries received yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`border-border hover:border-primary/40 transition-colors ${
                !msg.read ? 'bg-primary/5 border-primary/20' : ''
              }`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => openMessage(msg)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">({msg.email})</span>
                    {!msg.read ? (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                        New
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                        Read
                      </Badge>
                    )}
                  </div>
                  {msg.subject && (
                    <p className="text-xs font-medium text-foreground">{msg.subject}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openMessage(msg)}
                      className="h-8 px-2 text-xs"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReadStatus(msg)}
                      className="h-8 px-2 text-xs text-muted-foreground"
                      title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {msg.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(msg)}
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Message Detail Dialog */}
      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || 'Contact Inquiry'}</DialogTitle>
            <DialogDescription>
              From <span className="font-semibold text-foreground">{selectedMessage?.name}</span> ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="text-xs text-muted-foreground font-mono">
              Sent at: {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
            </div>

            <div className="bg-muted/40 p-4 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMessage?.message}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject || 'Portfolio Inquiry'}`}>
                  Reply via Email
                </a>
              </Button>
              <Button variant="default" size="sm" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the message from &ldquo;{deleteTarget?.name}&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
