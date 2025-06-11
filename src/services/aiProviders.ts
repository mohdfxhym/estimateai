import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface DocumentAnalysisResult {
  extractedText: string;
  identifiedItems: Array<{
    category: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedRate: number;
    confidence: number;
  }>;
  projectType: string;
  totalEstimatedCost: number;
  accuracy: number;
  insights: string[];
}

class AIProviderService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private googleAI?: GoogleGenerativeAI;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const googleKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      });
    }

    if (anthropicKey) {
      this.anthropic = new Anthropic({
        apiKey: anthropicKey,
        dangerouslyAllowBrowser: true
      });
    }

    if (googleKey) {
      this.googleAI = new GoogleGenerativeAI(googleKey);
    }
  }

  async analyzeDocument(
    fileContent: string | ArrayBuffer,
    fileName: string,
    config: AIConfig
  ): Promise<DocumentAnalysisResult> {
    // Special handling for chat queries
    if (fileName === 'chat-query.txt' && typeof fileContent === 'string') {
      return this.handleChatQuery(fileContent, config);
    }

    switch (config.provider) {
      case 'openai':
        return this.analyzeWithOpenAI(fileContent, fileName, config);
      case 'anthropic':
        return this.analyzeWithAnthropic(fileContent, fileName, config);
      case 'google':
        return this.analyzeWithGoogle(fileContent, fileName, config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private async handleChatQuery(query: string, config: AIConfig): Promise<DocumentAnalysisResult> {
    try {
      let response = '';

      switch (config.provider) {
        case 'openai':
          if (this.openai) {
            const completion = await this.openai.chat.completions.create({
              model: config.model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert construction advisor. Provide helpful, practical advice based on the project context provided.'
                },
                {
                  role: 'user',
                  content: query
                }
              ],
              max_tokens: 1000,
              temperature: 0.7
            });
            response = completion.choices[0].message.content || '';
          }
          break;

        case 'anthropic':
          if (this.anthropic) {
            const completion = await this.anthropic.messages.create({
              model: config.model || 'claude-3-sonnet-20240229',
              max_tokens: 1000,
              temperature: 0.7,
              messages: [
                {
                  role: 'user',
                  content: query
                }
              ]
            });
            const content = completion.content[0];
            if (content.type === 'text') {
              response = content.text;
            }
          }
          break;

        case 'google':
          if (this.googleAI) {
            const model = this.googleAI.getGenerativeModel({ 
              model: config.model || 'gemini-pro' 
            });
            const result = await model.generateContent(query);
            const responseObj = await result.response;
            response = responseObj.text();
          }
          break;
      }

      return {
        extractedText: response || 'I apologize, but I encountered an issue processing your request.',
        identifiedItems: [],
        projectType: '',
        totalEstimatedCost: 0,
        accuracy: 0,
        insights: []
      };
    } catch (error) {
      console.error('Chat query error:', error);
      return {
        extractedText: 'I apologize, but I encountered an error while processing your request. Please try again.',
        identifiedItems: [],
        projectType: '',
        totalEstimatedCost: 0,
        accuracy: 0,
        insights: []
      };
    }
  }

  private async analyzeWithOpenAI(
    fileContent: string | ArrayBuffer,
    fileName: string,
    config: AIConfig
  ): Promise<DocumentAnalysisResult> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized. Please check your API key.');
    }

    const prompt = this.getAnalysisPrompt();
    
    try {
      let messages: any[] = [];

      if (fileName.toLowerCase().includes('.pdf') || typeof fileContent === 'string') {
        // Text-based analysis
        messages = [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Analyze this construction document:\n\n${fileContent}`
          }
        ];
      } else {
        // Image-based analysis for drawings/plans
        const base64Content = this.arrayBufferToBase64(fileContent as ArrayBuffer);
        messages = [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this construction drawing/document for cost estimation:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Content}`
                }
              }
            ]
          }
        ];
      }

      const response = await this.openai.chat.completions.create({
        model: config.model || 'gpt-4-vision-preview',
        messages,
        max_tokens: 4000,
        temperature: 0.1
      });

      return this.parseAIResponse(response.choices[0].message.content || '');
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw new Error('Failed to analyze document with OpenAI');
    }
  }

  private async analyzeWithAnthropic(
    fileContent: string | ArrayBuffer,
    fileName: string,
    config: AIConfig
  ): Promise<DocumentAnalysisResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized. Please check your API key.');
    }

    const prompt = this.getAnalysisPrompt();
    
    try {
      const response = await this.anthropic.messages.create({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nAnalyze this construction document:\n\n${fileContent}`
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseAIResponse(content.text);
      }
      
      throw new Error('Unexpected response format from Anthropic');
    } catch (error) {
      console.error('Anthropic analysis error:', error);
      throw new Error('Failed to analyze document with Anthropic');
    }
  }

  private async analyzeWithGoogle(
    fileContent: string | ArrayBuffer,
    fileName: string,
    config: AIConfig
  ): Promise<DocumentAnalysisResult> {
    if (!this.googleAI) {
      throw new Error('Google AI not initialized. Please check your API key.');
    }

    const prompt = this.getAnalysisPrompt();
    
    try {
      const model = this.googleAI.getGenerativeModel({ 
        model: config.model || 'gemini-pro-vision' 
      });

      let result;
      if (fileName.toLowerCase().includes('.pdf') || typeof fileContent === 'string') {
        result = await model.generateContent([
          prompt,
          `Analyze this construction document:\n\n${fileContent}`
        ]);
      } else {
        const base64Content = this.arrayBufferToBase64(fileContent as ArrayBuffer);
        result = await model.generateContent([
          prompt,
          'Analyze this construction drawing/document for cost estimation:',
          {
            inlineData: {
              data: base64Content,
              mimeType: 'image/jpeg'
            }
          }
        ]);
      }

      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error('Google AI analysis error:', error);
      throw new Error('Failed to analyze document with Google AI');
    }
  }

  private getAnalysisPrompt(): string {
    return `You are an expert construction cost estimator and quantity surveyor. Analyze the provided construction document and extract detailed cost estimation information.

Please provide your analysis in the following JSON format:

{
  "extractedText": "Brief summary of document content",
  "identifiedItems": [
    {
      "category": "Category (e.g., Structural, Civil, Electrical, Plumbing, Finishing, HVAC)",
      "description": "Detailed description of the item",
      "quantity": number,
      "unit": "Unit of measurement (e.g., m³, m², kg, tons, units, lot)",
      "estimatedRate": number,
      "confidence": number (0-100)
    }
  ],
  "projectType": "Type of construction project",
  "totalEstimatedCost": number,
  "accuracy": number (85-98),
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Risk factor or recommendation"
  ]
}

Guidelines:
- Extract quantities from drawings, BOQs, specifications
- Use current market rates for your estimates
- Categories: Structural, Civil, Electrical, Plumbing, Finishing, HVAC, Site Work
- Be conservative with confidence scores
- Include material and labor costs
- Consider regional cost variations
- Identify potential cost risks
- Provide actionable insights

Respond only with valid JSON.`;
  }

  private parseAIResponse(response: string): DocumentAnalysisResult {
    try {
      // Extract JSON from response (in case there's additional text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.identifiedItems || !Array.isArray(parsed.identifiedItems)) {
        throw new Error('Invalid response format: missing identifiedItems');
      }

      return {
        extractedText: parsed.extractedText || 'Document analyzed',
        identifiedItems: parsed.identifiedItems.map((item: any) => ({
          category: item.category || 'General',
          description: item.description || 'Construction item',
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'unit',
          estimatedRate: Number(item.estimatedRate) || 0,
          confidence: Number(item.confidence) || 80
        })),
        projectType: parsed.projectType || 'Construction Project',
        totalEstimatedCost: Number(parsed.totalEstimatedCost) || 0,
        accuracy: Number(parsed.accuracy) || 85,
        insights: Array.isArray(parsed.insights) ? parsed.insights : []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback result
      return {
        extractedText: 'Document processed with limited analysis',
        identifiedItems: [],
        projectType: 'Construction Project',
        totalEstimatedCost: 0,
        accuracy: 75,
        insights: ['AI analysis encountered an error. Manual review recommended.']
      };
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.openai) providers.push('openai');
    if (this.anthropic) providers.push('anthropic');
    if (this.googleAI) providers.push('google');
    return providers;
  }
}

export const aiProviderService = new AIProviderService();