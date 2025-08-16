import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Plus, Download } from "lucide-react";

interface SuccessStateProps {
  onStartNew: () => void;
}

export default function SuccessState({ onStartNew }: SuccessStateProps) {
  const handleDownload = () => {
    // Create a simple text download of the summary
    const element = document.createElement("a");
    const file = new Blob(["Meeting summary download functionality would be implemented here"], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "meeting-summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="border-green-200">
      <CardContent className="p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Summary Sent Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Your meeting summary has been sent to the specified recipients
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onStartNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Summary
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Summary
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
