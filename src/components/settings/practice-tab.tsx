'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePracticeSettings } from '@/features/settings/actions';
import { toast } from 'sonner';
import { Building2, Upload, Link as LinkIcon, X } from 'lucide-react';
import { Site, SiteSettings } from '@/db/schema';

export function PracticeTab({ site, settings }: { site: Site; settings: SiteSettings }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: site.name,
    slug: site.slug,
    timezone: site.timezone,
    phone: site.phone || '',
    email: site.email || '',
    address: site.address || '',
    website: site.website || '',
    review_link: settings.review_link || '',
    logo_url: site.logo_url || '',
  });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpdate = async (newLogoUrl: string) => {
    setFormData(prev => ({ ...prev, logo_url: newLogoUrl }));
    try {
      const res = await updatePracticeSettings(site.id, { ...formData, logo_url: newLogoUrl });
      if (res.success) {
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        await handleLogoUpdate(result);
        toast.success('Logo uploaded and updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updatePracticeSettings(site.id, formData);
      if (res.success) {
        toast.success('Practice settings updated successfully.');
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        toast.error('Failed to update practice settings.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Practice Profile
          </CardTitle>
          <CardDescription>Update your clinic information and review link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Practice Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_link">Review Link (Google Maps / Yelp)</Label>
            <Input id="review_link" placeholder="https://g.page/r/..." value={formData.review_link} onChange={(e) => setFormData({ ...formData, review_link: e.target.value })} />
          </div>

          <div className="space-y-3">
            <Label>Practice Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground overflow-hidden relative group">
                {formData.logo_url ? (
                  <>
                    <img src={formData.logo_url} alt="Logo" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={async () => {
                        await handleLogoUpdate('');
                        toast.success('Logo removed successfully');
                      }}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Remove logo"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" /> Upload Image File
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> {showUrlInput ? 'Hide URL input' : 'Or use Image URL'}
                  </Button>
                </div>
                {showUrlInput && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={formData.logo_url.startsWith('data:') ? '' : formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Recommended: Square PNG, JPG or SVG, max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
