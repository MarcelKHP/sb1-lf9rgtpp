import React from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FileUploadProps {
  requestId: string;
}

export function FileUpload({ requestId }: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Array<{ id: string; name: string; url: string }>>([]);

  React.useEffect(() => {
    fetchAttachments();
  }, []);

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('change_request_id', requestId);

    if (!error && data) {
      setAttachments(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${requestId}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Create attachment record
        const { error: dbError } = await supabase
          .from('attachments')
          .insert({
            change_request_id: requestId,
            name: file.name,
            url: publicUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;
      }

      setFiles([]);
      fetchAttachments();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAttachments(attachments.filter(att => att.id !== id));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Error deleting attachment');
    }
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4"
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label className="cursor-pointer text-blue-600 hover:text-blue-500">
              <span>Upload files</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
            </label>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT, PNG, JPG up to 10MB</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected Files:</div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Attached Files:</div>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">{attachment.name}</span>
                </a>
                <button
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}