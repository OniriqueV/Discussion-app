// WYSIWYGEditor.tsx - Simplified and optimized
import React, { useCallback, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { uploadSingleImage } from '../api/postApi';

interface WYSIWYGEditorProps {
  value: string;
  onChange: (content: string) => void;
  postId?: number;
  placeholder?: string;
  height?: number;
  onImageUpload?: (blobInfo: any, progress: (percent: number) => void) => Promise<string>;
}

export default function WYSIWYGEditor({
  value,
  onChange,
  postId,
  placeholder = "Nhập nội dung bài viết...",
  height = 400
}: WYSIWYGEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Simplified image upload handler
  const handleImageUpload = useCallback(async (blobInfo: any, progress: (percent: number) => void) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const next = prev + 10;
            progress(next);
            return next > 90 ? 90 : next;
          });
        }, 100);

        const file = blobInfo.blob();
        
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        
        if (!file.type.startsWith('image/')) {
          throw new Error('File must be an image');
        }

        // Upload image
        const imageUrl = await uploadSingleImage(file, postId);

        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        progress(100);

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          resolve(imageUrl);
        }, 300);

      } catch (error: any) {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Image upload error:', error);
        reject(error.message || 'Image upload failed');
      }
    });
  }, [postId]);

  const editorConfig = {
    height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
    ],
    toolbar: [
      'undo redo | blocks | bold italic forecolor | alignleft aligncenter',
      'alignright alignjustify | bullist numlist outdent indent |',
      'removeformat | image link | code preview | help'
    ].join(' '),
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
      }
      img { max-width: 100%; height: auto; }
    `,
    placeholder,
    images_upload_handler: handleImageUpload,
    automatic_uploads: true,
    file_picker_types: 'image',
    image_advtab: true,
    image_caption: true,
    image_title: true,
    paste_data_images: true,
    setup: (editor: any) => {
      // Custom paste handler for images
      editor.on('paste', (e: any) => {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                // TinyMCE will handle this automatically via images_upload_handler
                e.preventDefault();
                const blobInfo = editor.editorUpload.blobCache.create(
                  Date.now().toString(),
                  file
                );
                editor.editorUpload.blobCache.add(blobInfo);
                editor.editorUpload.uploadImages().then(() => {
                  editor.insertContent(`<img src="${blobInfo.blobUri()}" />`);
                });
              }
            }
          }
        }
      });
    }
  };

  return (
    <div className="relative">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY|| 'luh36jrn1sf3mji4n665lwvtir7tbw6us6ogb02hgajcq6tt'}
        value={value}
        onEditorChange={onChange}
        init={editorConfig}
      />
      
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm">
          Uploading... {uploadProgress}%
        </div>
      )}
    </div>
  );
}