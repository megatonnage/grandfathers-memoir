'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is whitelisted and get their role
  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const profile = userDoc.data() as User;
      setUserProfile(profile);
      
      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: serverTimestamp(),
      });
      
      return profile;
    } else {
      // User not in whitelist - sign them out
      await signOut(auth);
      setUserProfile(null);
      throw new Error('You are not authorized to access this archive. Please request an invitation.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          await fetchUserProfile(user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await fetchUserProfile(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserProfile(result.user);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    // First check if there's a pending invite for this email
    const inviteQuery = await getDoc(doc(db, 'invites', email.toLowerCase()));
    
    if (!inviteQuery.exists()) {
      throw new Error('No invitation found for this email. Please request access.');
    }

    const invite = inviteQuery.data();
    if (invite.status !== 'pending') {
      throw new Error('This invitation has already been used or expired.');
    }

    // Create the user account
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(result.user, { displayName });
    
    // Create user document with role from invite
    const userData: Omit<User, 'id'> = {
      email: email.toLowerCase(),
      displayName,
      role: invite.role,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      invitedBy: invite.invitedBy,
      inviteStatus: 'accepted',
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userData);
    
    // Update invite status
    await updateDoc(doc(db, 'invites', email.toLowerCase()), {
      status: 'accepted',
    });
    
    setUserProfile({ id: result.user.uid, ...userData });
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!userProfile) return false;
    return roles.includes(userProfile.role);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    isModerator: userProfile?.role === 'moderator' || userProfile?.role === 'admin',
    isAuthenticated: !!currentUser && !!userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
