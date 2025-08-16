import { Card, CardContent } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Summary...</h3>
          <p className="text-gray-600">
            AI is processing your transcript and creating a summary based on your instructions.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Analyzing transcript content...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
