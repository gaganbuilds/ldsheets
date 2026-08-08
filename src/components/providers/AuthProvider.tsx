'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile, createUserProfileDocument } from '@/lib/firebase/users';
import { ensurePublicProfileSync } from '@/lib/firebase/profile';
import { UserProfile, AuthProvider as CustomAuthProvider } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  reloadProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let userProfile = await getUserProfile(firebaseUser.uid);
          
          // Auto-create missing profile (e.g. from prior google sign ins)
          if (!userProfile) {
            const isGoogle = firebaseUser.providerData.some(p => p.providerId === 'google.com');
            const provider: CustomAuthProvider = isGoogle ? 'google' : 'email';
            userProfile = await createUserProfileDocument(firebaseUser, provider);
          }
          
          if (userProfile && userProfile.isPublicProfile) {
            // Client-side migration sync
            ensurePublicProfileSync(userProfile).catch(console.error);
          }
          
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching user profile in auth provider', error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reloadProfile = async () => {
    if (user) {
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error reloading profile', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
