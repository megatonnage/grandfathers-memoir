'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lock, User, Mail, Check, Trash2, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../../types';

export default function SetupPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    displayName: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load existing users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserType));
      setUsers(usersList);
    } catch (err) {
      setError('Error loading users. Make sure Firestore is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setDoc(doc(db, 'users', formData.uid), {
        email: formData.email.toLowerCase(),
        displayName: formData.displayName,
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        inviteStatus: 'accepted',
      });

      setFormData({ uid: '', email: '', displayName: '' });
      setShowAddForm(false);
      await loadUsers();
    } catch (err) {
      setError('Error creating admin user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? They will lose access to the archive.')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await loadUsers();
    } catch (err) {
      setError('Error deleting user.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-outline-variant p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-2xl text-on-surface">User Management</h1>
              <p className="text-outline text-sm">{users.length} user(s) in database</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Existing Users */}
          <div className="space-y-3 mb-8">
            <h2 className="font-label text-sm uppercase tracking-wider text-outline">Existing Users</h2>
            {users.length === 0 ? (
              <p className="text-outline py-4">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                  <div>
                    <p className="font-label font-medium">{user.displayName}</p>
                    <p className="text-sm text-outline">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-outline font-mono">ID: {user.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-outline hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New User */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-outline-variant rounded-lg text-outline hover:border-primary hover:text-primary transition-colors font-label"
            >
              + Add New User
            </button>
          ) : (
            <form onSubmit={createAdmin} className="space-y-4 border-t border-outline-variant pt-6">
              <h2 className="font-label text-sm uppercase tracking-wider text-outline mb-4">Add New User</h2>
              
              <div>
                <label className="block text-sm font-label text-outline mb-1">
                  Firebase Auth UID *
                </label>
                <input
                  type="text"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  required
                  placeholder="Paste UID from Firebase Console"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-outline mt-1">
                  1. Try to sign in on /admin first (it will fail)<br/>
                  2. Go to Firebase Console → Authentication → Users<br/>
                  3. Copy your UID and paste it here
                </p>
              </div>

              <div>
                <label className="block text-sm font-label text-outline mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-label text-outline mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-lg font-label hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-label font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-outline-variant">
            <a
              href="/admin"
              className="block w-full py-3 bg-surface-container text-center rounded-lg font-label hover:bg-surface-container-high transition-colors"
            >
              Go to Admin Panel →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
