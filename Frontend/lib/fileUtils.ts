export const fileTypes = {
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  text: ["txt", "md", "json", "csv"],
  document: ["pdf", "doc", "docx"],
  code: ["js", "ts", "py", "html", "css"],
};

export const getFileType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  for (const [type, extensions] of Object.entries(fileTypes)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }

  return "other";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
