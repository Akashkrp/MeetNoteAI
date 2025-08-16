import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptUploadProps {
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
  onNext: () => void;
  isActive: boolean;
}

export default function TranscriptUpload({
  transcript,
  onTranscriptChange,
  onNext,
  isActive,
}: TranscriptUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      onTranscriptChange(data.text);
      setUploadedFile(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload and process the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearText = () => {
    onTranscriptChange("");
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasContent = transcript.trim().length > 0;

  return (
    <Card className={`mb-6 ${!isActive ? "opacity-50" : ""}`}>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Step 1: Upload Transcript
        </h2>

        {/* File Upload Option */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Text File
          </label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="text-blue-600">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                <p>Processing file...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .txt, .doc, .docx files
                </p>
              </>
            )}
          </div>
          {uploadedFile && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{uploadedFile.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="px-3 text-sm text-gray-500 bg-white">OR</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        {/* Text Paste Option */}
        <div>
          <label htmlFor="transcriptText" className="block text-sm font-medium text-gray-700 mb-2">
            Paste Transcript Text
          </label>
          <Textarea
            id="transcriptText"
            className="min-h-48 resize-vertical"
            placeholder="Paste your meeting transcript or notes here..."
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">
              {transcript.length} characters
            </span>
            {transcript && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                onClick={clearText}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={onNext}
            disabled={!hasContent}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue to Prompt
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
