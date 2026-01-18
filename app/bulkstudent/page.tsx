"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface UploadResult {
  createdCount?: number;
  failedCount?: number;
  message?: string;
}

export default function BulkStudentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/student/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Upload failed");
        return;
      }

      setResult({
        createdCount: data.createdCount || 0,
        failedCount: data.failedCount || 0,
      });

      // Reset file after successful upload
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("excel-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#808080] mb-2">
          Select Excel File (.xlsx, .xls)
        </label>
        <div className="relative">
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              setError(null);
              setResult(null);
            }}
            className="hidden"
          />
          <label
            htmlFor="excel-file-input"
            className="flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-[#404040] hover:border-[#808080] rounded-xl p-6 transition-all duration-200 bg-[#1a1a1a] hover:bg-[#2d2d2d]"
          >
            {file ? (
              <div className="flex items-center gap-3 text-white">
                <FileSpreadsheet className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-[#808080]">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#808080]">
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-medium text-white">Click to upload</p>
                  <p className="text-xs">or drag and drop</p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Upload Button */}
      <motion.button
        onClick={upload}
        disabled={loading || !file}
        whileHover={{ scale: file && !loading ? 1.02 : 1 }}
        whileTap={{ scale: file && !loading ? 0.98 : 1 }}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
          file && !loading
            ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white shadow-lg border border-[#808080] hover:border-white"
            : "bg-[#2d2d2d] text-[#6b6b6b] border border-[#333333] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Upload Excel File</span>
          </>
        )}
      </motion.button>

      {/* Success Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Upload Complete!</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-[#808080] mb-1">Successfully Created</p>
              <p className="text-lg font-bold text-green-400">
                {result.createdCount || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#808080] mb-1">Failed</p>
              <p className={`text-lg font-bold ${result.failedCount ? "text-yellow-400" : "text-[#808080]"}`}>
                {result.failedCount || 0}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400"
        >
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Info Note */}
      <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-3 mt-4">
        <p className="text-xs text-[#808080] leading-relaxed">
          <strong className="text-white">Note:</strong> Ensure your Excel file contains columns for: name, fatherName, email, phoneNo, aadhaarNo, dob, address, totalFee, and discountPercent. The default password will be set as the student's date of birth (YYYYMMDD format).
        </p>
      </div>
    </div>
  );
}
