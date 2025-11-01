import { SnellenResult, VisionScore } from '../types';

interface SnellenQuestion {
  level: number;
  size: number;
  rotation: 0 | 90 | 180 | 270;
}

// Simplified scoring: 20/100 max (easier to understand)
export const levels = [
  { score: '20/100', size: 120, trials: 4, passThreshold: 3 }, // Must get 3/4 to pass
  { score: '20/60', size: 80, trials: 4, passThreshold: 3 },
  { score: '20/40', size: 50, trials: 4, passThreshold: 3 },
  { score: '20/30', size: 35, trials: 4, passThreshold: 3 },
  { score: '20/20', size: 20, trials: 5, passThreshold: 4 }, // Perfect vision: 4/5 required
];

export class SnellenTestService {
  private startTime: number = 0;
  private currentLevelIndex: number = 0;
  private trialCount: number = 0;
  private correctCount: number = 0;
  private currentQuestion: SnellenQuestion | null = null;
  private lastPassedLevel: number = -1;
  private allAnswers: { question: SnellenQuestion, correct: boolean }[] = [];
  private lastRotation: number = -1; // FIX BUG #10: Track last rotation to avoid repeats

  startTest(): void {
    this.startTime = Date.now();
    this.currentLevelIndex = 0;
    this.trialCount = 0;
    this.correctCount = 0;
    this.lastPassedLevel = -1;
    this.allAnswers = [];
    this.lastRotation = -1; // Reset last rotation
  }

  getNextQuestion(): SnellenQuestion | null {
    if (this.currentLevelIndex >= levels.length) {
        console.log('SnellenTest: Test completed - passed all levels!');
        return null; // Test completed by passing all levels
    }

    const currentLevel = levels[this.currentLevelIndex];

    // FIX BUG: Check if we completed all trials for current level
    if (this.trialCount >= currentLevel.trials) {
      console.log(`SnellenTest: Completed ${this.trialCount} trials at level ${this.currentLevelIndex} (${currentLevel.score}). Correct: ${this.correctCount}/${currentLevel.passThreshold} needed`);
      if (this.correctCount >= currentLevel.passThreshold) {
        // PASSED this level
        this.lastPassedLevel = this.currentLevelIndex;
        if (this.currentLevelIndex < levels.length - 1) {
          // Move to next harder level
          this.currentLevelIndex++;
          this.trialCount = 0;
          this.correctCount = 0;
          // Generate first question of next level immediately
          this.currentQuestion = {
            level: this.currentLevelIndex,
            size: levels[this.currentLevelIndex].size,
            rotation: this.randomRotation(),
          };
          return this.currentQuestion;
        } else {
          // Passed the final level (20/20) - Perfect vision!
          return null;
        }
      } else {
        // FAILED this level
        // FIX: Give 2 extra attempts to collect more data
        const extraAttempts = 2;
        if (this.trialCount >= currentLevel.trials + extraAttempts) {
          // Really failed after extra attempts, stop test
          return null;
        }
        // Otherwise, continue with extra questions at same level
        // DON'T reset trialCount - it will keep incrementing
      }
    }

    // Generate question at current level (either initial trials or extra attempts)
    this.currentQuestion = {
      level: this.currentLevelIndex,
      size: levels[this.currentLevelIndex].size,
      rotation: this.randomRotation(),
    };
    
    console.log(`SnellenTest: Generated new question - Level ${this.currentLevelIndex} (${levels[this.currentLevelIndex].score}), Size ${this.currentQuestion.size}px, Rotation ${this.currentQuestion.rotation}°`);
    
    return this.currentQuestion;
  }

  submitAnswer(userRotation: number): boolean {
    if (!this.currentQuestion) {
      console.error('SnellenTest: No current question when submitting answer');
      return false;
    }
    
    // FIX BUG #2: Validate rotation input
    const validRotations = [0, 90, 180, 270];
    if (!validRotations.includes(userRotation)) {
      console.warn(`SnellenTest: Invalid rotation ${userRotation}. Must be 0, 90, 180, or 270.`);
      return false;
    }
    
    const correct = this.currentQuestion.rotation === userRotation;
    this.trialCount++;
    if (correct) {
      this.correctCount++;
    }
    this.allAnswers.push({ question: this.currentQuestion, correct });
    
    // DEBUG: Log progress
    console.log(`SnellenTest: Q${this.allAnswers.length} - Level ${this.currentLevelIndex} (${levels[this.currentLevelIndex].score}) - Trial ${this.trialCount}/${levels[this.currentLevelIndex].trials} - Correct: ${this.correctCount} - Result: ${correct ? '✓' : '✗'}`);
    
    return correct;
  }

  calculateResult(): SnellenResult {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    // Score is the last level fully passed. If no level was passed, result is below 20/100
    const score = this.lastPassedLevel >= 0 ? levels[this.lastPassedLevel].score : 'Dưới 20/100'; 
    const totalCorrect = this.allAnswers.filter(a => a.correct).length;
    
    return {
      score: score as VisionScore,
      accuracy: this.allAnswers.length > 0 ? Math.round((totalCorrect / this.allAnswers.length) * 100) : 0,
      correctAnswers: totalCorrect,
      totalQuestions: this.allAnswers.length,
      duration,
      date: new Date().toISOString(),
    };
  }

  private randomRotation(): 0 | 90 | 180 | 270 {
    // FIX BUG #10: Ensure we don't generate the same rotation twice in a row
    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
    
    // If this is the first question, any rotation is fine
    if (this.lastRotation === -1) {
      const rotation = rotations[Math.floor(Math.random() * 4)];
      this.lastRotation = rotation;
      return rotation;
    }
    
    // Filter out the last rotation to avoid repeats
    const availableRotations = rotations.filter(r => r !== this.lastRotation);
    const rotation = availableRotations[Math.floor(Math.random() * availableRotations.length)];
    this.lastRotation = rotation;
    return rotation;
  }
}