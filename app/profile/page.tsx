'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase, SocialPlatform, UserInterest } from '@/lib/supabase';
import { LettuceVisualization } from '@/components/lettuce/LettuceVisualization';
import { LoadingLettuce } from '@/components/ui/loading-lettuce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Leaf, ArrowLeft, Plus, Trash2, Tag, X, Upload, User as UserIcon2 } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'github', label: 'GitHub' },
  { value: 'youtube', label: 'YouTube' },
];

const SUGGESTED_INTERESTS = [
  'Photography',
  'Hiking',
  'Coding',
  'Gaming',
  'Music',
  'Travel',
  'Reading',
  'Fitness',
  'Art',
  'Cooking',
  'Design',
  'Entrepreneurship',
  'Investing',
  'Writing',
  'Yoga',
  'Coffee',
  'Movies',
  'Sports',
  'Tech',
  'Fashion',
];

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [socials, setSocials] = useState<SocialPlatform[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [addingInterest, setAddingInterest] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadSocials();
      loadInterests();
    }
  }, [user, loading]);

  const loadSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setSocials(data || []);
    } catch (error) {
      console.error('Error loading socials:', error);
    }
  };

  const loadInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', user!.id)
        .order('interest', { ascending: true });

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const handleAddInterest = async (e?: React.FormEvent, customInterest?: string) => {
    e?.preventDefault();
    const interestToAdd = customInterest || newInterest;
    if (!user || !interestToAdd.trim()) return;

    setAddingInterest(true);

    try {
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          interest: interestToAdd.trim().toLowerCase(),
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You already have this interest');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Interest added!');
      setNewInterest('');
      loadInterests();
    } catch (error: any) {
      console.error('Error adding interest:', error);
      toast.error(error.message || 'Failed to add interest');
    } finally {
      setAddingInterest(false);
    }
  };

  const handleQuickAddInterest = (interest: string) => {
    handleAddInterest(undefined, interest);
  };

  const handleDeleteInterest = async (interestId: string) => {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', interestId);

      if (error) throw error;

      toast.success('Interest removed');
      loadInterests();
    } catch (error) {
      console.error('Error deleting interest:', error);
      toast.error('Failed to remove interest');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: base64 })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast.success('Profile image updated!');
        window.location.reload();
      };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile image removed');
      window.location.reload();
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setAdding(true);

    try {
      const { error } = await supabase
        .from('social_platforms')
        .insert({
          user_id: user.id,
          platform,
          username,
          profile_url: profileUrl,
        });

      if (error) throw error;

      toast.success('Social added successfully!');
      setAddModalOpen(false);
      setPlatform('');
      setUsername('');
      setProfileUrl('');
      loadSocials();
    } catch (error: any) {
      console.error('Error adding social:', error);
      toast.error(error.message || 'Failed to add social');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSocial = async (socialId: string) => {
    try {
      const { error } = await supabase
        .from('social_platforms')
        .delete()
        .eq('id', socialId);

      if (error) throw error;

      toast.success('Social removed');
      loadSocials();
    } catch (error) {
      console.error('Error deleting social:', error);
      toast.error('Failed to remove social');
    }
  };

  const handleToggleSocial = async (socialId: string) => {
    const social = socials.find(s => s.id === socialId);
    if (!social) return;

    try {
      const { error } = await supabase
        .from('social_platforms')
        .update({ is_visible: !social.is_visible })
        .eq('id', socialId);

      if (error) throw error;

      setSocials(socials.map(s =>
        s.id === socialId ? { ...s, is_visible: !s.is_visible } : s
      ));

      toast.success(social.is_visible ? 'Social hidden by default' : 'Social visible by default');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingLettuce size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LettuceConnect</span>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </nav>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Profile</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name} />
                      <AvatarFallback className="text-2xl">
                        {profile?.display_name?.charAt(0).toUpperCase() || <UserIcon2 className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload'}
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      {profile?.avatar_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Display Name</Label>
                  <p className="text-lg font-medium mt-1">{profile?.display_name || 'Not set'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-lg font-medium mt-1">{user.email || profile?.email || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Lettuce</CardTitle>
                <CardDescription>Preview how others see your profile</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                {socials.length > 0 ? (
                  <LettuceVisualization
                    socials={socials}
                    onToggleSocial={handleToggleSocial}
                    size="medium"
                    profileImage={profile?.avatar_url}
                    displayName={profile?.display_name}
                    showAsLeaves={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name} />
                      <AvatarFallback className="text-4xl">
                        {profile?.display_name?.charAt(0).toUpperCase() || <UserIcon2 className="w-12 h-12" />}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground">No socials yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Connected Socials</CardTitle>
                  <CardDescription>Manage your social media profiles</CardDescription>
                </div>
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {socials.length > 0 ? (
                <div className="space-y-3">
                  {socials.map((social) => (
                    <div
                      key={social.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{social.platform}</p>
                        <p className="text-sm text-muted-foreground">@{social.username}</p>
                        <p className="text-xs text-muted-foreground mt-1">{social.profile_url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={social.is_visible ? 'default' : 'outline'}
                          onClick={() => handleToggleSocial(social.id)}
                        >
                          {social.is_visible ? 'Visible' : 'Hidden'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSocial(social.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No social profiles added yet</p>
                  <Button onClick={() => setAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Social
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Interests</CardTitle>
                  <CardDescription>Add interests to connect with like-minded people</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInterest} className="flex gap-2 mb-4">
                <Input
                  placeholder="e.g., photography, hiking, coding"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  disabled={addingInterest}
                />
                <Button type="submit" disabled={addingInterest || !newInterest.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </form>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Quick add suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_INTERESTS.filter(
                    (suggested) =>
                      !interests.some((i) => i.interest === suggested.toLowerCase())
                  ).map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="text-xs px-2 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleQuickAddInterest(interest)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {interests.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2">Your interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest.id}
                        variant="secondary"
                        className="text-sm px-3 py-1.5 flex items-center gap-2"
                      >
                        <Tag className="w-3 h-3" />
                        {interest.interest}
                        <button
                          onClick={() => handleDeleteInterest(interest.id)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No interests added yet. Click a suggestion or type your own!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Social Profile</DialogTitle>
            <DialogDescription>
              Connect a social media profile to share at events
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSocial} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileUrl">Profile URL</Label>
              <Input
                id="profileUrl"
                type="url"
                placeholder="https://platform.com/yourusername"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={adding}>
              {adding ? 'Adding...' : 'Add Social'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
