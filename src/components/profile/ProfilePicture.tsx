import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Camera } from 'lucide-react';

export function ProfilePicture() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Load signed URL for avatar on mount
  useEffect(() => {
    const loadAvatarUrl = async () => {
      if (user?.user_metadata?.avatar_path) {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(user.user_metadata.avatar_path, 86400); // 24 hours
        
        if (!error && data?.signedUrl) {
          setAvatarUrl(data.signedUrl);
        }
      }
    };
    loadAvatarUrl();
  }, [user]);

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image (JPG, PNG, WEBP, etc.)');
      return;
    }

    setLoading(true);
    try {
      // Delete old avatar if exists
      if (avatarUrl && avatarUrl.includes('avatars')) {
        const urlParts = avatarUrl.split('/avatars/');
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1].split('?')[0]; // Remove query params
          await supabase.storage.from('avatars').remove([oldFilePath]);
        }
      }

      // Upload to Supabase storage with user ID folder structure for RLS policies
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Generate signed URL (expires in 24 hours for avatars)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(fileName, 86400); // 24 hours

      if (signedError) throw signedError;

      // Update user metadata with file path (not signed URL)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_path: fileName }
      });

      if (updateError) throw updateError;

      setAvatarUrl(signedData.signedUrl);
      
      // Force refresh the page to update avatar everywhere
      window.location.reload();
      
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return;

    setLoading(true);
    try {
      // Delete from storage if it's a Supabase URL
      if (avatarUrl.includes('avatars')) {
        const urlParts = avatarUrl.split('/avatars/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0]; // Remove query params
          await supabase.storage.from('avatars').remove([filePath]);
        }
      }

      // Update user metadata to remove avatar path
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_path: null }
      });

      if (updateError) throw updateError;

      setAvatarUrl('');
      toast.success('Profile picture removed successfully');
      
      // Force refresh to update UI
      window.location.reload();
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className="w-32 h-32 ring-4 ring-primary/20 transition-all">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Camera className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WEBP (max 5MB)
            </p>
          </div>
          
          <div className="flex gap-2 justify-center flex-wrap">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="glass-button"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </motion.div>
            
            {avatarUrl && (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={handleRemoveAvatar}
                  className="glass-button text-destructive hover:text-destructive"
                >
                  Remove Photo
                </Button>
              </motion.div>
            )}
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
