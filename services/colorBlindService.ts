
import { ColorBlindResult, Severity } from '../types';

export interface Plate {
  id: number;
  correctAnswer: string;
}

// Full plates database - kept for reference
const allPlatesDatabase: Plate[] = [
  { id: 1, correctAnswer: '12' }, { id: 2, correctAnswer: '8' },
  { id: 3, correctAnswer: '29' }, { id: 4, correctAnswer: '5' },
  { id: 5, correctAnswer: '3' }, { id: 6, correctAnswer: '15' },
  { id: 7, correctAnswer: '74' }, { id: 8, correctAnswer: '6' },
  { id: 9, correctAnswer: '45' }, { id: 10, correctAnswer: '7' },
  { id: 11, correctAnswer: '16' }, { id: 12, correctAnswer: '73' },
  { id: 13, correctAnswer: '2' }, { id: 14, correctAnswer: '97' },
  { id: 15, correctAnswer: '42' }, { id: 16, correctAnswer: '35' },
  { id: 17, correctAnswer: '96' }, { id: 18, correctAnswer: '5' },
  { id: 19, correctAnswer: 'nothing' }, { id: 20, correctAnswer: 'nothing' },
  { id: 21, correctAnswer: '26' }, { id: 22, correctAnswer: '45' },
  { id: 23, correctAnswer: 'nothing' }, { id: 24, correctAnswer: 'nothing' },
  { id: 25, correctAnswer: '56' }, { id: 26, correctAnswer: '25' },
  { id: 27, correctAnswer: 'nothing' }, { id: 28, correctAnswer: '6' },
  { id: 29, correctAnswer: 'nothing' }, { id: 30, correctAnswer: '8' },
];

// IMPROVEMENT #2: Selected 12 most diagnostic plates for better UX (takes ~5-7 minutes instead of 15-20)
const allPlates: Plate[] = [
  { id: 1, correctAnswer: '12' },   // Classic protanopia/deuteranopia test
  { id: 2, correctAnswer: '8' },    // Red-green deficiency
  { id: 3, correctAnswer: '29' },   // Moderate difficulty
  { id: 5, correctAnswer: '3' },    // Protanopia specific
  { id: 6, correctAnswer: '15' },   // Deuteranopia specific
  { id: 7, correctAnswer: '74' },   // Complex number
  { id: 9, correctAnswer: '45' },   // Severe deficiency test
  { id: 11, correctAnswer: '16' },  // Mixed difficulty
  { id: 15, correctAnswer: '42' },  // High difficulty
  { id: 19, correctAnswer: 'nothing' }, // Hidden digit for normal vision
  { id: 23, correctAnswer: 'nothing' }, // Reverse plate (colorblind sees, normal doesn't)
  { id: 25, correctAnswer: '56' },  // Final complex test
];

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export class ColorBlindTestService {
  private userAnswers: Map<number, string> = new Map();
  private startTime: number = 0;
  private currentTestPlates: Plate[] = [];

  startTest(): Plate[] {
    this.startTime = Date.now();
    this.userAnswers.clear();
    // IMPROVEMENT #2: Use optimized set of 12 diagnostic plates, shuffled for better UX
    this.currentTestPlates = shuffleArray(allPlates);
    return this.currentTestPlates;
  }

  submitAnswer(plateId: number, userAnswer: string): void {
    // Store answer in lowercase for consistent comparison
    this.userAnswers.set(plateId, userAnswer.trim().toLowerCase());
  }

  calculateResult(): ColorBlindResult {
    const total = this.currentTestPlates.length;
    let correct = 0;
    const missedPlates: { plate: number; correctAnswer: string; userAnswer: string }[] = [];

    this.currentTestPlates.forEach(plate => {
      const userAnswer = this.userAnswers.get(plate.id) || '';
      // FIX BUG #3 & #4: Compare both in lowercase for case-insensitive matching
      const correctAnswer = plate.correctAnswer.toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      } else {
        missedPlates.push({ plate: plate.id, correctAnswer: plate.correctAnswer, userAnswer });
      }
    });

    const accuracy = (correct / total) * 100;
    let severity: Severity;
    let type: ColorBlindResult['type'];

    // IMPROVEMENT #2: Updated severity thresholds for 12 plates
    if (accuracy >= 90) { // >= 11 correct out of 12
        severity = 'NONE';
        type = 'Normal';
    } else if (accuracy >= 75) { // 9-10 correct
        severity = 'LOW';
        type = 'Red-Green Deficiency';
    } else if (accuracy >= 50) { // 6-8 correct
        severity = 'MEDIUM';
        type = 'Red-Green Deficiency';
    } else { // < 6 correct
        severity = 'HIGH';
        type = 'Possible Total Color Blindness';
    }

    return {
      correct,
      total,
      accuracy: Math.round(accuracy),
      missedPlates,
      type,
      severity,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}
