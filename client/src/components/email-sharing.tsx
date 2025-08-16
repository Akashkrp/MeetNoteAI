import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, Mail, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailSharingProps {
  summaryId: string;
  summary: string;
  onBack: () => void;
  onSuccess: () => void;
  isActive: boolean;
}

export default function EmailSharing({
  summaryId,
  summary,
  onBack,
  onSuccess,
  isActive,
}: EmailSharingProps) {
  const [emailData, setEmailData] = useState({
    subject: "Meeting Summary - AI Generated",
    recipients: "",
    message: "",
    includeOriginal: false,
    sendCopy: false,
  });

  const { toast } = useToast();

  const sendEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/send-email", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email sent successfully",
        description: `Summary shared with ${data.recipientCount} recipients`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please check recipient addresses and try again",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    const recipients = emailData.recipients
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (recipients.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please enter at least one recipient email address",
        variant: "destructive",
      });
      return;
    }

    if (!emailData.subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      summaryId,
      recipients,
      subject: emailData.subject.trim(),
      message: emailData.message.trim() || undefined,
      includeOriginal: emailData.includeOriginal,
      sendCopy: emailData.sendCopy,
    });
  };

  const updateEmailData = (field: string, value: any) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const recipientEmails = emailData.recipients
    .split(",")
    .map(email => email.trim())
    .filter(email => email.length > 0);

  return (
    <Card className={`mb-6 ${!isActive ? "opacity-50" : ""}`}>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Step 4: Share Summary via Email
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <Input
              id="emailSubject"
              value={emailData.subject}
              onChange={(e) => updateEmailData("subject", e.target.value)}
              placeholder="Meeting Summary - AI Generated"
            />
          </div>

          <div>
            <label htmlFor="emailRecipients" className="block text-sm font-medium text-gray-700 mb-2">
              Recipients (comma separated)
            </label>
            <Input
              type="email"
              id="emailRecipients"
              value={emailData.recipients}
              onChange={(e) => updateEmailData("recipients", e.target.value)}
              placeholder="john@company.com, sarah@company.com, team@company.com"
              multiple
            />
          </div>

          <div>
            <label htmlFor="emailMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <Textarea
              id="emailMessage"
              className="min-h-24"
              value={emailData.message}
              onChange={(e) => updateEmailData("message", e.target.value)}
              placeholder="Hi team, please find the meeting summary below. Let me know if you have any questions..."
            />
          </div>

          {/* Email Preview */}
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <strong>To:</strong>{" "}
                {recipientEmails.length > 0 ? recipientEmails.join(", ") : "No recipients"}
              </div>
              <div>
                <strong>Subject:</strong> {emailData.subject || "No subject"}
              </div>
              <div className="mt-2 p-2 bg-white rounded border text-xs">
                {emailData.message && (
                  <div className="mb-2">{emailData.message}</div>
                )}
                <div className="text-gray-500 italic">
                  --- Meeting Summary Content Will Be Included ---
                </div>
              </div>
            </div>
          </div>

          {/* Send Options */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Email Options</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeOriginal"
                      checked={emailData.includeOriginal}
                      onCheckedChange={(checked) => updateEmailData("includeOriginal", checked)}
                    />
                    <label htmlFor="includeOriginal" className="text-sm text-blue-700">
                      Include original transcript as attachment
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendCopy"
                      checked={emailData.sendCopy}
                      onCheckedChange={(checked) => updateEmailData("sendCopy", checked)}
                    />
                    <label htmlFor="sendCopy" className="text-sm text-blue-700">
                      Send a copy to myself
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Summary
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {sendEmailMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
