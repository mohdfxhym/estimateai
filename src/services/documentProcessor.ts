import { aiProviderService, AIConfig, DocumentAnalysisResult } from './aiProviders';

export interface ProcessedDocument {
  fileName: string;
  fileType: string;
  content: string | ArrayBuffer;
  analysisResult?: DocumentAnalysisResult;
  error?: string;
}

class DocumentProcessorService {
  async processFile(file: File): Promise<ProcessedDocument> {
    const result: ProcessedDocument = {
      fileName: file.name,
      fileType: file.type,
      content: ''
    };

    try {
      if (file.type === 'application/pdf') {
        result.content = await this.extractPDFText(file);
      } else if (file.type.startsWith('image/')) {
        result.content = await this.fileToArrayBuffer(file);
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        result.content = await this.extractWordText(file);
      } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
        result.content = await this.extractExcelText(file);
      } else {
        // Try to read as text
        result.content = await this.fileToText(file);
      }

      return result;
    } catch (error) {
      result.error = `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return result;
    }
  }

  async analyzeWithAI(
    document: ProcessedDocument,
    config: AIConfig
  ): Promise<ProcessedDocument> {
    if (document.error) {
      return document;
    }

    try {
      const analysisResult = await aiProviderService.analyzeDocument(
        document.content,
        document.fileName,
        config
      );

      return {
        ...document,
        analysisResult
      };
    } catch (error) {
      return {
        ...document,
        error: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async extractPDFText(file: File): Promise<string> {
    // For browser environment, we'll use a simple text extraction
    // In a real implementation, you might want to use PDF.js or send to server
    const arrayBuffer = await this.fileToArrayBuffer(file);
    
    // Simple PDF text extraction (basic implementation)
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(uint8Array);
    
    // Extract readable text between stream objects
    const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs);
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/stream|endstream/g, '').trim())
        .join(' ')
        .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ')
        .trim();
    }

    return 'PDF content detected but text extraction limited. Consider using OCR for better results.';
  }

  private async extractWordText(file: File): Promise<string> {
    // Basic Word document handling
    // In production, you'd want to use mammoth.js or similar
    const arrayBuffer = await this.fileToArrayBuffer(file);
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8');
    
    // This is a very basic extraction - in reality you'd use proper libraries
    return 'Word document detected. Content extraction requires server-side processing for full accuracy.';
  }

  private async extractExcelText(file: File): Promise<string> {
    // Basic Excel handling
    // In production, you'd want to use SheetJS or similar
    return 'Excel spreadsheet detected. Content extraction requires specialized processing for full accuracy.';
  }

  private async fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  getSupportedFileTypes(): string[] {
    return [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
  }
}

export const documentProcessor = new DocumentProcessorService();