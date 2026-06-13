'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Camera, MapPin, Calendar, User, Phone, Tag, ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export default function PostFoundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form values state
  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics',
    description: '',
    location: '',
    date: '',
    personName: '',
    phone: '',
    imageUrl: '',
  });

  // Handle inputs change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload file to Cloudinary via API
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic type validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Image upload failed: ' + data.error);
      }
    } catch (error: any) {
      toast.error('Image upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.title.trim()) return toast.error('Item name is required');
    if (!formData.description.trim()) return toast.error('Description is required');
    if (!formData.location.trim()) return toast.error('Found location is required');
    if (!formData.date) return toast.error('Date found is required');
    if (!formData.personName.trim()) return toast.error('Finder name is required');
    if (!formData.phone.trim()) return toast.error('Phone number is required');
    if (!formData.imageUrl) return toast.error('Please upload an image of the item');

    setLoading(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'found',
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem(`item-token-${data.item._id}`, data.editToken);
        toast.success('Found item report posted successfully!');
        router.push(`/items/${data.item._id}`);
      } else {
        toast.error('Failed to post report: ' + data.error);
      }
    } catch (error: any) {
      toast.error('Error posting item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Report a Found Item</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Did you find something on campus? Fill out the details below so the owner can recognize and retrieve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {/* Item Details Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span>Item Name</span>
            </label>
            <Input
              type="text"
              name="title"
              placeholder="e.g. CASIO Scientific Calculator, Keychain with keys"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
              <Tag className="h-4 w-4 text-primary" />
              <span>Category</span>
            </label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="electronics">Electronics</option>
              <option value="wallet">Wallet</option>
              <option value="keys">Keys</option>
              <option value="id card">ID Card</option>
              <option value="books">Books</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </Select>
          </div>

          {/* Found Date */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Date Found</span>
            </label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* Found Location */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Found Location</span>
            </label>
            <Input
              type="text"
              name="location"
              placeholder="e.g. Block C Canteen, Basketball Court benches"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold mb-1.5 block text-foreground">
              Description
            </label>
            <Textarea
              name="description"
              rows={4}
              placeholder="Describe unique features, condition, or items found inside. (e.g. blue bottle with sticker)..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Finder Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Person Name */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Finder Name</span>
              </label>
              <Input
                type="text"
                name="personName"
                placeholder="e.g. Rahul Sharma"
                value={formData.personName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5 text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>Phone Number</span>
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="e.g. +1 987-654-3210"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="border-t border-border pt-6">
          <label className="text-sm font-semibold flex items-center gap-1.5 mb-2.5 text-foreground">
            <Camera className="h-4 w-4 text-primary" />
            <span>Upload Item Image</span>
          </label>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-background/50 hover:bg-background transition-colors">
            {formData.imageUrl ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg mb-4 object-contain"
                />
                <div className="flex justify-center gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading || loading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-bounce" />
                <p className="text-sm text-foreground font-semibold mb-1">Click to upload image</p>
                <p className="text-xs text-muted-foreground mb-4">PNG, JPG, JPEG up to 5MB</p>
                <label className="cursor-pointer">
                  <span className="bg-primary text-primary-foreground hover:bg-primary/90 shadow px-4 py-2 rounded-lg text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Select File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading || loading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-border pt-6 flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={loading || uploading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Posting Report...</span>
              </>
            ) : (
              <span>Submit Report</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
