import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

export interface FileResponse {
  id: string;
  original_filename: string;
  upload_date: string;
  download_url: string;
  share_url: string;
  content_type: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
}

// API configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Create API instance
const api: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    const errorResponse: ErrorResponse = {
      message: error.response?.data?.message || "An unexpected error occurred",
      status: error.response?.status || 500,
    };
    return Promise.reject(errorResponse);
  }
);

// API endpoints
export const endpoints = {
  files: "/api/files/",
  share: (shareId: string) => `/api/files/share/${shareId}/`,
  download: (fileId: string) => `/api/files/download/${fileId}/`,
  delete: (fileId: string) => `/api/files/${fileId}/`,
};

// Reusable API methods
export const apiService = {
  // Get all files
  getFiles: async (): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>(endpoints.files);
    return response.data;
  },

  // Upload file
  uploadFile: async (file: File): Promise<FileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("original_filename", file.name);

    const response = await api.post<FileResponse>(endpoints.files, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get file by share ID
  getSharedFile: async (shareId: string): Promise<FileResponse> => {
    const response = await api.get<FileResponse>(endpoints.share(shareId));
    return response.data;
  },

  // Download file
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await api.get(endpoints.download(fileId), {
      responseType: "blob",
    });
    return response.data;
  },

  // Download file by URL
  downloadFileByUrl: async (downloadUrl: string): Promise<Blob> => {
    const response = await axios.get(downloadUrl, { responseType: "blob" });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(endpoints.delete(fileId));
  },
};

export { api };
