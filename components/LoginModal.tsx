'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'reset';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-surface w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-outline-variant pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                <h2 className="font-headline text-xl text-on-surface">
                  {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join the Archive' : 'Reset Password'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-outline hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                {/* Success Message */}
                {message && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {message}
                  </div>
                )}

                {/* Google Sign In - hide on reset mode */}
                {mode !== 'reset' && (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5 text-primary" />
                    <span className="font-label text-sm">
                      {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                    </span>
                  </button>
                )}

                {/* Divider - hide on reset mode */}
                {mode !== 'reset' && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-outline-variant" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-surface text-xs text-outline font-label uppercase">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-label text-outline mb-1">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                          placeholder="Your name"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-label text-outline mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <label className="block text-sm font-label text-outline mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={mode !== 'reset'}
                          minLength={6}
                          className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-label font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading 
                      ? (mode === 'signin' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset email...')
                      : (mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email')
                    }
                  </button>
                </form>

                {/* Toggle Mode */}
                <div className="text-center space-y-2">
                  {mode === 'signin' ? (
                    <>
                      <p className="text-sm text-outline">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setMode('signup')}
                          className="text-primary hover:underline font-label"
                        >
                          Request access
                        </button>
                      </p>
                      <p className="text-sm text-outline">
                        Forgot password?{' '}
                        <button
                          onClick={() => setMode('reset')}
                          className="text-primary hover:underline font-label"
                        >
                          Reset it
                        </button>
                      </p>
                    </>
                  ) : mode === 'signup' ? (
                    <p className="text-sm text-outline">
                      Already have an account?{' '}
                      <button
                        onClick={() => setMode('signin')}
                        className="text-primary hover:underline font-label"
                      >
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-outline">
                      Remember your password?{' '}
                      <button
                        onClick={() => setMode('signin')}
                        className="text-primary hover:underline font-label"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
