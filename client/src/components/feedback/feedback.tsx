import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useInterviewApi } from "@/services/api";
import { notifyError } from "@/services/sentry";

/** One answered question, as returned by the `getFeedback` function. */
interface FeedbackItem {
  question: string;
  answer: string;
  feedback: string;
}

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col h-screen bg-gradient-subtle">{children}</div>
);

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: fetchFeedback } = useInterviewApi().getFeedback;
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchFeedback()
      .then((result) => !cancelled && setItems(result.feedback ?? []))
      .catch((error) => {
        notifyError("Error fetching feedback:" + error);
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backButton = (
    <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="hover:bg-muted">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Chat
    </Button>
  );

  if (isLoading) {
    return (
      <Screen>
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your feedback...</p>
          </div>
        </div>
      </Screen>
    );
  }

  if (!items?.length) {
    return (
      <Screen>
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-muted-foreground mb-4">No feedback available</p>
            {backButton}
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="bg-card border-b border-border/50 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          {backButton}
          <div>
            <h1 className="text-lg font-semibold text-foreground">Interview Feedback</h1>
            <p className="text-xs text-muted-foreground">
              Review your performance and areas for improvement
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {items.map((item, index) => (
            <Card key={index} className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="text-base">
                  {index + 1}. {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Your answer</p>
                  <p>{item.answer}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-600 mb-1">Feedback</p>
                  <p>{item.feedback}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Screen>
  );
};

export default Feedback;
