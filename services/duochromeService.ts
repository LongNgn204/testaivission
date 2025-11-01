
import { DuochromeResult, Severity } from '../types';

export type DuochromeUserInput = 'red' | 'green' | 'equal';

export class DuochromeTestService {
  private startTime: number = 0;

  startTest(): void {
    this.startTime = Date.now();
  }

  calculateResult(
    rightEyeSelection: DuochromeUserInput,
    leftEyeSelection: DuochromeUserInput
  ): Omit<DuochromeResult, 'details'> {
    
    const eyeResult = (selection: DuochromeUserInput): 'normal' | 'myopic' | 'hyperopic' => {
        switch (selection) {
            case 'red': return 'myopic';
            case 'green': return 'hyperopic';
            default: return 'normal';
        }
    };
    
    const rightEye = eyeResult(rightEyeSelection);
    const leftEye = eyeResult(leftEyeSelection);
    
    let overallResult: DuochromeResult['overallResult'] = 'normal';
    let severity: Severity = 'NONE';

    // FIX BUG #8: Refined severity grading
    const bothEyesAbnormal = rightEye !== 'normal' && leftEye !== 'normal';
    const oneEyeAbnormal = rightEye !== 'normal' || leftEye !== 'normal';
    
    if (bothEyesAbnormal) {
      if (rightEye === leftEye) {
        // Both eyes same condition
        overallResult = rightEye;
        severity = 'MEDIUM'; // Both eyes need correction
      } else {
        // Different conditions (anisometropia - most complex)
        overallResult = 'mixed';
        severity = 'HIGH'; // Requires different prescriptions for each eye
      }
    } else if (oneEyeAbnormal) {
      // Only one eye abnormal
      overallResult = rightEye !== 'normal' ? rightEye : leftEye;
      severity = 'LOW';
    }

    return {
      rightEye,
      leftEye,
      overallResult,
      severity,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}