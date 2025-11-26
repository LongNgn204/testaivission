/**
 * =================================================================
 * 👁️ SnellenTestService - Logic bài test Snellen (thang điểm + điều kiện dừng)
 * =================================================================
 *
 * THANG ĐIỂM:
 * - Gồm 5 mức (từ dễ → khó): 20/100 → 20/60 → 20/40 → 20/30 → 20/20
 * - Mỗi mức có số câu thử (trials) và ngưỡng qua bài (passThreshold)
 * - Ví dụ 20/20 yêu cầu đúng 4/5 để pass
 *
 * ĐIỀU KIỆN DỪNG:
 * - all_passed: Qua hết các mức (đạt 20/20 hoặc kết thúc do vượt qua mức cuối)
 * - max_extra_attempts: Không đạt ngưỡng pass sau số lần thử + 2 câu bổ sung (thu thập thêm dữ liệu)
 * - failed_threshold: (dự phòng) dùng khi muốn dừng ngay sau khi không đạt pass ở mức hiện tại
 */
import { SnellenResult, VisionScore } from '../types';

interface SnellenQuestion {
  level: number;
  size: number;
  rotation: 0 | 90 | 180 | 270;
}

// Simplified scoring: 20/100 → 20/20 (dễ hiểu với người dùng)
export const levels = [
  { score: '20/100', size: 120, trials: 4, passThreshold: 3 }, // Pass nếu đúng ≥3/4
  { score: '20/60', size: 80, trials: 4, passThreshold: 3 },
  { score: '20/40', size: 50, trials: 4, passThreshold: 3 },
  { score: '20/30', size: 35, trials: 4, passThreshold: 3 },
  { score: '20/20', size: 20, trials: 5, passThreshold: 4 }, // 20/20: yêu cầu 4/5
];

export class SnellenTestService {
  private startTime: number = 0;
  private currentLevelIndex: number = 0;
  private trialCount: number = 0;
  private correctCount: number = 0;
  private currentQuestion: SnellenQuestion | null = null;
  private lastPassedLevel: number = -1;
  private allAnswers: { question: SnellenQuestion, correct: boolean }[] = [];
  private lastRotation: number = -1; // Tránh lặp lại cùng hướng 2 câu liên tiếp
  private stopReason: 'all_passed' | 'failed_threshold' | 'max_extra_attempts' | 'unknown' = 'unknown'

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
        this.stopReason = 'all_passed';
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
          this.stopReason = 'max_extra_attempts';
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

    // Chuẩn hóa raw data + metadata cho AI (Stage 2)
    const rawAnswers = this.allAnswers.map(a => ({
      level: a.question.level,
      size: a.question.size,
      rotation: a.question.rotation,
      correct: a.correct,
    }));

    return {
      score: score as VisionScore,
      accuracy: this.allAnswers.length > 0 ? Math.round((totalCorrect / this.allAnswers.length) * 100) : 0,
      correctAnswers: totalCorrect,
      totalQuestions: this.allAnswers.length,
      duration,
      date: new Date().toISOString(),
      rawAnswers,
      stopCondition: this.stopReason,
      levelAchieved: this.lastPassedLevel,
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