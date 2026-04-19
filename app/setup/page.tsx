'use client';

import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lock, User, Mail, Check } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState<'check' | 'form' | 'success'>('check');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    displayName: '',
  });

  // Check if any users exist
  const checkExistingUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      if (!usersSnapshot.empty) {
        setError('Setup has already been completed. An admin user already exists.');
      } else {
        setStep('form');
      }
    } catch (err) {
      setError('Error checking database. Make sure Firestore is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the admin user document
      await setDoc(doc(db, 'users', formData.uid), {
        email: formData.email.toLowerCase(),
        displayName: formData.displayName,
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        inviteStatus: 'accepted',
      });

      setStep('success');
    } catch (err) {
      setError('Error creating admin user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'check') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-2xl text-on-surface mb-2">Initial Setup</h1>
          <p className="text-outline mb-6">
            This page will create the first admin user for the archive.
          </p>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          <button
            onClick={checkExistingUsers}
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-label font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Start Setup'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-8">
          <h1 className="font-headline text-2xl text-on-surface mb-2 text-center">Create Admin User</h1>
          <p className="text-outline mb-6 text-center text-sm">
            Enter your details. You'll need to sign in with Google or email after this.
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={createAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-label text-outline mb-1">
                Firebase Auth UID
              </label>
              <input
                type="text"
                value={formData.uid}
                onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                required
                placeholder="Get this from Firebase Console after first sign-in attempt"
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
                Email
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
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-label font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating...' : 'Create Admin User'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-outline-variant p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-headline text-2xl text-on-surface mb-2">Admin Created!</h1>
        <p className="text-outline mb-6">
          You can now go to the admin panel and sign in.
        </p>
        <a
          href="/admin"
          className="inline-block w-full py-3 bg-primary text-on-primary rounded-lg font-label font-bold hover:bg-primary/90 transition-colors"
        >
          Go to Admin Panel
        </a>
      </div>
    </div>
  );
}
