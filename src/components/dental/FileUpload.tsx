import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, FileText, X } from 'lucide-react';
import type { FileCategories, FileCategory, UploadedFile } from '@/types/dental';

interface FileUploadProps {
  files: FileCategories;
  onFilesChange: (files: FileCategories) => void;
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

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const fileInputRefs = useRef<{ [key in FileCategory]: HTMLInputElement | null }>({
    personal: null,
    diagnostics: null,
    treatment: null,
    xrays: null,
  });

  const handleFileUpload = (category: FileCategory, fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const promises = newFiles.map((file) => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string || '',
          });
        };
        
        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          // For non-image files, store a placeholder
          reader.readAsDataURL(new Blob(['']));
        }
      });
    });

    Promise.all(promises).then((uploadedFiles) => {
      onFilesChange({
        ...files,
        [category]: [...files[category], ...uploadedFiles],
      });
    });
  };

  const removeFile = (category: FileCategory, index: number) => {
    const updatedFiles = files[category].filter((_, i) => i !== index);
    onFilesChange({
      ...files,
      [category]: updatedFiles,
    });
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
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
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