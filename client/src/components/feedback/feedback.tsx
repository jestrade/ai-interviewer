import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInterviewApi } from "@/services/api";
import { notifyError } from "@/services/sentry";

interface FeedbackData {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: {
    category: string;
    score: number;
    comments: string;
  }[];
  recommendations: string[];
}

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getFeedback } = useInterviewApi();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const result = await getFeedback.mutateAsync();
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(result);
        setFeedback(result);
      } catch (error) {
        notifyError("Error fetching feedback:" + error);
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score >= 60) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-subtle">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-col h-screen bg-gradient-subtle">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No feedback available</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <header className="bg-card border-b border-border/50 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Interview Feedback
              </h1>
              <p className="text-xs text-muted-foreground">
                Review your performance and areas for improvement
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Overall Score */}
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Overall Performance
                <Badge
                  className={`text-lg px-3 py-1 ${getScoreColor(
                    feedback.overallScore
                  )}`}
                >
                  {feedback.overallScore}/100
                  {getScoreIcon(feedback.overallScore)}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Strengths */}
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-green-600">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-orange-600">
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          {feedback.detailedFeedback &&
            feedback.detailedFeedback.length > 0 && (
              <Card className="shadow-soft border-border/50">
                <CardHeader>
                  <CardTitle>Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.detailedFeedback.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <Badge className={getScoreColor(item.score)}>
                          {item.score}/100
                          {getScoreIcon(item.score)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.comments}
                      </p>
                      {index < feedback.detailedFeedback.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          {/* Recommendations */}
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-blue-600">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
