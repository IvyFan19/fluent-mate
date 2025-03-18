import { cn } from "@/lib/utils"
import type { Message } from "ai"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface GrammarFeedback {
  sentence: string;
  errorWord: string;
  correctionWord: string;
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

  // Function to highlight specific words in a sentence
  const highlightWord = (sentence: string, word: string, className: string) => {
    if (!word) return sentence;
    
    // Escape special regex characters in the word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex to find the word in the sentence
    const regex = new RegExp(`(${escapedWord})`, 'g');
    
    // Replace with span
    return sentence.replace(regex, `<span class="${className}">$1</span>`);
  };

  // Function to create the corrected sentence by replacing the error word with the correction
  const getCorrectedSentence = (feedback: GrammarFeedback) => {
    if (!feedback.errorWord || !feedback.correctionWord) return feedback.sentence;
    
    // Escape special regex characters in the word
    const escapedWord = feedback.errorWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create regex to find the word in the sentence
    const regex = new RegExp(`(${escapedWord})`, 'g');
    
    // Replace error word with correction word
    return feedback.sentence.replace(regex, feedback.correctionWord);
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
          <div className="flex flex-col space-y-3">
            {/* Original incorrect sentence */}
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-2 text-red-500">❌</span>
              <span 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: highlightWord(feedback.sentence, feedback.errorWord, "text-red-500") 
                }} 
              />
            </div>
            
            {/* Corrected sentence */}
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-2 text-green-500">✅</span>
              <span 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: highlightWord(getCorrectedSentence(feedback), feedback.correctionWord, "text-green-500") 
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

