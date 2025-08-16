import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share, Copy, RotateCcw, Bold, Italic, Underline, List, ListOrdered, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SummaryEditorProps {
  summary: string;
  summaryId: string;
  onSummaryChange: (summary: string) => void;
  onBack: () => void;
  onNext: () => void;
  isActive: boolean;
}

export default function SummaryEditor({
  summary,
  summaryId,
  onSummaryChange,
  onBack,
  onNext,
  isActive,
}: SummaryEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const updateSummaryMutation = useMutation({
    mutationFn: async (data: { summaryId: string; generatedSummary: string }) => {
      const response = await apiRequest("PATCH", `/api/summaries/${data.summaryId}`, {
        generatedSummary: data.generatedSummary,
      });
      return response.json();
    },
  });

  // Convert markdown-style formatting to HTML for display
  const formatSummaryForDisplay = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  // Convert HTML back to text for storage
  const getTextFromEditor = () => {
    if (editorRef.current) {
      return editorRef.current.innerHTML
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br>/g, '\n')
        .replace(/<[^>]*>/g, ''); // Remove any other HTML tags
    }
    return summary;
  };

  useEffect(() => {
    if (editorRef.current && summary) {
      editorRef.current.innerHTML = formatSummaryForDisplay(summary);
    }
  }, [summary]);

  const handleEditorChange = () => {
    const newSummary = getTextFromEditor();
    onSummaryChange(newSummary);
    
    // Auto-save after a delay
    updateSummaryMutation.mutate({
      summaryId,
      generatedSummary: newSummary,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getTextFromEditor());
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy summary to clipboard",
        variant: "destructive",
      });
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorChange();
  };

  return (
    <Card className={`mb-6 ${!isActive ? "opacity-50" : ""}`}>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Edit className="mr-2 h-5 w-5" />
          Step 3: Review & Edit Summary
        </h2>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Generated Summary
            </label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div
            ref={editorRef}
            className="min-h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            contentEditable
            onInput={handleEditorChange}
            onBlur={handleEditorChange}
            style={{ outline: 'none' }}
            suppressContentEditableWarning
          />
        </div>

        {/* Editing Tools */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeCommand('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeCommand('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeCommand('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-300 mx-2"></div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeCommand('insertUnorderedList')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => executeCommand('insertOrderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prompt
          </Button>
          <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
            Proceed to Share
            <Share className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
