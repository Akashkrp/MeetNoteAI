import { useState } from "react";
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
                onSummaryGenerated={(summary, summaryId) => {
                  updateAppState({ summary, summaryId });
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
