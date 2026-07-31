import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react";

const FILE_ICON_MAP = {
  doc: { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  docx: { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  xls: {
    Icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  xlsx: {
    Icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  csv: {
    Icon: FileSpreadsheet,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  pdf: { Icon: FileText, color: "text-red-500", bg: "bg-red-50" },
  ppt: {
    Icon: Presentation,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  pptx: {
    Icon: Presentation,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  png: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  jpg: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  jpeg: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  gif: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  webp: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  svg: { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  mp4: { Icon: FileVideo, color: "text-pink-500", bg: "bg-pink-50" },
  mov: { Icon: FileVideo, color: "text-pink-500", bg: "bg-pink-50" },
  webm: { Icon: FileVideo, color: "text-pink-500", bg: "bg-pink-50" },
  mp3: { Icon: FileAudio, color: "text-indigo-500", bg: "bg-indigo-50" },
  wav: { Icon: FileAudio, color: "text-indigo-500", bg: "bg-indigo-50" },
  zip: {
    Icon: FileArchive,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  rar: {
    Icon: FileArchive,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  "7z": {
    Icon: FileArchive,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  js: { Icon: FileCode, color: "text-amber-500", bg: "bg-amber-50" },
  jsx: { Icon: FileCode, color: "text-amber-500", bg: "bg-amber-50" },
  ts: { Icon: FileCode, color: "text-blue-600", bg: "bg-blue-50" },
  tsx: { Icon: FileCode, color: "text-blue-600", bg: "bg-blue-50" },
  json: { Icon: FileCode, color: "text-gray-700", bg: "bg-gray-50" },
  html: { Icon: FileCode, color: "text-orange-600", bg: "bg-orange-50" },
  css: { Icon: FileCode, color: "text-sky-500", bg: "bg-sky-50" },
};

const FALLBACK = {
  Icon: File,
  color: "text-gray-500",
  bg: "bg-gray-100",
};

export const getFileIconInfo = (urlOrName = "") => {
  if (!urlOrName) return FALLBACK;

  const cleanName = urlOrName.split("?")[0].split("#")[0];
  const extension = cleanName.split(".").pop()?.toLowerCase();

  return FILE_ICON_MAP[extension] ?? FALLBACK;
};
