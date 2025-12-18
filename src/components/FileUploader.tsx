import React, { useState } from 'react';
import apiService from '../services/api';

type UploadedFile = {
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string | null;
};

export default function FileUploader({ onUploaded }: { onUploaded?: (files: UploadedFile[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  }

  async function handleUpload() {
    if (!files.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      const axios = apiService.getApiInstance();
      const res = await axios.post('/files/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const uploaded: UploadedFile[] = res.data?.data?.files || [];
      onUploaded?.(uploaded);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="file" multiple onChange={handleSelect} />
      <div className="flex gap-2 flex-wrap">
        {previews.map((src, idx) => (
          <img key={idx} src={src} alt="preview" className="w-24 h-24 object-cover rounded" />
        ))}
      </div>
      <button onClick={handleUpload} disabled={uploading || !files.length}>
        {uploading ? 'Enviando...' : 'Enviar arquivos'}
      </button>
    </div>
  );
}




