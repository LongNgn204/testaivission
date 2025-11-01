
import { AmslerGridResult, Severity } from '../types';

export class AmslerGridTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(distortedAreas: string[], symptoms: string[]): Omit<AmslerGridResult, 'details'> {
    const issueDetected = distortedAreas.length > 0 || symptoms.length > 0;
    let severity: Severity = 'NONE';

    if (issueDetected) {
      // FIX BUG #6: Refined severity scoring with LOW/MEDIUM/HIGH levels
      const areaScore = distortedAreas.length;
      const symptomScore = symptoms.length;
      const totalScore = areaScore + (symptomScore * 1.5); // Symptoms have more weight
      
      if (totalScore >= 5 || areaScore >= 4 || symptomScore >= 3) {
        severity = 'HIGH'; // Multiple areas or severe symptoms
      } else if (totalScore >= 2.5 || areaScore >= 2 || symptomScore >= 2) {
        severity = 'MEDIUM'; // Moderate distortion
      } else {
        severity = 'LOW'; // Minimal distortion
      }
    }

    return {
      issueDetected,
      severity,
      distortedQuadrants: distortedAreas,
      symptoms,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}