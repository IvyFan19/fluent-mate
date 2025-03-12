"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Mic, MicOff, Send } from "lucide-react"
import ChatMessage from "@/components/chat-message"

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic | undefined
    webkitSpeechRecognition: SpeechRecognitionStatic | undefined
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    start: () => void
    stop: () => void
  }

  interface SpeechRecognitionStatic {
    prototype: SpeechRecognition
    new (): SpeechRecognition
    new (): SpeechRecognition
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {}

  interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
    isFinal: boolean
  }

  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
}

export default function EnglishPracticeApp() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your English practice assistant. Let's have a conversation to improve your English skills. What would you like to talk about today?",
      },
    ],
  })

  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      setSpeechSupported(true)
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    if (!speechSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error("SpeechRecognition is not supported in this browser.")
      return
    }

    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.start()
    setIsListening(true)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isListening) {
      stopListening()
    }
    handleSubmit(e)
  }

  return (
    <Card className="w-full">
      <CardHeader></CardHeader>
      <CardContent ref={chatContainerRef} className="h-[60vh] overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleFormSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-grow"
            disabled={isListening}
          />
          {speechSupported && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleListening}
              className="px-3"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          )}
          <Button type="submit" disabled={!input.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

