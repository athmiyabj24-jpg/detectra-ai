'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your GreenVerify AI assistant. I can help you understand greenwashing, analyze environmental claims, and explain sustainability standards. What would you like to know?',
    timestamp: new Date(),
  },
];

// Simulated AI responses based on keywords
function generateResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  // Greenwashing definition
  if (lowerInput.includes('what is greenwashing') || lowerInput.includes('define greenwashing')) {
    return 'Greenwashing is a marketing practice where companies exaggerate or falsely claim their products or policies are environmentally friendly. Common signs include: vague terms like "eco-friendly" without evidence, hidden trade-offs, false certifications, or focusing on minor green attributes while ignoring larger environmental impacts.';
  }

  // How to identify genuine claims
  if (lowerInput.includes('genuine') || lowerInput.includes('real claim') || lowerInput.includes('authentic')) {
    return 'Genuine environmental claims typically include: 1) Specific metrics (e.g., "reduced emissions by 30%"), 2) Third-party certifications (ISO 14001, B Corp), 3) Clear timeframes and baselines, 4) Transparent methodology, and 5) Independent verification. Our AI analyzes all these factors to determine claim authenticity.';
  }

  // Certifications
  if (lowerInput.includes('certification') || lowerInput.includes('certified') || lowerInput.includes('iso')) {
    return 'Key environmental certifications include:\n\n• ISO 14001 - Environmental management systems\n• B Corp - Overall social/environmental performance\n• FSC - Sustainable forestry\n• LEED - Green building certification\n• Energy Star - Energy efficiency\n• Science Based Targets - Climate commitments\n\nThird-party certifications significantly increase the credibility of environmental claims.';
  }

  // Risk levels
  if (lowerInput.includes('risk') || lowerInput.includes('score')) {
    return 'Our risk scoring system evaluates claims on multiple factors:\n\n• Low Risk (0-24): Claim appears genuine with strong supporting evidence\n• Medium Risk (25-49): Some concerns, but may be exaggerated rather than false\n• High Risk (50-74): Significant red flags, likely misleading\n• Critical Risk (75-100): Strong indicators of false or deceptive claims\n\nWe also factor in company history and industry benchmarks.';
  }

  // How does analysis work
  if (lowerInput.includes('how') && (lowerInput.includes('work') || lowerInput.includes('analyze') || lowerInput.includes('analysis'))) {
    return 'Our AI analysis process:\n\n1. Text Extraction - OCR for images, transcription for videos\n2. NLP Classification - Identifies greenwashing patterns\n3. Historical Comparison - Checks against company\'s past claims\n4. Phrase Detection - Highlights suspicious language\n5. Risk Calculation - Combines all factors\n6. Standards Check - Evaluates against SDG, GRI, ESG frameworks\n\nThe entire process takes just seconds!';
  }

  // SDG / Sustainability goals
  if (lowerInput.includes('sdg') || lowerInput.includes('sustainable development')) {
    return 'The UN Sustainable Development Goals (SDGs) most relevant to environmental claims are:\n\n• SDG 7: Affordable and Clean Energy\n• SDG 12: Responsible Consumption and Production\n• SDG 13: Climate Action\n• SDG 14: Life Below Water\n• SDG 15: Life on Land\n\nWe evaluate how claims align with these goals.';
  }

  // ESG
  if (lowerInput.includes('esg')) {
    return 'ESG stands for Environmental, Social, and Governance criteria. For environmental claims:\n\n• E (Environmental): Carbon footprint, waste, resources\n• S (Social): Community impact, labor practices\n• G (Governance): Transparency, ethical practices\n\nOur analysis focuses primarily on the Environmental component, checking if claims meet ESG disclosure requirements.';
  }

  // GRI
  if (lowerInput.includes('gri')) {
    return 'GRI (Global Reporting Initiative) Standards are the world\'s most widely used sustainability reporting standards. We check if environmental claims would meet GRI disclosure requirements, including:\n\n• Specific, measurable data\n• Contextual information\n• Comparability over time\n• Verified information\n\nClaims rated as "GRI Compliant" meet these standards.';
  }

  // Help
  if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
    return 'I can help you with:\n\n• Understanding what greenwashing is\n• Explaining how to identify genuine claims\n• Describing environmental certifications\n• Clarifying our risk scoring system\n• Explaining the analysis process\n• Discussing sustainability standards (SDG, ESG, GRI)\n• Answering questions about your analysis results\n\nJust ask me anything about environmental claims!';
  }

  // Vague terms
  if (lowerInput.includes('vague') || lowerInput.includes('eco-friendly') || lowerInput.includes('green') || lowerInput.includes('natural')) {
    return 'Terms like "eco-friendly," "green," "natural," and "sustainable" are considered vague because they have no legal or standardized definition. They become credible when:\n\n• Backed by specific metrics\n• Supported by third-party certification\n• Defined clearly in context\n• Compared to a measurable baseline\n\nWithout these elements, they\'re often indicators of greenwashing.';
  }

  // Default response
  return 'That\'s an interesting question about environmental claims! While I can provide general guidance on greenwashing, certifications, and sustainability standards, I\'d recommend using our analysis tool for specific claims. Is there something specific about greenwashing detection I can help clarify?';
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = generateResponse(userMessage.content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chat assistant</span>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-200",
      isMinimized ? "w-72 h-14" : "w-96 h-[500px]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm font-medium">GreenVerify Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-[calc(500px-57px-65px)]">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 shrink-0",
                      message.role === 'assistant' ? "bg-primary" : "bg-secondary"
                    )}>
                      <AvatarFallback className={
                        message.role === 'assistant' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      }>
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap",
                        message.role === 'assistant'
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 bg-secondary text-secondary-foreground">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>cd
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about greenwashing..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend} 
                size="icon" 
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
