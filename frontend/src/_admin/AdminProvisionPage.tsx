import { useRef, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProvisionResult {
  createAttempted: number;
  createSucceeded: number;
  createSkipped: number;
  createLimitHit: boolean;
  deleteAttempted: number;
  deleteSucceeded: number;
  deleteSkipped: number;
  deleteLimitHit: boolean;
  created: string[];
  deactivated: string[];
  errors: string[];
}

const AdminProvisionPage = () => {
  const { token } = useAdminAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".xlsx")) setFile(dropped);
    else setError("Only .xlsx files are accepted");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.name.endsWith(".xlsx")) { setFile(selected); setError(null); }
    else setError("Only .xlsx files are accepted");
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/provision/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setResult(data as ProvisionResult);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template as a guide (Excel template would need a library)
    const csv = [
      "=== Sheet: Create ===",
      "email,name,role,ms_tenant_id",
      "student@iu.edu.vn,Nguyen Van A,student,",
      "lecturer@iu.edu.vn,Tran Thi B,lecturer,",
      "",
      "=== Sheet: Delete ===",
      "email",
      "old.user@iu.edu.vn",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "provision_template_reference.txt";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">User Provisioning</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload an Excel (.xlsx) file to add or remove users from the system.
          Only provisioned users can log in via Microsoft 365.
        </p>
      </div>

      {/* Format instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2">
        <p className="font-semibold flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Excel file format
        </p>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="font-medium mb-1">Sheet: <code className="bg-blue-100 px-1 rounded">Create</code></p>
            <p className="text-xs text-blue-700">Columns: <code>email</code> (required), <code>name</code>, <code>role</code> (student/lecturer), <code>ms_tenant_id</code></p>
          </div>
          <div>
            <p className="font-medium mb-1">Sheet: <code className="bg-blue-100 px-1 rounded">Delete</code></p>
            <p className="text-xs text-blue-700">Columns: <code>email</code> (required). Deactivates the user.</p>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          ⚠ An email can only appear in ONE sheet per upload. First row must be the header row.
        </p>
        <button onClick={downloadTemplate} className="flex items-center gap-1 text-xs text-blue-700 hover:underline mt-1">
          <Download className="h-3 w-3" /> Download format reference
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-[#323393] bg-blue-50" : "border-gray-300 hover:border-[#4040aa] hover:bg-gray-50"
        }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-800 flex items-center justify-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Drag & drop your .xlsx file here, or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Maximum 20 MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className="bg-[#0A1128] hover:bg-[#111827] text-white px-6"
      >
        {isLoading ? "Processing…" : "Upload & Process"}
      </Button>

      {/* Result summary */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" /> Provisioning complete
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Create summary */}
            <div className="bg-green-50 rounded-lg p-3">
              <p className="font-medium text-green-800 mb-1">Created / Activated</p>
              <p className="text-2xl font-bold text-green-700">{result.createSucceeded}</p>
              <p className="text-xs text-green-600 mt-1">
                {result.createSkipped} already existed · {result.createAttempted} attempted
                {result.createLimitHit && " · ⚠ limit hit"}
              </p>
            </div>
            {/* Delete summary */}
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="font-medium text-orange-800 mb-1">Deactivated</p>
              <p className="text-2xl font-bold text-orange-700">{result.deleteSucceeded}</p>
              <p className="text-xs text-orange-600 mt-1">
                {result.deleteSkipped} not found · {result.deleteAttempted} attempted
                {result.deleteLimitHit && " · ⚠ limit hit"}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 flex items-center gap-1 mb-2">
                <AlertTriangle className="h-4 w-4" /> {result.errors.length} error(s)
              </p>
              <ul className="text-xs text-red-700 space-y-0.5 max-h-32 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {result.created.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                View {result.created.length} created user(s)
              </summary>
              <ul className="mt-2 text-xs text-gray-600 space-y-0.5 max-h-40 overflow-y-auto pl-2">
                {result.created.map(e => <li key={e}>✓ {e}</li>)}
              </ul>
            </details>
          )}

          {result.deactivated.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                View {result.deactivated.length} deactivated user(s)
              </summary>
              <ul className="mt-2 text-xs text-gray-600 space-y-0.5 max-h-40 overflow-y-auto pl-2">
                {result.deactivated.map(e => <li key={e}>✗ {e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProvisionPage;
