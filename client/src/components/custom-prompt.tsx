import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CustomPromptProps {
  prompt: string;
  transcript: string;
  onPromptChange: (prompt: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  onSummaryGenerated: (summary: string, summaryId: string, aiProvider?: string) => void;
  isActive: boolean;
}

const promptTemplates = {
  executive: "Summarize this meeting in bullet points for executives, focusing on key decisions, budget impacts, and strategic outcomes.",
  action: "Extract only action items from this meeting, including who is responsible and any mentioned deadlines.",
  detailed: "Create a comprehensive summary of this meeting, organized by topics discussed with all important details preserved.",
  topics: "Break down this meeting summary by discussion topics, organizing related points under clear headings."
};

export default function CustomPrompt({
  prompt,
  transcript,
  onPromptChange,
  onBack,
  onGenerate,
  onSummaryGenerated,
  isActive,
}: CustomPromptProps) {
  const { toast } = useToast();

  const generateSummaryMutation = useMutation({
    mutationFn: async (data: { transcript: string; prompt: string }) => {
      const response = await apiRequest("POST", "/api/generate-summary", data);
      return response.json();
    },
    onSuccess: (data) => {
      onSummaryGenerated(data.generatedSummary, data.id, data.aiProvider);
      toast({
        title: "Summary generated successfully",
        description: data.aiProvider ? `Generated using ${data.aiProvider}` : "Your AI-powered summary is ready for review",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a custom prompt for the AI",
        variant: "destructive",
      });
      return;
    }

    onGenerate();
    generateSummaryMutation.mutate({
      transcript,
      prompt: prompt.trim(),
    });
  };

  const selectTemplate = (templateKey: keyof typeof promptTemplates) => {
    onPromptChange(promptTemplates[templateKey]);
  };

  return (
    <Card className={`mb-6 ${!isActive ? "opacity-50" : ""}`}>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Wand2 className="mr-2 h-5 w-5" />
          Step 2: Custom Instructions
        </h2>

        <div className="mb-4">
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            How would you like the AI to summarize your transcript?
          </label>
          <Textarea
            id="customPrompt"
            className="min-h-24"
            placeholder="Example: Summarize in bullet points for executives, highlighting key decisions and action items with deadlines..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>

        {/* Quick Prompt Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Templates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto p-3 text-left justify-start"
              onClick={() => selectTemplate("executive")}
            >
              <div>
                <div className="font-medium">Executive Summary</div>
                <div className="text-xs text-gray-500">Key decisions and outcomes</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto p-3 text-left justify-start"
              onClick={() => selectTemplate("action")}
            >
              <div>
                <div className="font-medium">Action Items</div>
                <div className="text-xs text-gray-500">Tasks and deadlines only</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto p-3 text-left justify-start"
              onClick={() => selectTemplate("detailed")}
            >
              <div>
                <div className="font-medium">Detailed Notes</div>
                <div className="text-xs text-gray-500">Comprehensive summary</div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto p-3 text-left justify-start"
              onClick={() => selectTemplate("topics")}
            >
              <div>
                <div className="font-medium">Topic Breakdown</div>
                <div className="text-xs text-gray-500">Organized by discussion points</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generateSummaryMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {generateSummaryMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
