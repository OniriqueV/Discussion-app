"use client";
import React, { useRef, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface WYSIWYGEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  height = 400,
  onImageUpload
}) => {
  const editorRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = useCallback(async (blobInfo: any, progress: (percent: number) => void) => {
    if (!onImageUpload) {
      throw new Error('Image upload not configured');
    }

    return new Promise<string>(async (resolve, reject) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const next = prev + 10;
            progress(next);
            return next > 90 ? 90 : next;
          });
        }, 100);

        const file = blobInfo.blob();
        
        // Add some validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }

        if (!file.type.startsWith('image/')) {
          throw new Error('File must be an image');
        }

        const imageUrl = await onImageUpload(file);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        progress(100);
        
        // Small delay to show 100% progress
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          resolve(imageUrl);
        }, 500);

      } catch (error: any) {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Image upload error:', error);
        reject(error.message || 'Image upload failed');
      }
    });
  }, [onImageUpload]);

  const handleEditorChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <div className="w-full">
      <Editor
        apiKey="luh36jrn1sf3mji4n665lwvtir7tbw6us6ogb02hgajcq6tt"
        onInit={(_evt: any, editor: any) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'paste'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image link | code | help',
          content_style: `
            body { 
              font-family: Helvetica, Arial, sans-serif; 
              font-size: 14px;
              line-height: 1.5;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              margin: 8px 0;
            }
          `,
          placeholder: placeholder,
          images_upload_handler: handleImageUpload,
          images_upload_credentials: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          paste_data_images: true, // Allow pasting images
          images_upload_base_path: '',
          relative_urls: false,
          remove_script_host: false,
          convert_urls: true,
          branding: false,
          promotion: false,
          setup: (editor: any) => {
            editor.on('init', () => {
              console.log('TinyMCE editor initialized');
            });
            
            // Handle paste events for images
            editor.on('paste', (e: any) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file && onImageUpload) {
                      e.preventDefault();
                      handleImageUpload({ blob: () => file }, () => {})
                        .then((url) => {
                          editor.insertContent(`<img src="${url}" alt="Pasted image" />`);
                        })
                        .catch((error) => {
                          console.error('Paste image upload failed:', error);
                        });
                    }
                  }
                }
              }
            });

            // Handle drag and drop images
            editor.on('drop', (e: any) => {
              const files = e.dataTransfer?.files;
              if (files?.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/') && onImageUpload) {
                  e.preventDefault();
                  handleImageUpload({ blob: () => file }, () => {})
                    .then((url) => {
                      editor.insertContent(`<img src="${url}" alt="Dropped image" />`);
                    })
                    .catch((error) => {
                      console.error('Drop image upload failed:', error);
                    });
                }
              }
            });
          },
          // Additional image handling options
          image_advtab: true,
          image_caption: true,
          image_description: false,
          image_dimensions: false,
          image_title: true,
          // Improve performance
          skin: 'oxide',
          content_css: 'default',
          cache_suffix: '?v=6.8.0'
        }}
      />
      
      {isUploading && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              Đang tải ảnh lên...
            </span>
            <span className="text-sm text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WYSIWYGEditor;