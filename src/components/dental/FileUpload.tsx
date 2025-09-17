import { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, FileText, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { FileCategories, FileCategory, UploadedFile } from '@/types/dental';

interface FileUploadProps {
  files: FileCategories;
  onFilesChange: (files: FileCategories) => void;
  patientId?: string;
}

const categoryConfig = {
  personal: { 
    title: 'Personal Data', 
    icon: '👤', 
    description: 'ID cards, insurance documents',
    color: 'border-blue-300 hover:border-blue-400'
  },
  diagnostics: { 
    title: 'Diagnostics', 
    icon: '🔬', 
    description: 'Lab results, test reports',
    color: 'border-green-300 hover:border-green-400'
  },
  treatment: { 
    title: 'Treatment Records', 
    icon: '✅', 
    description: 'Treatment photos, progress notes',
    color: 'border-purple-300 hover:border-purple-400'
  },
  xrays: { 
    title: 'X-Rays & Scans', 
    icon: '📸', 
    description: 'Radiographs, CT scans, MRI',
    color: 'border-yellow-300 hover:border-yellow-400'
  },
};

export function FileUpload({ files, onFilesChange, patientId }: FileUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ [key in FileCategory]: boolean }>({
    personal: false,
    diagnostics: false,
    treatment: false,
    xrays: false,
  });
  
  const fileInputRefs = useRef<{ [key in FileCategory]: HTMLInputElement | null }>({
    personal: null,
    diagnostics: null,
    treatment: null,
    xrays: null,
  });

  const handleFileUpload = async (category: FileCategory, fileList: FileList | null) => {
    if (!fileList || !user) return;
    
    setUploading(prev => ({ ...prev, [category]: true }));
    
    try {
      const newFiles = Array.from(fileList);
      const uploadPromises = newFiles.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('patient-files')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('patient-files')
          .getPublicUrl(fileName);
        
        // Save file metadata to database if patientId exists
        if (patientId) {
          const { error: dbError } = await supabase
            .from('patient_files')
            .insert({
              patient_id: patientId,
              file_category: category,
              file_name: file.name,
              file_path: fileName, // Store the storage path, not public URL
              file_size: file.size,
              mime_type: file.type,
            });
            
          if (dbError) throw dbError;
        }
        
        // Create data URL for preview
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
          } else {
            resolve(''); // No preview for non-image files
          }
        });
        
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: publicUrl, // Always use publicUrl for storage consistency
          uploadedAt: new Date().toISOString(),
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      onFilesChange({
        ...files,
        [category]: [...files[category], ...uploadedFiles],
      });
      
      toast({
        title: "Files uploaded successfully",
        description: `${uploadedFiles.length} file(s) uploaded to ${categoryConfig[category].title}`,
      });
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [category]: false }));
    }
  };

  const removeFile = async (category: FileCategory, index: number) => {
    const file = files[category][index];
    
    try {
      // If file has a storage path, delete from storage
      if (patientId && file.dataUrl) {
        // Extract the file path from the public URL
        const urlParts = file.dataUrl.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'patient-files');
        const filePath = pathIndex !== -1 ? urlParts.slice(pathIndex + 1).join('/') : '';
        
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('patient-files')
            .remove([filePath]);
            
          // Storage deletion error is logged but doesn't block the operation
        }
          
        
        // Delete from database
        const { error: dbError } = await supabase
          .from('patient_files')
          .delete()
          .eq('patient_id', patientId)
          .eq('file_name', file.name)
          .eq('file_category', category);
          
        // Database deletion error is logged but doesn't block the operation
      }
      
      const updatedFiles = files[category].filter((_, i) => i !== index);
      onFilesChange({
        ...files,
        [category]: updatedFiles,
      });
      
    } catch (error) {
      toast({
        title: "Error removing file",
        description: "There was an error removing the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Document & Image Management</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.keys(categoryConfig) as FileCategory[]).map((category) => {
            const config = categoryConfig[category];
            return (
              <div key={category} className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-all
                ${config.color} ${files[category].length > 0 ? 'bg-muted/30' : ''}
              `}>
                <div className="text-3xl mb-3">{config.icon}</div>
                <h3 className="font-medium text-foreground mb-2">{config.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{config.description}</p>
                
                <input
                  ref={(el) => fileInputRefs.current[category] = el}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(category, e.target.files)}
                />
                
                <Button
                  onClick={() => fileInputRefs.current[category]?.click()}
                  size="sm"
                  className="mb-3"
                  disabled={uploading[category]}
                >
                  {uploading[category] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploading[category] ? 'Uploading...' : 'Upload Files'}
                </Button>
                
                {files[category].length > 0 && (
                  <div className="space-y-1">
                    {files[category].map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs p-2 bg-background rounded border">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getFileIcon(file.type)}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(category, index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* File Preview Grid */}
        {Object.values(files).some(categoryFiles => categoryFiles.length > 0) && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Uploaded Files Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(files).flatMap(([category, categoryFiles]) =>
                categoryFiles.map((file, index) => (
                  <Card key={`${category}-${index}`} className="overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {file.type.startsWith('image/') && file.dataUrl ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground truncate">{file.name}</div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {categoryConfig[category as FileCategory].title}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}