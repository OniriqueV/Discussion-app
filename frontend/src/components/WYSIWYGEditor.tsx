"use client";
import React, { useRef, useState } from 'react';
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

  const handleImageUpload = async (blobInfo: any, progress: any, failure: any) => {
    if (!onImageUpload) {
      failure('Image upload not configured');
      return;
    }

    try {
      setIsUploading(true);
      const file = blobInfo.blob();
      const imageUrl = await onImageUpload(file);
      setIsUploading(false);
      return imageUrl;
    } catch (error) {
      setIsUploading(false);
      failure('Image upload failed');
    }
  };

  return (
    <div className="w-full">
      <Editor
        apiKey="luh36jrn1sf3mji4n665lwvtir7tbw6us6ogb02hgajcq6tt" 
        onInit={(_evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={onChange}
        init={{
          // readonly: false, // Removed as it is not assignable
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          images_upload_handler: handleImageUpload,
          images_upload_credentials: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          images_upload_base_path: '/uploads/temp',
          setup: (editor: any) => {
            editor.on('init', () => {
              if (isUploading) {
                editor.setProgressState(true);
              }
            });
          }
        }}
      />
      {isUploading && (
        <div className="mt-2 text-sm text-blue-600">
          Đang tải ảnh lên...
        </div>
      )}
    </div>
  );
};

export default WYSIWYGEditor; 