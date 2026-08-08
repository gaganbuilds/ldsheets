"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeProfilePhoto } from '@/lib/firebase/profile';
import { useAuth } from '@/hooks/useAuth';

export function ProfilePhotoUploader() {
  const { profile, reloadProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleRemove = async () => {
    if (!profile?.uid || !profile.photoURL) return;
    try {
      setIsUpdating(true);
      await removeProfilePhoto(profile.uid);
      await reloadProfile();
    } catch (err: any) {
      setError(err.message || "Failed to remove photo");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group rounded-full overflow-hidden w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 border-4 border-background flex items-center justify-center text-primary font-bold text-3xl sm:text-4xl shadow-sm">
        {profile?.photoURL ? (
          <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(profile?.name)}</span>
        )}
      </div>
      
      {error && <p className="text-xs text-red-500">{error}</p>}
      
      {profile?.photoURL && (
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={isUpdating} className="text-muted-foreground">
          Remove Custom Photo
        </Button>
      )}
      {!profile?.photoURL && (
        <p className="text-xs text-muted-foreground">Profile photo upload will be available later</p>
      )}
    </div>
  );
}
