// Data Collection Service for Training Custom ML Models
// This service handles collecting and managing training data

import { supabase } from '../lib/supabase';

export interface ProjectTrainingData {
  projectId: string;
  projectName: string;
  projectType: string;
  documents: DocumentTrainingData[];
  actualCosts: ActualCostData[];
  userAnnotations: UserAnnotation[];
  qualityScore: number;
  completionDate: string;
  region: string;
}

export interface DocumentTrainingData {
  documentId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  documentType: 'drawing' | 'boq' | 'specification' | 'other';
  extractedText?: string;
  annotations: {
    quantities: QuantityAnnotation[];
    boundingBoxes: BoundingBoxAnnotation[];
    classifications: ClassificationAnnotation[];
  };
  processingMetadata: {
    ocrConfidence?: number;
    imageQuality?: number;
    textDensity?: number;
  };
}

export interface ActualCostData {
  itemId: string;
  category: string;
  description: string;
  estimatedQuantity: number;
  actualQuantity: number;
  estimatedRate: number;
  actualRate: number;
  estimatedTotal: number;
  actualTotal: number;
  unit: string;
  variance: number;
  varianceReason?: string;
}

export interface QuantityAnnotation {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  confidence: number;
  source: 'manual' | 'ocr' | 'ai';
  location?: {
    page?: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  verifiedBy?: string;
  verificationDate?: string;
}

export interface BoundingBoxAnnotation {
  id: string;
  type: 'text' | 'table' | 'drawing' | 'dimension';
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: string;
  confidence: number;
}

export interface ClassificationAnnotation {
  documentType: string;
  projectType: string;
  complexity: 'low' | 'medium' | 'high';
  confidence: number;
  tags: string[];
}

export interface UserAnnotation {
  userId: string;
  annotationType: 'correction' | 'verification' | 'addition';
  targetId: string; // ID of the item being annotated
  originalValue: any;
  correctedValue: any;
  confidence: number;
  timestamp: string;
  notes?: string;
}

class DataCollectionService {
  private annotationBuffer: UserAnnotation[] = [];

  // Collect training data from completed projects
  async collectProjectTrainingData(projectId: string): Promise<ProjectTrainingData | null> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('status', 'completed')
        .single();

      if (projectError || !project) {
        console.error('Error fetching project:', projectError);
        return null;
      }

      // Get project files
      const { data: files, error: filesError } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId);

      if (filesError) {
        console.error('Error fetching files:', filesError);
        return null;
      }

      // Get estimation items (predicted costs)
      const { data: estimationItems, error: itemsError } = await supabase
        .from('estimation_items')
        .select('*')
        .eq('project_id', projectId);

      if (itemsError) {
        console.error('Error fetching estimation items:', itemsError);
        return null;
      }

      // Get user annotations
      const annotations = await this.getUserAnnotations(projectId);

      // Process documents and create training data
      const documents: DocumentTrainingData[] = [];
      for (const file of files || []) {
        const docData = await this.processDocumentForTraining(file);
        if (docData) {
          documents.push(docData);
        }
      }

      // Create actual cost data (placeholder - would come from user input)
      const actualCosts: ActualCostData[] = (estimationItems || []).map(item => ({
        itemId: item.id,
        category: item.category,
        description: item.description,
        estimatedQuantity: item.quantity,
        actualQuantity: item.quantity * (0.9 + Math.random() * 0.2), // Simulated variance
        estimatedRate: item.rate,
        actualRate: item.rate * (0.95 + Math.random() * 0.1), // Simulated variance
        estimatedTotal: item.amount,
        actualTotal: item.amount * (0.95 + Math.random() * 0.1),
        unit: item.unit,
        variance: 0 // Will be calculated
      }));

      // Calculate variances
      actualCosts.forEach(cost => {
        cost.variance = ((cost.actualTotal - cost.estimatedTotal) / cost.estimatedTotal) * 100;
      });

      const trainingData: ProjectTrainingData = {
        projectId: project.id,
        projectName: project.name,
        projectType: project.type,
        documents,
        actualCosts,
        userAnnotations: annotations,
        qualityScore: this.calculateQualityScore(documents, actualCosts, annotations),
        completionDate: project.updated_at,
        region: 'US' // Would be determined from project location
      };

      // Store training data
      await this.storeTrainingData(trainingData);

