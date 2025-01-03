"use client";

import { useEffect, useState } from "react";
import { MdDownload, MdContentCopy } from "react-icons/md";
import { toast } from "react-hot-toast";
import { apiService, FileResponse } from "@/lib";

interface ShareViewProps {
  shareId: string;
}

type FileType = "image" | "text" | "other";

export const ShareView: React.FC<ShareViewProps> = ({ shareId }) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileData, setFileData] = useState<FileResponse | null>(null);
  const [fileType, setFileType] = useState<FileType>("other");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");

  const determineFileType = (
    filename: string,
    contentType: string
  ): FileType => {
    if (contentType.startsWith("image/")) {
      return "image";
    }

    if (contentType.startsWith("text/")) {
      return "text";
    }

    return "other";
  };

  useEffect(() => {
    fetchFileContent();
    setShareLink(window.location.href);
  }, [shareId]);

  const fetchFileContent = async () => {
    try {
      const data = await apiService.getSharedFile(shareId);
      setFileData(data);

      // Determine file type based on content type
      const type = determineFileType(
        data.original_filename,
        data.content_type || ""
      );
      setFileType(type);

      if (type === "text") {
        // Fetch text content if it's a text file
        const response = await fetch(data.download_url);
        const textContent = await response.text();
        setFileContent(textContent);
      } else {
        setFileContent(data.download_url);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load file content");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileData) return;

    try {
      const blob = await apiService.downloadFileByUrl(fileData.download_url);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileData.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download file. Please try again.");
      console.error("Download failed:", err);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Share link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy link");
        console.error("Failed to copy link: ", err);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500 text-center">{error}</p>
        <button
          onClick={fetchFileContent}
          className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white truncate max-w-[70%]">
              {fileData?.original_filename}
            </h2>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-md transition-all duration-300 hover:shadow-lg group"
            >
              <MdDownload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Download
            </button>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="w-full p-3 pr-12 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm truncate"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={copyShareLink}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md group"
            >
              <MdContentCopy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Copy Link
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {fileType === "image" && (
            <div className="bg-gray-100 p-6 rounded-2xl shadow-inner">
              <img
                src={fileContent}
                alt={fileData?.original_filename}
                className="max-w-full max-h-[600px] object-contain rounded-lg transition-all duration-300 hover:scale-105"
              />
            </div>
          )}

          {fileType === "text" && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 max-h-[600px] overflow-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed select-text">
                {fileContent}
              </pre>
            </div>
          )}

          {fileType === "other" && (
            <div className="text-center p-12 bg-gray-50 border border-gray-200 rounded-2xl space-y-6">
              <div className="bg-gray-200 w-20 h-20 mx-auto rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  File Type:{" "}
                  {fileData?.original_filename.split(".").pop()?.toUpperCase()}
                </p>
                <p className="text-gray-500 mb-6">
                  Preview not available for this file type
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md group"
                >
                  <MdDownload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
