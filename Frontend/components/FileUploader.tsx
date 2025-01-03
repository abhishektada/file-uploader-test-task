"use client";

import { useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import { apiService, ErrorResponse, eventEmitter } from "@/lib";

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface UploadResponse {
  id: string;
  original_filename: string;
  upload_date: string;
  download_url: string;
  share_url: string;
}

export const FileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum file size is ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB.`;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Unsupported file type. Allowed types: ${ALLOWED_FILE_TYPES.join(
        ", "
      )}.`;
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);

    if (!selectedFile) {
      setError("Please select a file to upload.");
      setIsUploading(false);
      return;
    }

    try {
      const response = await apiService.uploadFile(selectedFile);
      setUploadResponse(response);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Generate and emit the share URL
      const urlParts = response.share_url.split("/");
      const shareId = urlParts[urlParts.length - 2];
      const shareViewUrl = `/share/${shareId}`;
      const fullShareUrl = `${window.location.origin}${shareViewUrl}`;

      // Update the upload response with the generated URL
      setUploadResponse({
        ...response,
        share_url: fullShareUrl,
      });

      // Emit the event with the share URL
      eventEmitter.emit("fileUploaded", { shareUrl: fullShareUrl });

      // Show success message with the share URL
      toast.success("File uploaded successfully! Share URL is ready.");
    } catch (err) {
      const error = err as ErrorResponse;
      setError(
        error.message || "An unexpected error occurred during file upload."
      );
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const copyShareLink = () => {
    if (uploadResponse?.share_url) {
      navigator.clipboard.writeText(uploadResponse.share_url);
      toast.success("Share link copied to clipboard!");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">File Uploader</h2>
        <p className="text-gray-500 text-sm">
          Upload files up to {MAX_FILE_SIZE / (1024 * 1024)}MB
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative w-full">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            aria-label="File upload input"
            className="
              absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10
              file:hidden
            "
          />
          <div
            className={`
              w-full p-4 border-2 border-dashed rounded-lg text-center
              ${
                selectedFile
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-500 hover:bg-blue-50"
              }
              transition-all duration-300
            `}
          >
            <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            {selectedFile
              ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(
                  2
                )} KB)`
              : "Drag and drop or click to select a file"}
          </div>
          {selectedFile && (
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-20"
              aria-label="Clear selected file"
            >
              <IoMdClose className="h-6 w-6" />
            </button>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          aria-label="Upload file"
          className="
            w-full md:w-auto px-6 py-3 
            bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-all duration-300 flex items-center justify-center
          "
        >
          {isUploading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Upload"
          )}
        </button>
      </div>

      {error && (
        <div
          className="
            mt-4 p-3 bg-red-50 border border-red-200 
            text-red-700 rounded-lg flex items-center
            animate-pulse
          "
          role="alert"
        >
          <IoMdClose className="h-6 w-6 mr-2" />
          {error}
        </div>
      )}

      {uploadResponse && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 font-semibold">
              File Uploaded Successfully
            </p>
            <span className="text-sm text-gray-500">
              {new Date(uploadResponse.upload_date).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              readOnly
              value={uploadResponse.share_url}
              className="
                w-full p-2 border border-green-300 rounded-lg 
                bg-white text-gray-700 truncate
              "
            />
            <button
              onClick={copyShareLink}
              className="
                w-full md:w-auto px-4 py-2 
                bg-green-600 text-white rounded-lg 
                hover:bg-green-700 flex items-center justify-center
                transition-all duration-300
              "
            >
              <MdContentCopy className="h-5 w-5 mr-2" />
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
