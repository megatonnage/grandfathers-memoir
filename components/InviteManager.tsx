'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Invite, UserRole } from '../types';
import { Mail, Plus, Trash2, Copy, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface InviteManagerProps {
  currentUserId: string;
}

export default function InviteManager({ currentUserId }: InviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'invites'), orderBy('invitedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invite)));
    });
    return unsubscribe;
  }, []);

  const generateInviteToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const email = newEmail.toLowerCase().trim();
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite: Omit<Invite, 'id'> = {
      email,
      role: newRole,
      invitedBy: currentUserId,
      invitedAt: new Date().toISOString(),
      status: 'pending',
      token,
      expiresAt: expiresAt.toISOString(),
    };

    try {
      await setDoc(doc(db, 'invites', email), invite);
      setNewEmail('');
      setNewRole('user');
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Failed to create invitation.');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Delete this invitation?')) return;
    try {
      await deleteDoc(doc(db, 'invites', inviteId));
    } catch (error) {
      console.error('Error deleting invite:', error);
      alert('Failed to delete invitation.');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Create Invite Form */}
      <div className="bg-white rounded-xl border border-outline-variant p-6">
        <h3 className="font-headline text-lg mb-4">Send Invitation</h3>
        <form onSubmit={handleCreateInvite} className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address..."
              required
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className="px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-white"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Invite
          </button>
        </form>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <h3 className="font-headline text-lg">Pending Invitations</h3>
          <p className="text-sm text-outline font-label mt-1">
            {invites.filter(i => i.status === 'pending' && !isExpired(i.expiresAt)).length} active invites
          </p>
        </div>

        <div className="divide-y divide-outline-variant">
          {invites.length === 0 ? (
            <div className="px-6 py-8 text-center text-outline">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No invitations sent yet.</p>
            </div>
          ) : (
            invites.map((invite) => {
              const expired = isExpired(invite.expiresAt);
              const effectiveStatus = expired && invite.status === 'pending' ? 'expired' : invite.status;

              return (
                <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-label font-medium">{invite.email}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-label uppercase",
                        getStatusColor(effectiveStatus)
                      )}>
                        {effectiveStatus}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-label uppercase",
                        invite.role === 'admin' ? 'bg-red-100 text-red-700' :
                        invite.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {invite.role}
                      </span>
                    </div>
                    <p className="text-xs text-outline">
                      Invited {new Date(invite.invitedAt).toLocaleDateString()}
                      {invite.status === 'pending' && (
                        <> • Expires {new Date(invite.expiresAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {invite.status === 'pending' && !expired && (
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="p-2 text-outline hover:text-primary transition-colors"
                        title="Copy invite link"
                      >
                        {copiedId === invite.token ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="p-2 text-outline hover:text-red-600 transition-colors"
                      title="Delete invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
