import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WorkflowProgress from "@/components/workflow-progress";
import TranscriptUpload from "@/components/transcript-upload";
import CustomPrompt from "@/components/custom-prompt";
import LoadingState from "@/components/loading-state";
import SummaryEditor from "@/components/summary-editor";
import EmailSharing from "@/components/email-sharing";
import SuccessState from "@/components/success-state";

export type WorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface AppState {
  transcript: string;
  prompt: string;
  summary: string;
  summaryId: string;
}

interface AIStatus {
  mode: 'demo' | 'free' | 'paid';
  services: Array<{
    name: string;
    status: 'available' | 'setup';
    type: 'free' | 'paid';
    description: string;
  }>;
  recommendation?: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    transcript: "",
    prompt: "",
    summary: "",
    summaryId: "",
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
    setIsLoading(false);
    setIsSuccess(false);
  };

  const startOver = () => {
    setCurrentStep(1);
    setIsLoading(false);
    setIsSuccess(false);
    setAppState({
      transcript: "",
      prompt: "",
      summary: "",
      summaryId: "",
    });
  };

  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ['/api/ai-status'],
    staleTime: 30000, // Cache for 30 seconds
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            <i className="fas fa-file-text mr-2 text-blue-600"></i>
            AI Meeting Notes Summarizer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload transcripts, add custom prompts, and generate AI-powered summaries
          </p>
          
          {/* AI Service Status Banner */}
          {aiStatus && (
            <div className="mt-4">
              {aiStatus.mode === 'demo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        🆓 Get Free AI Summaries!
                      </h3>
                      <div className="mt-1 text-sm text-blue-700">
                        <p>Currently in demo mode. Add your <strong>free Google Gemini API key</strong> for unlimited AI summaries:</p>
                        <ol className="mt-2 list-decimal list-inside space-y-1">
                          <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" className="underline font-medium">makersuite.google.com/app/apikey</a></li>
                          <li>Create a free API key</li>
                          <li>Add it as GEMINI_API_KEY in your environment</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {aiStatus.mode === 'free' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-green-500 mr-2">✅</div>
                    <span className="text-sm text-green-800">
                      <strong>Free AI Active:</strong> Using Google Gemini for unlimited summaries
                    </span>
                  </div>
                </div>
              )}
              {aiStatus.mode === 'paid' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-purple-500 mr-2">✅</div>
                    <span className="text-sm text-purple-800">
                      <strong>Premium AI Active:</strong> Using OpenAI GPT-4o
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <WorkflowProgress currentStep={currentStep} />

        {isSuccess ? (
          <SuccessState onStartNew={startOver} />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <>
            {currentStep >= 1 && (
              <TranscriptUpload
                transcript={appState.transcript}
                onTranscriptChange={(transcript) => updateAppState({ transcript })}
                onNext={() => goToStep(2)}
                isActive={currentStep === 1}
              />
            )}

            {currentStep >= 2 && (
              <CustomPrompt
                prompt={appState.prompt}
                onPromptChange={(prompt) => updateAppState({ prompt })}
                onBack={() => goToStep(1)}
                onGenerate={() => setIsLoading(true)}
                onSummaryGenerated={(summary, summaryId, aiProvider) => {
                  updateAppState({ summary, summaryId });
                  if (aiProvider) {
                    console.log('Summary generated using:', aiProvider);
                  }
                  goToStep(4);
                }}
                transcript={appState.transcript}
                isActive={currentStep === 2}
              />
            )}

            {currentStep >= 4 && appState.summary && (
              <SummaryEditor
                summary={appState.summary}
                summaryId={appState.summaryId}
                onSummaryChange={(summary) => updateAppState({ summary })}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(5)}
                isActive={currentStep === 4}
              />
            )}

            {currentStep >= 5 && (
              <EmailSharing
                summaryId={appState.summaryId}
                summary={appState.summary}
                onBack={() => goToStep(4)}
                onSuccess={() => setIsSuccess(true)}
                isActive={currentStep === 5}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
