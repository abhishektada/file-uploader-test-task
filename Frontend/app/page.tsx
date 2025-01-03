import { FileList, FileUploader } from "@/components";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
              File Sharing Hub
            </h1>
            <FileUploader />
          </div>
          <div className="border-t border-gray-200 px-6 py-8 sm:px-10">
            <FileList />
          </div>
        </div>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Upload and share files easily. Max file size: 10MB
        </p>
      </div>
    </main>
  );
}
