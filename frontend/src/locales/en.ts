export default {
  common: {
    zabanFly: "Zaban Fly",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    or: "Or",
    search: "Search...",
    yes: "Yes",
    no: "No",
    save: "Submit",
    dontHave: "I don't have",
    close: "Close",
    understood: "Understood",
    comingSoon: "Coming Soon",
    viewDetails: "View Details...",
    of: "of"
  },
  login: {
    title: "User Account",
    subtitle: "Please enter your mobile number",
    placeholder: "Mobile Number",
    submit: "Send Verification Code",
    sending: "Sending...",
    guest: "Login as Guest",
    google: "Sign up or Login with Google",
    termsPrefix: "Signing up means accepting the",
    termsLink: "Terms and Conditions",
    termsSuffix: ".",
    invalidFormat: "Invalid mobile number format. (Example: 9123456789)",
    successMessage: "Verification code sent successfully.",
    networkError: "Network error. Please check your internet connection.",
    googleTokenMissing: "Google token not received.",
    googleEmailMissing: "Email not received from Google token.",
    googleLoginSuccess: "Google login successful.",
    googleLoginError: "Error validating with server.",
  },
  terms: {
    title: "Zaban Fly Terms and Conditions",
    subtitle: "Please read the application terms and conditions carefully.",
    p1: "By signing up for Zaban Fly, your data is stored completely encrypted and confidential.",
    p2: "We use advanced technologies to ensure security and privacy so that no third party has access to your information.",
    p3: "To recover your data in the future, you must be registered in the application. This process helps us verify your identity and provide secure access to your data.",
    p4: "By signing up, you agree that your data will be stored and processed in accordance with our Privacy Policy.",
    p5: "For more information, you can read the 'Privacy' section.",
    p6: "Rest assured that your security and privacy are our top priority."
  },
  verify: {
    title: "Verification Code",
    subtitle: "Please enter the verification code sent to {{phone}}",
    resend: "Resend Code",
    resending: "Resending...",
    editPhone: "Edit Mobile Number",
    timerLabel: "Time remaining:",
    success: "Login successful.",
    invalidCode: "The code entered is incorrect.",
    codeResent: "Code resent successfully.",
  },
  nationality: {
    title: "Select Nationality",
    subtitle: "Enter your nationality based on your origin, not your place of residence.",
    button: "Select Nationality",
    warningBody: "Please select your nationality based on your actual origin. Choosing the wrong option may disable features designed for Persian-speaking users.",
  },
  home: {
    welcome: "Hello, welcome to Zaban Fly.",
    searchPlaceholder: "Search in books...",
    start: "Start",
    placementTest: "Placement Test",
    day: "Day",
    parva1: "Parva 1",
    parva2: "Parva 2",
    parva3: "Parva 3",
    nav: {
      home: "Home",
      grammar: "Grammar",
      tests: "Tests",
      menu: "Menu"
    },
    suggestion: {
      title: "Book Suggestion",
      subtitle: "A new book you would like to be added"
    },
    errorLoading: "Error loading book list. Please check your internet connection.",
    apiError: "API URL is not configured.",
    bookPlaceholder: "Dictionary: Persian, English, Sentence",
    downloadClick: "Click to download",
    suggestBookTitle: "Suggest a Book",
    suggestBookSubtitle: "Request new books",
  },
  leitner: {
    status: {
      new: "New Word",
      step1: "Step 1",
      step2: "Step 2",
      step3: "Step 3",
      step4: "Step 4",
      step5: "Final Step",
      mastered: "Mastered",
      default: "New Word"
    },
    info: {
      newTitle: "New Word",
      newDesc: "A word you haven't tested yet. You'll be asked again in 2 days.",
      masteredTitle: "Mastered",
      masteredDesc: "Congrats! You've fully learned this word and it won't be asked again."
    },
    settings: {
      title: "Leitner Settings",
      newWordsCount: "How many new tests besides Leitner?",
      reviewEstimate: "At this speed, you will fully review the book in {{days}} days.",
      customCount: "Custom number of words",
      dontShowAgain: "Don't show this message again",
      invalidCount: "Please enter a valid positive number for words count.",
      save: "Save"
    },
    stats: {
      newWords: "New Leitner Words",
      chart: "Leitner Chart"
    }
  },
  stats: {
    dayStats: "Day Statistics",
    learningStats: "Your learning statistics and results for this day",
    wordStats: "Word Statistics",
    correct: "Correct",
    wrong: "Incorrect",
    scoreCorrect: "Correct Answer Score ({{count}} × 1.5)",
    scoreWrong: "Wrong Answer Penalty ({{count}} × 0.3)",
    bonusAccuracy: "Accuracy Bonus ({{percent}}%)",
    bonusActivity: "Activity Bonus (√{{count}} × 0.1)",
    bonusBook: "Book Bonus ({{count}} × 2)",
    scoreProgress: "Progress Score",
    accuracy: "Accuracy",
    totalQuestions: "Total Questions",
    finalScore: "Final Score",
    performanceLevel: "Performance Level"
  },
  flashcard: {
    settings: {
        faToEn: "Persian to English",
        enToFa: "English to Persian",
        enToEn: "English to English",
        hideOptions: "Hide Options",
        keepOrder: "Keep Leitner question order",
        fontSize: "Font Size",
        defaultSize: "Default Size"
    },
    errors: {
        browserSupport: "Your browser does not support text-to-speech.",
        invalidBookId: "Invalid Book ID",
        noWordsFound: "No (unarchived) words found for review in this session.",
        countError: "Error counting new words.",
        sessionError: "Error starting session.",
        generalError: "An error occurred."
    },
    actions: {
        mastered: "I Know It",
        showOptions: "Show Options",
        archived: "«{{word}}» archived.",
        undo: "Undo",
        backToMenu: "Back to Menu",
        preparing: "Preparing session...",
        counting: "Counting words..."
    }
  },
  suggest: {
    title: "Suggest a Book for Zaban Fly",
    body: "What book could make language learning more exciting? Suggest one for us to add.",
    emailSubject: "Book Suggestion"
  },
  bookSection: {
      flashcard: "Flashcard",
      reading: "Reading",
      spelling: "Spelling",
      pronunciation: "Pronunciation",
      selectSection: "Select Book Section",
      selectPrompt: "Choose which section of the book you want to visit",
      deleteBook: "Delete this book from memory"
  },
  download: {
      decrypting: "Decrypting file...",
      parsing: "Processing words...",
      saving: "Saving to database...",
      receiving: "Receiving file from server...",
      status: "Status:",
      timeLeft: "Time remaining:",
      seconds: "seconds",
      cancel: "Cancel Download"
  },
  daily: {
      listening: "Listening...",
      autoNext: "Auto-play next",
      translateWord: "Translate Word",
      examples: "Examples",
      translateExamples: "Translate Examples",
      moreExamples: "More Examples",
      resetProgress: "Stage progress reset",
      vocabulary: "Vocabulary",
      pronunciation: "Pronunciation",
      spelling: "Spelling",
      reading: "Reading",
      quiz: "Quiz",
      dayTitle: "Day {{day}}",
      noSentence: "No sentence found for this lesson",
      excellent: "Excellent!",
      practiceDone: "Practice finished",
      translate: "Translate",
      startRecord: "Tap microphone to start recording",
      endPractice: "End Practice",
      next: "Next",
      lessonNotFound: "Lesson not found",
      noVocabulary: "No vocabulary found for this lesson",
      noReading: "No reading text found for this lesson",
      noListening: "No listening audio found for this lesson",
      noQuiz: "No quiz found for this lesson",
      noSpelling: "No spelling words found for this lesson",
      readingText: "Reading Text",
      goToQuiz: "Go to Quiz",
      checkAnswer: "Check Answer",
      completed: "Completed",
      readingCompleted: "Reading section completed successfully.",
      playAudio: "Play Audio",
      pauseAudio: "Pause Audio",
      audioTrack: "Audio Track",
      transcript: "Transcript",
      listenCarefully: "Listen carefully",
      quizCompleted: "Quiz Completed",
      score: "Your Score: {{score}} / {{total}}",
      buildWord: "Build the correct word",
      playWord: "Play Word",
      continue: "Continue Lesson",
      lockedDay: "Locked Lesson",
      showTranslation: "Show Translation",
      day: "Day {{count}}",
      popup: {
          message: "Read a section, then we'll move forward together. We are with you.",
          ok: "Okay",
          letsRead: "Let's Read"
      }
  },
  spelling: {
      findWord: "Find the correct word with these letters",
      listenCarefully: "Listen carefully",
      translateWord: "Translate Word",
      checkAnswer: "Check Answer",
      selectLetters: "Select letters...",
      correct: "Well done! Correct",
      wrong: "Wrong, try again",
      endLesson: "Lesson Finished!",
      wordsNotFound: "Words not found",
      loadError: "Error loading words"
  },
  lessons: {
      search: "Search...",
      notFound: "No lessons found. Have you downloaded the book?",
      backToHome: "Back to Home and Download",
      list: "Lessons List"
  },
  grammarList: {
      error: "Error fetching grammar list",
      title: "Grammar Learning",
      level: "Level {{level}}",
      lesson: "Lesson",
      notFound: "No lesson found for this level."
  },
  reading: {
      translateText: "Translate Text"
  },
  menu: {
    dailyChain: "Daily Chain",
    reports: "Reports",
    backup: "Backup / Upload",
    guide: "Books Guide",
    archive: "Archive",
    flashcards: "Memory Recall (Flashcards)",
    settings: "Settings",
    suggestions: "Suggestions and Requests",
    logout: "Logout",
    login: "Login",
    profile: "Profile",
    referralCode: "Referral Code",
    submit: "Submit",
    referralTitle: "Referral Code",
    yourReferralCode: "Your Referral Code",
    stats: {
      friends: "Number of Friends",
      score: "Score",
      opened: "Opened Items",
      locked: "Locked Items"
    },
    survey: "Survey",
    levelTest: "Level Test",
    leitner: "Leitner Boxes",
    otherApps: "Other Apps",
    installApp: "Install Application",
    memoryClearance: "Clear Memory (Flashcards)"
  },
  dialogs: {
    downloading: {
      title: "Downloading Book",
      preparing: "Preparing file",
      description: "Please wait...",
      progress: "{{percent}}%"
    },
    downloadComplete: {
      title: "Download Complete!",
      description: "The book has been successfully downloaded and is ready to use.",
      close: "Close"
    },
    downloadError: {
      title: "Download Error",
      description: "Unfortunately, an error occurred during download or decryption. Please try again.",
      button: "Understood"
    },
    confirmDownload: {
      title: "Download Book",
      description: "Do you want to download \"{{book}}\"?",
      cancel: "Cancel",
      confirm: "Download"
    },
    confirmDelete: {
      title: "Confirm Delete",
      description: "Are you sure you want to delete \"{{book}}\" and all its Leitner data? This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete"
    },
    loginPrompt: {
      title: "Login Required",
      description: "Please login to your account to download and use this book.",
      cancel: "Cancel",
      confirm: "Login"
    }
  },
  favorites: {
    title: "Starred Words",
    starredWords: "Starred Words",
    leitner: "Flashcards (Leitner)",
    loading: "Loading starred words...",
    empty: "No starred words added yet.",
    totalWords: "Total Words",
    reviewToday: "Review Today",
    learned: "Learned",
    leitnerInfo: {
      title: "Leitner Flashcards",
      description: "Information about Leitner flashcards",
      noCards: "According to Leitner method, there are no cards for today.",
      seeReports: "To see results, please visit",
      reportsLink: "Reports",
      referToReports: "section.",
      resetLeitner: "To restart Leitner, please visit the Menu and use Memory Clearance.",
    }
  },
  backup: {
    title: "Online Backup and Restore",
    subtitle: "Online Backup and Restore",
    description: "Your data is securely backed up automatically every 24 hours when connected to the internet. If needed, you can manually back up your data at any time without waiting the full 24 hours, ensuring your peace of mind.",
    loginRequired: "Please sign up or login first.",
    startBackup: "Start Backup",
    success: "Backup completed successfully",
    startRestore: "Restore Data",
    restoreSuccess: "Data restored successfully"
  },
  logoutWarning: {
    title: "You have new data that hasn't been backed up yet.",
    close: "Close",
    backup: "Backup"
  },
  settings: {
    title: "Settings",
    darkMode: "Dark Mode",
    darkModeDesc: "Change app theme to dark mode",
    fontSize: "Font Size",
    fontSizeDesc: "Change text size across the app",
    sound: "Sound",
    soundDesc: "Audio playback settings",
    notifications: "Notifications",
    notificationsDesc: "Manage app notifications",
    answerDisplay: {
      correct: "Show when my answer was correct",
      wrong: "Show when my answer was wrong"
    },
    language: "App Language",
    languageDesc: "Change user interface language (Farsi/English)",
    nationality: "Select Nationality",
    select: "Select",
    accentTitle: "Select accent for words and sentences",
    accent: {
        us: "American",
        uk: "British",
        machine: "Machine"
    },
    leitnerTitle: "Flashcard (Leitner) Settings",
    leitnerDialogMode: "When should the explanation dialog be shown?",
    leitner: {
        correct: "Show when my answer was correct",
        incorrect: "Show when my answer was wrong",
        always: "Always show",
        never: "Never show"
    },
    leitnerOrder: "Preserve Leitner question order",
    defaultSize: "Default Size",
    loremIpsum: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  wordsList: {
    title: "Words List",
    searchPlaceholder: "Search in words...",
    viewMode: "Change View",
    reading: "Reading",
    exam: "Exam"
  },
  grammar: {
    title: "Grammar List",
    lesson: "Lesson",
    startLesson: "Start Lesson"
  },
  tests: {
    question: "Question",
    answerKey: "Correct Answer",
    yourAnswer: "Your Answer",
    result: "Test Result",
    correct: "Correct",
    wrong: "Wrong",
    score: "Score",
    totalQuestions: "Total Questions"
  },
  activity: {
    currentChain: "Current Chain:",
    chartGuide: "Chart Guide",
    noActivity: "No activity recorded",
    score: "Score",
    day: "Day",
    month: {
        ta: "to"
    },
    legend: {
      subtitle: "Score ranges and colors",
      close: "Close",
      level1: "Level 1 (20-39)",
      level2: "Level 2 (40-69)",
      level3: "Level 3 (70-99)",
      level4: "Level 4 (100-139)",
      level5: "Level 5 (140+)",
      failed: "Failed to reach min score 20"
    },
    prize: {
      title: "10-Day Prize",
      desc: "For every 10 days you continue your chain without interruption, one missed day will be automatically repaired, and you will also receive one base point. So just keep going! 😉📆",
      formulaTitle: "Score Calculation Formula:",
      formula: "Daily Score = Correct + Bonus + Progress",
      totalScore: "Total Score",
      bestChain: "Best Chain"
    }
  },
  survey: {
    totalParticipants: "Total Participants 125",
    participantCount: "Participants: {{count}}",
    questions: {
      1: {
        question: "Do you know why we offer all these features for free while others charge for them?",
        options: {
          0: "Because I want this app to be shared and reach a specific audience.",
          1: "I don't know, but I'm curious about the reason.",
          2: "So that everyone can use it, even those who can't afford it."
        }
      },
      2: {
        question: "Do you agree with updating the 4000 Essential English Words data to the 2nd edition?",
        options: {
          0: "Yes",
          1: "No, because I'm in the middle of studying and it will mess up my Leitner."
        }
      },
      3: {
        question: "Did you know there is a very useful book called 'Key Sentences' in the app that can improve your conversation by at least three levels?",
        options: {
          0: "Yeah!",
          1: "Heard of it, haven't read it yet.",
          2: "No, I'll go check it out now.",
          3: "Haven't heard and don't want to hear."
        }
      },
      4: {
        question: "Which mode do you use more?",
        options: {
          0: "Day Mode",
          1: "Night Mode"
        }
      },
      5: {
        question: "How did you find out about Zaban Fly?",
        options: {
          0: "Friends and Acquaintances",
          1: "App Markets",
          2: "Referral Code",
          3: "Other"
        }
      }
    }
  },
  splash: {
    loading: "Receiving data...",
    speed: "Speed: {{speed}}",
    time: "Time: {{time}}",
    gameTitle: "Find the pairs while downloading! 🎮",
    score: "Score: {{score}}",
    poweredBy: "Powered by Zaban Fly Team"
  },
  pwa: {
    promoTitle: "Install Application",
    promoDesc: "Get the main version for faster access, offline capability, and a full-screen experience.",
    installNow: "Install App",
    maybeLater: "Not now, maybe later",
    menuHint: "You can always install it from the app menu",
    iosGuideTitle: "Install on iPhone",
    iosGuideDesc: "To install the app on iPhone, follow these steps:",
    iosNote: "After installation, the app icon will be added to your home screen."
  },
  reports: {
      allBooks: "All Books",
      word: "Word",
      loading: "Loading..."
  },
  bookReport: {
      book: "Book",
      noData: "No data available",
      level: {
          0: "New",
          1: "Once",
          2: "Twice",
          3: "3 Times",
          4: "4 Times",
          5: "5 Times",
          6: "Mastered"
      }
  },
  placementTest: {
      title: "English Placement Test",
      levelTest: "Level Test",
      start: "Start",
      skills: {
          grammar: "Grammar",
          vocabulary: "Vocabulary",
          pronunciation: "Pronunciation",
          reading: "Reading",
          listening: "Listening"
      }
  },
  leitnerBoxes: {
      title: "Leitner Boxes",
      loading: "Loading...",
      favorites: {
          subtitle: "Favorite Words Box"
      },
      defaultBox: "Default box for {{book}}",
      totalCards: "Total Cards",
      todayCards: "Today's Cards",
      accuracy: "Accuracy"
  },
  guide: {
      title: "Books Guide",
      items: {
          1: {
              title: '4000 Essential English Words',
              desc: 'Gradual learning of 4000 most common words expands your vocabulary and helps significantly in conversation, writing, and exams.'
          },
          2: {
              title: 'IELTS Vocabulary',
              desc: 'Targeted key IELTS words significantly improve your skills in Speaking, Writing, Reading, and Listening.'
          },
          3: {
              title: 'IELTS Vocabulary',
              desc: 'Essential IELTS words boost your score in Speaking, Writing, Reading, and Listening.'
          },
          4: {
              title: 'Essential American English Idioms',
              desc: 'An essential and targeted collection of real and common American idioms that makes your conversation fluent and natural like a native!'
          },
          5: {
              title: 'Key English Sentences',
              desc: 'More than 1500 practical sentences that if you memorize (preferably practice from Persian to English), your speaking will become very strong and you will speak much more fluently. This way, you can quickly build sentences in your mind during conversation.'
          },
          6: {
              title: 'Essential English Collocations',
              desc: 'Learning collocations helps you speak and write English more naturally and accurately, sounding like a native speaker.'
          }
      }
  },
  archive: {
      title: "Archive",
      loading: "Loading...",
      empty: "No items found in archive."
  },
  memoryClearance: {
      title: "Memory Clearance (Flashcards)",
      deleteAllBooks: "Delete All Books",
      clearDailyHistory: "Clear Daily History",
      favorites: "Favorites",
      word: "Word",
      dialog: {
          deleteAllBooks: {
              title: "Delete All Books",
              message: "If confirmed, all books and your data will be deleted.",
              desc: "Are you sure you want to clear?"
          },
          clearHistory: {
              title: "Delete History",
              message: "Are you sure you want to delete daily lesson history?"
          },
          favorites: {
              title: "Favorites",
              message: "If confirmed, all favorite words will be deleted."
          },
          deleteBook: {
              message: "If confirmed, all tests for {{book}} ({{count}} words) will be deleted."
          },
          yes: "Yes",
          no: "No"
      }
  },
  suggestions: {
      title: "Suggestions and Requests",
      desc: "To send suggestions or feedback, choose one of the methods below",
      headerTitle: "To send suggestions or feedback,",
      headerSubtitle: "choose one of the methods below:",
      close: "Close"
  },
  testsList: {
      welcome: {
          title: "Welcome Message",
          desc1: "🎉 By inviting each friend,",
          desc1Bold: "10 special items",
          desc1Suffix: "will be unlocked for free for you and your friend! Just with a simple invite, access more content.",
          desc2: "✨ Invite, Learn, Progress!",
          dontShow: "Don't show this message again",
          ok: "OK"
      },
      locked: {
          title: "Locked",
          desc: "Locked Test",
          message: "You need 300 points to unlock this test",
          receive: "Receive",
          scoringSystem: "Scoring System"
      },
      mainTitle: "Complete CELPIP General Questions Package",
      celpipMock: "CELPIP Mock {{num}}",
      loginRequired: "Please login to access locked tests"
  },
  points: {
      title: "Points",
      totalCoins: "Total Coins: {{count}}",
      invite: {
          title: "Invite Friends",
          desc: "Invite Friends: 300",
          button: "Invite Friends"
      },
      chain: {
          title: "Learning Chain",
          desc: "Available Coins: 0",
          button: "Receive"
      },
      daily: {
          title: "Daily Lessons",
          desc: "Available Coins: 0",
          button: "Receive"
      },
      ads: {
          title: "Video Ads",
          desc: "Available Coins: 0",
          button: "Receive"
      },
      history: {
          title: "Points History",
          inviteEvent: "Friend Invite"
      }
  }
};
