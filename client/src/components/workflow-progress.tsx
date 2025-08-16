import { WorkflowStep } from "@/pages/home";

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
}

export default function WorkflowProgress({ currentStep }: WorkflowProgressProps) {
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Prompt" },
    { number: 3, label: "Generate" },
    { number: 4, label: "Edit" },
    { number: 5, label: "Share" },
  ];

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm">
        {steps.map((step) => {
          const isActive = step.number <= currentStep;
          return (
            <div
              key={step.number}
              className={`flex items-center ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              {step.label}
            </div>
          );
        })}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
