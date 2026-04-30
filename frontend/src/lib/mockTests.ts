
export interface TestQuestion {
  id: string;
  type: 'writing_email' | 'writing_survey' | 'listening' | 'reading_choice';
  title?: string; // e.g. "Practice Task" or "The beginning of Part 1"
  instructionTitle?: string; // e.g., "Read the following information"
  contextTitle?: string; // e.g., "Construction Safety Concern"
  contextText?: string; // The main reading text
  importantNote?: string; // e.g. "Read the information on top before writing."
  questionText: string; // The actual question prompt
  options?: any[]; // For multiple choice (changed to any[] to match usage in TestRunner where options have id/text)
  correctAnswer?: string | number; // For the result screen
  userAnswer?: string; // Placeholder for state
  image?: string; // For listening tasks
  wordLimit?: number;
  // Added fields to match usage in TestRunnerScreen
  context?: string;
  audioUrl?: string;
  correctOptionId?: number;
  text?: string;
}

export interface Test {
  id: string;
  title: string;
  timeLimit?: number; // in seconds
  duration: number; // in minutes (added to match usage)
  questions: TestQuestion[];
}

// Helper function to get a test by ID
export const getTest = async (id: string): Promise<Test | null> => {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_TESTS.find(t => t.id === id) || null;
};

export const MOCK_TESTS: Test[] = [
  {
    id: '01',
    title: 'General Knowledge Test',
    duration: 10,
    questions: [
      {
        id: '1',
        type: 'reading_choice',
        text: 'What is the capital of France?',
        questionText: 'What is the capital of France?',
        options: [
          { id: 1, text: 'London' },
          { id: 2, text: 'Berlin' },
          { id: 3, text: 'Paris' },
          { id: 4, text: 'Madrid' }
        ],
        correctOptionId: 3
      },
      {
        id: '2',
        type: 'reading_choice',
        text: 'Which planet is known as the Red Planet?',
        questionText: 'Which planet is known as the Red Planet?',
        options: [
          { id: 1, text: 'Mars' },
          { id: 2, text: 'Venus' },
          { id: 3, text: 'Jupiter' },
          { id: 4, text: 'Saturn' }
        ],
        correctOptionId: 1
      }
    ]
  },
  {
    id: '02',
    title: 'English Grammar Test',
    duration: 15,
    questions: [
      {
        id: '1',
        type: 'reading_choice',
        text: 'Choose the correct form: "She ___ to the store yesterday."',
        questionText: 'Choose the correct form: "She ___ to the store yesterday."',
        options: [
            { id: 1, text: 'go' },
            { id: 2, text: 'goes' },
            { id: 3, text: 'went' },
            { id: 4, text: 'gone' }
        ],
        correctOptionId: 3
      }
    ]
  }
];
