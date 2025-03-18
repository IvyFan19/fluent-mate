import { cn } from "@/lib/utils"
import type { Message } from "ai"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface ErrorItem {
  errorWord: string;
  correctionWord: string;
  position: number;
  explanation?: string;
}

interface GrammarFeedback {
  sentence: string;
  errors: ErrorItem[];
}

interface ChatMessageProps {
  message: Message;
  requestFeedback: (messageId: string, text: string) => Promise<void>;
  isLoadingFeedback: boolean;
  feedback?: GrammarFeedback | null;
  showFeedback?: boolean;
}

export default function ChatMessage({ 
  message, 
  requestFeedback, 
  isLoadingFeedback, 
  feedback, 
  showFeedback = false 
}: ChatMessageProps) {
  const isUser = message.role === "user"

  const handleFeedbackClick = () => {
    requestFeedback(message.id, message.content)
  }

  // Function to highlight all errors in a sentence
  const highlightErrors = (sentence: string, errors: ErrorItem[]) => {
    if (!errors || errors.length === 0) return sentence;
    
    // Sort errors by position in descending order to avoid offsets when replacing
    const sortedErrors = [...errors].sort((a, b) => b.position - a.position);
    
    let result = sentence;
    
    // Apply each error highlight
    for (const error of sortedErrors) {
      // Find the exact occurrence of the error word at the approximate position
      const index = findNearestOccurrence(result, error.errorWord, error.position);
      if (index === -1) continue; // Skip if we can't find the word
      
      // Create the highlighted version with tooltip
      const tooltip = error.explanation ? ` title="${error.explanation}"` : '';
      const highlighted = `<span class="text-red-500 border-b border-red-500 cursor-help"${tooltip}>${error.errorWord}</span>`;
      
      // Replace only at the specific position
      result = result.substring(0, index) + highlighted + result.substring(index + error.errorWord.length);
    }
    
    return result;
  };

  // Function to create the corrected sentence by replacing all errors with corrections
  const getCorrectedSentence = (sentence: string, errors: ErrorItem[]) => {
    if (!errors || errors.length === 0) return sentence;
    
    // Sort errors by position in descending order to avoid offsets when replacing
    const sortedErrors = [...errors].sort((a, b) => b.position - a.position);
    
    let result = sentence;
    
    // Apply each correction
    for (const error of sortedErrors) {
      // Find the exact occurrence of the error word at the approximate position
      const index = findNearestOccurrence(result, error.errorWord, error.position);
      if (index === -1) continue; // Skip if we can't find the word
      
      // Replace only at the specific position
      result = result.substring(0, index) + error.correctionWord + result.substring(index + error.errorWord.length);
    }
    
    return result;
  };

  // Function to highlight all corrections in a sentence
  const highlightCorrections = (sentence: string, errors: ErrorItem[]) => {
    if (!errors || errors.length === 0) return sentence;
    
    let result = sentence;
    
    // Create an array of positions and lengths to track where corrections are
    const corrections: {start: number, end: number, text: string, explanation?: string}[] = [];
    
    // First, identify where all corrections are in the result string
    for (const error of errors) {
      // Try to find the correction in the sentence
      const index = result.indexOf(error.correctionWord);
      if (index !== -1) {
        corrections.push({
          start: index,
          end: index + error.correctionWord.length,
          text: error.correctionWord,
          explanation: error.explanation
        });
      }
    }
    
    // Sort corrections by position in descending order
    corrections.sort((a, b) => b.start - a.start);
    
    // Apply highlighting to each correction
    for (const correction of corrections) {
      const tooltip = correction.explanation ? ` title="${correction.explanation}"` : '';
      const highlighted = `<span class="text-green-500 border-b border-green-500 cursor-help"${tooltip}>${correction.text}</span>`;
      
      // Replace only at the specific position
      result = result.substring(0, correction.start) + highlighted + result.substring(correction.end);
    }
    
    return result;
  };

  // Helper function to find the nearest occurrence of a word to a position
  const findNearestOccurrence = (text: string, word: string, approximatePosition: number) => {
    // First check if the word exists exactly at the position
    if (text.substring(approximatePosition, approximatePosition + word.length) === word) {
      return approximatePosition;
    }
    
    // Look for the word in a window around the approximate position
    const windowSize = 20; // Characters to look around the position
    const startIndex = Math.max(0, approximatePosition - windowSize);
    const endIndex = Math.min(text.length, approximatePosition + windowSize);
    const searchText = text.substring(startIndex, endIndex);
    
    const exactMatch = searchText.indexOf(word);
    if (exactMatch !== -1) {
      return startIndex + exactMatch;
    }
    
    // If still not found, try the entire text
    return text.indexOf(word);
  };

  return (
    <div className="space-y-2">
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {message.content}
        </div>
      </div>
      
      {isUser && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFeedbackClick}
            disabled={isLoadingFeedback}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {isLoadingFeedback ? "Loading..." : "Feedback"}
          </Button>
        </div>
      )}

      {/* Grammar feedback displayed directly below the user message */}
      {isUser && showFeedback && feedback && (
        <div className="mt-2 ml-auto max-w-[80%]">
          {feedback.errors.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {/* Original sentence with errors */}
              <div className="flex items-start">
                <span className="flex-shrink-0 mr-2 text-red-500">❌</span>
                <span 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightErrors(feedback.sentence, feedback.errors) 
                  }} 
                />
              </div>
              
              {/* Corrected sentence */}
              <div className="flex items-start">
                <span className="flex-shrink-0 mr-2 text-green-500">✅</span>
                <span 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightCorrections(
                      getCorrectedSentence(feedback.sentence, feedback.errors), 
                      feedback.errors
                    ) 
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start text-green-500">
              <span className="flex-shrink-0 mr-2">✅</span>
              <span className="text-sm">No grammar errors found in your message.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

