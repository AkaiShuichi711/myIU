import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image } from 'lucide-react';

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl?: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl || '');
  const [file, setFile] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile([]);
    setFileUrl('');
    fieldChange([]);
  };

  if (fileUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group cursor-pointer"
        {...getRootProps()}>
        <input {...getInputProps()} />
        <img
          src={fileUrl}
          alt="Upload preview"
          className="w-full object-cover"
          style={{ maxHeight: '400px', minHeight: '200px' }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <span className="text-white text-sm font-medium flex items-center gap-1.5">
            <UploadCloud size={16} /> Replace image
          </span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 shadow transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-16 px-8 text-center
        ${isDragActive
          ? 'border-[#1e51f9] bg-[#1e51f9]/5'
          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
        }`}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
        {isDragActive ? (
          <UploadCloud size={28} className="text-[#1e51f9]" />
        ) : (
          <Image size={28} className="text-slate-400" />
        )}
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-1">
        {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
      </p>
      <p className="text-xs text-slate-400 mb-4">or click to browse files</p>
      <span className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
        PNG, JPG, GIF, WEBP · Max 10MB
      </span>
    </div>
  );
};

export default FileUploader;
