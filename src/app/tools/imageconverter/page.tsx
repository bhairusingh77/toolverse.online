"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";

export default function ImageConverter() {
    const [files, setFiles] = useState<File[]>([]);
    const [formats, setFormats] = useState<{ [key: string]: string }>({});
    const [progress, setProgress] = useState<{ [key: string]: number }>({});

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/png": [], "image/jpeg": [], "image/webp": [], "image/bmp": [], "image/tiff": [] },
        multiple: true,
        onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    });

    const handleFormatChange = (fileName: string, format: string) => {
        setFormats((prev) => ({ ...prev, [fileName]: format }));
    };

    const convertSingle = async (file: File) => {
        const format = formats[file.name] || "png";
        const formData = new FormData();
        formData.append("file", file);
        formData.append("format", format);

        setProgress((prev) => ({ ...prev, [file.name]: 20 }));

        const response = await fetch("/api/convert", {
            method: "POST",
            body: formData,
        });

        setProgress((prev) => ({ ...prev, [file.name]: 70 }));

        const blob = await response.blob();
        setProgress((prev) => ({ ...prev, [file.name]: 100 }));
        saveAs(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
    };

    const convertAll = async () => {
        const zip = new JSZip();
        for (const file of files) {
            const format = formats[file.name] || "png";
            const formData = new FormData();
            formData.append("file", file);
            formData.append("format", format);

            setProgress((prev) => ({ ...prev, [file.name]: 20 }));

            const response = await fetch("/api/convert", {
                method: "POST",
                body: formData,
            });

            setProgress((prev) => ({ ...prev, [file.name]: 70 }));

            const blob = await response.blob();
            zip.file(file.name.replace(/\.[^.]+$/, `.${format}`), blob);
            setProgress((prev) => ({ ...prev, [file.name]: 100 }));
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "converted_images.zip");
    };

    // Extract event handlers separately to avoid conflicts
    const { onDragEnter, onDragOver, onDrop, onDragLeave } = getRootProps();

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 p-8">
            <motion.h1
                className="text-4xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Image Converter
            </motion.h1>

            <motion.div
                className="w-full max-w-lg h-44 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white shadow-lg rounded-lg cursor-pointer p-4 hover:bg-gray-50 transition"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragLeave={onDragLeave}
            >
                <input {...getInputProps()} />
                <p className="text-gray-600">Drag & drop images here, or click to select</p>
            </motion.div>

            <div className="w-full max-w-lg mt-6 space-y-4">
                {files.map((file) => (
                    <motion.div
                        key={file.name}
                        className="flex flex-col bg-white shadow-md rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 truncate w-40">{file.name}</span>
                            <select
                                value={formats[file.name] || "png"}
                                onChange={(e) => handleFormatChange(file.name, e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-gray-700"
                            >
                                <option value="png">PNG</option>
                                <option value="jpg">JPG</option>
                                <option value="webp">WEBP</option>
                                <option value="bmp">BMP</option>
                                <option value="tiff">TIFF</option>
                            </select>
                            <button
                                onClick={() => convertSingle(file)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Convert & Download
                            </button>
                        </div>
                        {progress[file.name] > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full"
                                    style={{ width: `${progress[file.name]}%` }}
                                ></div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
            {files.length > 0 && (
                <button
                    onClick={convertAll}
                    className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Convert All & Download as ZIP
                </button>
            )}
        </div>
    );
}
