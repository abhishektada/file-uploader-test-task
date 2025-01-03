"use client";

import { useState, useEffect } from "react";
import { MdContentCopy, MdDownload, MdDelete, MdRefresh } from "react-icons/md";
import { toast } from "react-hot-toast";
import { apiService, eventEmitter, FileResponse } from "@/lib";

export const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatedShareUrls, setGeneratedShareUrls] = useState<{
    [key: string]: string;
  }>({});

  const fetchFiles = async () => {
    try {
      setRefreshing(true);
      const response = await apiService.getFiles();

      // Generate share URLs for all files during fetch
      const filesWithShareUrls = response.map((file: FileResponse) => {
        const shareUrlParts = file.share_url.split("/");
        const shareId = shareUrlParts[shareUrlParts.length - 2];
        const shareViewUrl = `/share/${shareId}`;
        const fullShareUrl = `${window.location.origin}${shareViewUrl}`;

        // Store the generated share URL for each file
        setGeneratedShareUrls((prev) => ({
          ...prev,
          [file.id]: fullShareUrl,
        }));

        return file;
      });

      setFiles(filesWithShareUrls);
      setError(null);
    } catch (err) {
      setError("Failed to fetch files. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    // Add event listener for file uploads
    const handleFileUploaded = () => {
      fetchFiles();
    };

    eventEmitter.on("fileUploaded", handleFileUploaded);

    // Cleanup
    return () => {
      eventEmitter.off("fileUploaded", handleFileUploaded);
    };
  }, []);

  const handleDownload = async (file: FileResponse) => {
    try {
      const blob = await apiService.downloadFileByUrl(file.download_url);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download file. Please try again.");
    }
  };

  const handleDelete = async (fileId: string) => {
    setDeleting(fileId);
    try {
      await apiService.deleteFile(fileId);
      setFiles(files.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully");
    } catch (err) {
      setError("Failed to delete file. Please try again.");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const copyShareLink = (fileId: string) => {
    const shareUrl = generatedShareUrls[fileId];
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
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
          onClick={() => window.location.reload()}
          className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Uploaded Files
        </h2>
        <button
          onClick={fetchFiles}
          disabled={refreshing}
          className="flex items-center px-6 py-3 bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <MdRefresh
            className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">
              No files uploaded yet
            </p>
            <p className="text-gray-500">
              Upload your first file to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {file.original_filename}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(file.upload_date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => copyShareLink(file.id)}
                      className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <MdContentCopy className="w-5 h-5 mr-2" />
                      Copy Share Link
                    </button>

                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <MdDownload className="w-5 h-5 mr-2" />
                      Download File
                    </button>

                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                      className="flex items-center justify-center w-full px-4 py-2.5 bg-white border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <MdDelete className="w-5 h-5 mr-2" />
                      {deleting === file.id ? "Deleting..." : "Delete File"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
