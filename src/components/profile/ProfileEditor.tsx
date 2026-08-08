"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateProfile, checkUsernameAvailable } from '@/lib/firebase/profile';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';

export function ProfileEditor() {
  const { profile, reloadProfile } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isPublic, setIsPublic] = useState(profile?.isPublicProfile || false);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleUsernameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setUsernameError('');
    setUsernameAvailable(false);
    setSaveMessage(null);
  };

  const verifyUsername = async () => {
    if (!username || username === profile?.username) return;
    if (username.length < 3) {
      setUsernameError("Must be at least 3 characters");
      return;
    }
    
    setIsCheckingUsername(true);
    setUsernameError('');
    try {
      const available = await checkUsernameAvailable(username);
      if (available) {
        setUsernameAvailable(true);
      } else {
        setUsernameError("Username is taken");
      }
    } catch (err: any) {
      setUsernameError(err.message || "Error checking username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    
    // Validate requirement for public profile
    if (isPublic && !username && !profile.username) {
      setSaveMessage({ type: 'error', text: 'A username is required to enable public profile.'});
      setIsPublic(false);
      return;
    }
    
    if (username && username !== profile.username && !usernameAvailable) {
      setSaveMessage({ type: 'error', text: 'Please verify your new username first.'});
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const updates = {
        name,
        username,
        bio,
        isPublicProfile: isPublic
      };
      
      await updateProfile(profile.uid, updates, profile.username);
      await reloadProfile();
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!'});
      setUsernameAvailable(false);
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save profile'});
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Manage your personal information and public visibility.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="flex justify-center sm:justify-start">
          <ProfilePhotoUploader />
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => handleUsernameChange(e.target.value)} 
                placeholder="your_username"
              />
              {username !== profile?.username && (
                <Button variant="secondary" onClick={verifyUsername} disabled={isCheckingUsername || !username}>
                  {isCheckingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              )}
            </div>
            {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
            {usernameAvailable && username !== profile?.username && <p className="text-sm text-green-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Available</p>}
            <p className="text-xs text-muted-foreground">Used for your public profile URL. Lowercase, letters, numbers, and underscores only.</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell us a little bit about yourself"
              className="resize-none h-24"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length} / 160</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Allow anyone with your link to see your achievements and progress.
            </p>
          </div>
          <Switch 
            checked={isPublic} 
            onCheckedChange={(checked: boolean) => {
              if (checked && !username && !profile?.username) {
                setSaveMessage({ type: 'error', text: 'You must set a username to make your profile public.'});
                return;
              }
              setIsPublic(checked);
            }} 
          />
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
          
          {saveMessage && (
            <p className={`text-sm flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
              {saveMessage.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
