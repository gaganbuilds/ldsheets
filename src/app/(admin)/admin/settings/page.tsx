'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/firebase/settings';
import { Settings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    easyXP: 10,
    mediumXP: 20,
    hardXP: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (settings.easyXP < 0 || settings.mediumXP < 0 || settings.hardXP < 0) {
      toast.error('XP values cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground">Manage platform-wide configuration.</p>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Experience Points (XP)</CardTitle>
            <CardDescription>
              Configure how much XP is awarded for solving problems of different difficulties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Easy Problem XP</label>
              <Input 
                type="number"
                min="0"
                value={settings.easyXP} 
                onChange={e => setSettings({...settings, easyXP: Number(e.target.value)})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medium Problem XP</label>
              <Input 
                type="number"
                min="0"
                value={settings.mediumXP} 
                onChange={e => setSettings({...settings, mediumXP: Number(e.target.value)})}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hard Problem XP</label>
              <Input 
                type="number"
                min="0"
                value={settings.hardXP} 
                onChange={e => setSettings({...settings, hardXP: Number(e.target.value)})}
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
