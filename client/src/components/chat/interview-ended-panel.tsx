import { Button } from "@/components/ui/button";

export const InterviewEndedPanel = ({ onShowFeedback }: { onShowFeedback: () => void }) => (
  <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
    <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">
      <div className="bg-muted/50 border border-border/50 rounded-lg p-4 flex flex-col items-center gap-3 max-w-md">
        <p className="text-sm text-muted-foreground text-center">
          Your interview has ended. View your detailed feedback to see how you performed.
        </p>
        <Button
          onClick={onShowFeedback}
          className="bg-primary hover:opacity-90"
        >
          Show Feedback
        </Button>
      </div>
    </div>
  </div>
);
