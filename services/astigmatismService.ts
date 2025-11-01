
import { AstigmatismResult, Severity, AstigmatismUserInput } from '../types';

export class AstigmatismTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(
    rightEyeSelection: AstigmatismUserInput,
    leftEyeSelection: AstigmatismUserInput
  ): Omit<AstigmatismResult, 'details'> {
    
    const rightEye = {
      hasAstigmatism: rightEyeSelection !== 'none',
      astigmatismType: rightEyeSelection,
    };

    const leftEye = {
      hasAstigmatism: leftEyeSelection !== 'none',
      astigmatismType: leftEyeSelection,
    };
    
    // FIX BUG #5: Refined severity logic based on number of eyes and type
    let overallSeverity: Severity = 'NONE';
    
    const bothEyesAffected = rightEye.hasAstigmatism && leftEye.hasAstigmatism;
    const oneEyeAffected = rightEye.hasAstigmatism || leftEye.hasAstigmatism;
    
    // Check for oblique astigmatism (more complex)
    const hasObliqueAstigmatism = 
      rightEyeSelection === 'oblique' || leftEyeSelection === 'oblique';
    
    if (bothEyesAffected) {
      if (hasObliqueAstigmatism) {
        overallSeverity = 'HIGH'; // Both eyes + oblique = most severe
      } else {
        overallSeverity = 'MEDIUM'; // Both eyes affected
      }
    } else if (oneEyeAffected) {
      if (hasObliqueAstigmatism) {
        overallSeverity = 'MEDIUM'; // One eye with oblique
      } else {
        overallSeverity = 'LOW'; // One eye with simple astigmatism
      }
    }

    return {
      rightEye,
      leftEye,
      overallSeverity,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}