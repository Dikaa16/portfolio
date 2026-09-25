import React, { useState, useRef } from 'react';
import { api, authHeaders, actionErrorMessage } from '../../lib/api';

// Image URL field with Cloudinary upload by button or drag & drop
function ImageUpload({ value, onChange, folder, label = 'Image URL' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const response = await api.post(`/upload?folder=${encodeURIComponent(folder)}`, body, authHeaders());
      onChange(response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${actionErrorMessage(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) upload(file);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="upload-row">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload below"
        />
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : '📁 Upload'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => upload(e.target.files[0])}
        hidden
      />

      <div
        className={`drop-zone ${dragOver ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? '⏳ Uploading to Cloudinary...' : 'Or drag & drop an image here'}
      </div>

      {value && (
        <img
          src={value}
          alt="Preview"
          className="upload-preview"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
    </div>
  );
}

export default ImageUpload;
