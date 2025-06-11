import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { aiProviderService } from '../services/aiProviders';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface AIChatBotProps {
  estimationData: {
    totalCost: number;
    items: Array<{
      category: string;
      description: string;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
    }>;
    accuracy: number;
    processingTime: string;
  };
  projectName?: string;
  projectType?: string;
}

export default function AIChatBot({ estimationData, projectName, projectType }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Hello! I'm your AI construction advisor. I've analyzed your ${projectType || 'construction'} project "${projectName || 'estimation'}" with a total cost of ${formatCurrency(estimationData.totalCost)}. 

I can help you with:
• Cost optimization suggestions
• Alternative material recommendations
• Risk assessment and mitigation
• Timeline and scheduling advice
• Budget breakdown analysis
• Market insights and trends

What would you like to know about your project?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isMinimized, messages.length, estimationData, projectName, projectType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateContextPrompt = () => {
    const categoryTotals = estimationData.items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as {[key: string]: number});

    return `You are an expert construction advisor and cost consultant. You are helping with a ${projectType || 'construction'} project called "${projectName || 'Construction Project'}".

PROJECT DETAILS:
- Total Estimated Cost: ${formatCurrency(estimationData.totalCost)}
- Accuracy: ${estimationData.accuracy}%
- Number of Line Items: ${estimationData.items.length}

COST BREAKDOWN BY CATEGORY:
${Object.entries(categoryTotals).map(([category, amount]) => 
  `- ${category}: ${formatCurrency(amount)} (${((amount / estimationData.totalCost) * 100).toFixed(1)}%)`
).join('\n')}

DETAILED LINE ITEMS:
${estimationData.items.map(item => 
  `- ${item.description}: ${item.quantity} ${item.unit} @ ${formatCurrency(item.rate)} = ${formatCurrency(item.amount)}`
).join('\n')}

Provide helpful, actionable advice based on this specific project data. Be concise but thorough. Focus on practical suggestions that can help optimize costs, improve quality, or mitigate risks. Use the actual numbers and categories from this project in your responses.`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const availableProviders = aiProviderService.getAvailableProviders();
      
      if (availableProviders.length === 0) {
        // Fallback response when no AI is configured
        const fallbackResponse = generateFallbackResponse(userMessage.content);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: fallbackResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Use real AI
        const contextPrompt = generateContextPrompt();
        const fullPrompt = `${contextPrompt}\n\nUser Question: ${userMessage.content}\n\nProvide a helpful response based on the project data above.`;

        const config = {
          provider: (import.meta.env.VITE_AI_PROVIDER as any) || availableProviders[0],
          model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
          apiKey: import.meta.env.VITE_OPENAI_API_KEY || 
                   import.meta.env.VITE_ANTHROPIC_API_KEY || 
                   import.meta.env.VITE_GOOGLE_AI_API_KEY || ''
        };

        const response = await aiProviderService.analyzeDocument(
          fullPrompt,
          'chat-query.txt',
          config
        );

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.extractedText || 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('cost') || lowerQuestion.includes('expensive') || lowerQuestion.includes('budget')) {
      const highestCategory = estimationData.items.reduce((prev, current) => 
        prev.amount > current.amount ? prev : current
      );
      return `Based on your project estimate of ${formatCurrency(estimationData.totalCost)}, here are some cost optimization suggestions:

• Your highest cost item is "${highestCategory.description}" at ${formatCurrency(highestCategory.amount)}
• Consider bulk purchasing for materials to get 5-10% discounts
• Review specifications for potential value engineering opportunities
• Get multiple quotes from suppliers and contractors
• Consider phased construction to spread costs over time

The current estimate shows good accuracy at ${estimationData.accuracy}%. I recommend adding a 10-15% contingency for unexpected costs.`;
    }

    if (lowerQuestion.includes('material') || lowerQuestion.includes('alternative')) {
      return `For material optimization in your ${projectType || 'construction'} project:

• Consider alternative materials that meet the same performance standards
• Look into sustainable options that may qualify for tax incentives
• Evaluate local vs. imported materials for cost and timeline benefits
• Review material specifications for potential over-engineering

Your current material costs represent a significant portion of the ${formatCurrency(estimationData.totalCost)} total. I can help you analyze specific categories if you'd like to focus on particular areas.`;
    }

    if (lowerQuestion.includes('time') || lowerQuestion.includes('schedule') || lowerQuestion.includes('duration')) {
      return `For timeline optimization:

• Your project has ${estimationData.items.length} major line items to coordinate
• Consider parallel work streams where possible
• Plan for material delivery schedules to avoid delays
• Factor in weather conditions and seasonal variations
• Build in buffer time for inspections and approvals

Based on the project scope, I estimate 8-12 months for completion, depending on complexity and local conditions.`;
    }

    if (lowerQuestion.includes('risk') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
      return `Key risks to consider for your project:

• Market volatility: Material costs can fluctuate ±10-15%
• Weather delays: Plan for seasonal impacts
• Permit delays: Start applications early
• Labor availability: Secure skilled contractors in advance
• Supply chain: Order long-lead items early

Your ${estimationData.accuracy}% accuracy estimate is good, but I recommend a 10-15% contingency fund for unforeseen issues.`;
    }

    // General response
    return `Thank you for your question about the ${projectType || 'construction'} project. Based on your estimate of ${formatCurrency(estimationData.totalCost)} with ${estimationData.items.length} line items:

• The project shows ${estimationData.accuracy}% confidence in the estimates
• Consider reviewing the highest cost categories for optimization opportunities
• Plan for proper project management and quality control
• Ensure all permits and approvals are in place before starting

Could you be more specific about what aspect you'd like me to focus on? I can help with costs, materials, timeline, or risk management.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Construction Advisor</h3>
            {!isMinimized && <p className="text-xs text-gray-500">Ask me about your project</p>}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about costs, materials, timeline..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}