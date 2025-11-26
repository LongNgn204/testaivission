
export type VisionScore = '20/20' | '20/30' | '20/40' | '20/60' | '20/100' | 'Dưới 20/100';
export type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type TestType = 'snellen' | 'colorblind' | 'astigmatism' | 'amsler' | 'duochrome';
export type ExerciseType = 'exercise_20_20_20' | 'exercise_palming' | 'exercise_focus_change';
export type AstigmatismUserInput = 'none' | 'vertical' | 'horizontal' | 'oblique';


// For personalized setup
export type AnswerState = {
    worksWithComputer: string;
    wearsGlasses: string;
    goal: string;
};

// New types for personalized routine
export interface RoutineActivity {
  type: 'test' | 'exercise';
  key: TestType | ExerciseType; // A key to identify the activity
  name: string; // Display name from AI
  duration: number; // in minutes
}
export type WeeklyRoutine = Record<string, RoutineActivity[]>; // Keys: Monday, Tuesday, etc.

export interface DashboardInsights {
  score: number;
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_ATTENTION';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  overallSummary: string;
  positives: string[];
  areasToMonitor: string[];
  proTip: string;
}


export interface SnellenResult {
  score: VisionScore;
  accuracy: number; // 0-100
  correctAnswers: number;
  totalQuestions: number;
  duration: number; // seconds
  date: string;
  // Stage 2 – raw data + metadata for AI usage
  rawAnswers?: { level: number; size: number; rotation: number; correct: boolean }[];
  stopCondition?: 'all_passed' | 'failed_threshold' | 'max_extra_attempts' | 'unknown';
  levelAchieved?: number; // last fully passed level index
  deviceInfo?: string; // user agent snapshot
}

export interface ColorBlindResult {
  correct: number;
  total: number;
  accuracy: number;
  missedPlates: { plate: number; correctAnswer: string; userAnswer: string }[];
  type: 'Normal' | 'Red-Green Deficiency' | 'Possible Total Color Blindness';
  severity: Severity;
  date: string;
  duration: number;
  // Stage 2 – raw data + metadata
  rawAnswers?: { plate: number; userAnswer: string; correct: boolean }[];
  deviceInfo?: string;
}

export interface AstigmatismResult {
  rightEye: {
      hasAstigmatism: boolean;
      astigmatismType: AstigmatismUserInput;
  };
  leftEye: {
      hasAstigmatism: boolean;
      astigmatismType: AstigmatismUserInput;
  };
  overallSeverity: Severity;
  date: string;
  duration: number;
  // Stage 2 – metadata
  deviceInfo?: string;
}

export interface AmslerGridResult {
  issueDetected: boolean;
  severity: Severity;
  distortedQuadrants: string[];
  symptoms: string[];
  details: string; // e.g., "Wavy lines in upper-left quadrant."
  date: string;
  duration: number;
  // Stage 2 – metadata
  deviceInfo?: string;
}

export interface DuochromeResult {
  rightEye: 'normal' | 'myopic' | 'hyperopic';
  leftEye: 'normal' | 'myopic' | 'hyperopic';
  overallResult: 'normal' | 'myopic' | 'hyperopic' | 'mixed';
  severity: Severity;
  date: string;
  duration: number;
  // Stage 2 – raw data + metadata
  rawSelections?: { eye: 'right' | 'left'; choice: 'red' | 'green' | 'equal' }[];
  deviceInfo?: string;
}

export type TestResultData = SnellenResult | ColorBlindResult | AstigmatismResult | AmslerGridResult | DuochromeResult;

export interface AIReport {
  id: string;
  testType: TestType;
  timestamp: string;
  totalResponseTime: number;
  // Analysis fields directly from Gemini
  confidence: number; // Scaled to 0-100
  summary: string;
  causes?: string;
  recommendations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  prediction?: string;
  trend?: string; // New field for trend analysis
}

// For storing in localStorage
export interface StoredTestResult {
    id: string;
    testType: TestType;
    date: string;
    resultData: TestResultData;
    report: AIReport;
}

// For Chatbot
export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}