      return trainingData;

    } catch (error) {
      console.error('Error collecting training data:', error);
      return null;
    }
  }

  private async processDocumentForTraining(file: any): Promise<DocumentTrainingData | null> {
    try {
      // Download file content for analysis
      const { data: fileData, error } = await supabase.storage
        .from('project-files')
        .download(file.file_url);

      if (error || !fileData) {
        console.error('Error downloading file:', error);
        return null;
      }

      // Determine document type
      const documentType = this.classifyDocumentType(file.file_name, file.file_type);

      // Extract text if possible
      const extractedText = await this.extractTextFromFile(fileData, file.file_type);

      // Create placeholder annotations (would be populated by annotation tools)
      const annotations = {
        quantities: await this.extractQuantityAnnotations(extractedText, documentType),
        boundingBoxes: await this.extractBoundingBoxes(fileData, file.file_type),
        classifications: [{
          documentType,
          projectType: 'Commercial Building', // Would be determined from context
          complexity: 'medium' as const,
          confidence: 0.8,
          tags: ['construction', 'estimation']
        }]
      };

      const processingMetadata = {
        ocrConfidence: extractedText ? 0.85 : undefined,
        imageQuality: file.file_type.startsWith('image/') ? 0.9 : undefined,
        textDensity: extractedText ? extractedText.length / 1000 : undefined
      };

      return {
        documentId: file.id,
        fileName: file.file_name,
        fileType: file.file_type,
        fileUrl: file.file_url,
        documentType,
        extractedText,
        annotations,
        processingMetadata
      };

    } catch (error) {
      console.error('Error processing document for training:', error);
      return null;
    }
  }

  private classifyDocumentType(fileName: string, fileType: string): DocumentTrainingData['documentType'] {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
      return 'boq';
    } else if (['docx', 'doc', 'txt'].includes(extension || '')) {
      return 'specification';
    } else if (fileType.startsWith('image/') || extension === 'pdf') {
      return 'drawing';
    }
    
    return 'other';
  }

  private async extractTextFromFile(fileData: Blob, fileType: string): Promise<string | undefined> {
    // Basic text extraction - would be enhanced with proper OCR
    if (fileType === 'text/plain') {
      return await fileData.text();
    }
    
    // For other file types, would use OCR or specialized parsers
    return undefined;
  }

  private async extractQuantityAnnotations(
    text: string | undefined,
    documentType: DocumentTrainingData['documentType']
  ): Promise<QuantityAnnotation[]> {
    if (!text) return [];

    // Basic pattern matching for quantities (would be enhanced with NLP)
    const quantityPatterns = [
      /(\d+(?:\.\d+)?)\s*(m³|m²|m|kg|tons?|units?|lots?)/gi,
      /(\d+(?:\.\d+)?)\s*(cubic\s*meters?|square\s*meters?|meters?|kilograms?)/gi
    ];

    const annotations: QuantityAnnotation[] = [];
    let annotationId = 1;

    for (const pattern of quantityPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        annotations.push({
          id: `qty_${annotationId++}`,
          item: `Item extracted from ${documentType}`,
          quantity: parseFloat(match[1]),
          unit: match[2],
          confidence: 0.7,
          source: 'ocr',
          location: {
            x: 0, // Would be determined from OCR
            y: 0,
            width: 100,
            height: 20
          }
        });
      }
    }

    return annotations;
  }

  private async extractBoundingBoxes(
    fileData: Blob,
    fileType: string
  ): Promise<BoundingBoxAnnotation[]> {
    // Placeholder for computer vision-based bounding box extraction
    // Would use libraries like OpenCV or cloud vision APIs
    
    return [
      {
        id: 'bbox_1',
        type: 'table',
        coordinates: { x: 100, y: 200, width: 400, height: 300 },
        content: 'Quantity table',
        confidence: 0.85
      }
    ];
  }

  private async getUserAnnotations(projectId: string): Promise<UserAnnotation[]> {
    // Get user annotations from database
    // This would be a separate table for storing user corrections and feedback
    
    try {
      const { data, error } = await supabase
        .from('user_annotations')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching user annotations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user annotations:', error);
      return [];
    }
  }

  private calculateQualityScore(
    documents: DocumentTrainingData[],
    actualCosts: ActualCostData[],
    annotations: UserAnnotation[]
  ): number {
    let score = 0.5; // Base score

    // Document quality
    const avgDocConfidence = documents.reduce((sum, doc) => {
      const avgAnnotationConfidence = doc.annotations.quantities.reduce(
        (qSum, q) => qSum + q.confidence, 0
      ) / (doc.annotations.quantities.length || 1);
      return sum + avgAnnotationConfidence;
    }, 0) / (documents.length || 1);

    score += avgDocConfidence * 0.3;

    // Cost accuracy
    const avgVariance = actualCosts.reduce((sum, cost) => sum + Math.abs(cost.variance), 0) / (actualCosts.length || 1);
    const accuracyScore = Math.max(0, 1 - avgVariance / 100); // Lower variance = higher score
    score += accuracyScore * 0.4;

    // User verification
    const verificationScore = annotations.filter(a => a.annotationType === 'verification').length / (annotations.length || 1);
    score += verificationScore * 0.3;

    return Math.min(score, 1.0);
  }

  private async storeTrainingData(trainingData: ProjectTrainingData): Promise<void> {
    try {
      // Store in a dedicated training data table
      const { error } = await supabase
        .from('training_data')
        .insert({
          project_id: trainingData.projectId,
          project_name: trainingData.projectName,
          project_type: trainingData.projectType,
          data: trainingData,
          quality_score: trainingData.qualityScore,
          completion_date: trainingData.completionDate,
          region: trainingData.region,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing training data:', error);
      } else {
        console.log('Training data stored successfully for project:', trainingData.projectId);
      }
    } catch (error) {
      console.error('Error storing training data:', error);
    }
  }

  // Public methods for annotation and feedback

  async submitUserAnnotation(annotation: UserAnnotation): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_annotations')
        .insert({
          user_id: annotation.userId,
          annotation_type: annotation.annotationType,
          target_id: annotation.targetId,
          original_value: annotation.originalValue,
          corrected_value: annotation.correctedValue,
          confidence: annotation.confidence,
          timestamp: annotation.timestamp,
          notes: annotation.notes
        });

      if (error) {
        console.error('Error submitting annotation:', error);
      } else {
        console.log('User annotation submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting annotation:', error);
    }
  }

  async getTrainingDataStats(): Promise<{
    totalProjects: number;
    totalDocuments: number;
    totalAnnotations: number;
    avgQualityScore: number;
    dataByRegion: { [region: string]: number };
    dataByType: { [type: string]: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('*');

      if (error) {
        console.error('Error fetching training data stats:', error);
        return {
          totalProjects: 0,
          totalDocuments: 0,
          totalAnnotations: 0,
          avgQualityScore: 0,
          dataByRegion: {},
          dataByType: {}
        };
      }

      const stats = {
        totalProjects: data.length,
        totalDocuments: data.reduce((sum, item) => sum + (item.data.documents?.length || 0), 0),
        totalAnnotations: data.reduce((sum, item) => sum + (item.data.userAnnotations?.length || 0), 0),
        avgQualityScore: data.reduce((sum, item) => sum + item.quality_score, 0) / data.length,
        dataByRegion: {} as { [region: string]: number },
        dataByType: {} as { [type: string]: number }
      };

      // Group by region and type
      data.forEach(item => {
        stats.dataByRegion[item.region] = (stats.dataByRegion[item.region] || 0) + 1;
        stats.dataByType[item.project_type] = (stats.dataByType[item.project_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating training data stats:', error);
      return {
        totalProjects: 0,
        totalDocuments: 0,
        totalAnnotations: 0,
        avgQualityScore: 0,
        dataByRegion: {},
        dataByType: {}
      };
    }
  }

  async exportTrainingData(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('*');

      if (error) {
        console.error('Error exporting training data:', error);
        return '';
      }

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Convert to CSV format
        const headers = ['project_id', 'project_name', 'project_type', 'quality_score', 'region', 'completion_date'];
        const csvRows = [headers.join(',')];
        
        data.forEach(item => {
          const row = [
            item.project_id,
            `"${item.project_name}"`,
            item.project_type,
            item.quality_score,
            item.region,
            item.completion_date
          ];
          csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Error exporting training data:', error);
      return '';
    }
  }
}

export const dataCollectionService = new DataCollectionService();