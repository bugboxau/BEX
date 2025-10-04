export const courses = [
  {
    id: 'intro-robotics',
    title: "Intro to Robotics",
    videoId: "HvMQONnCXbE", // YouTube URL
    steps: [
      { id: 'welcome', type: 'welcome', title: 'Course Welcome' },
      { id: 'video', type: 'video', title: 'Learning Video' },
      { id: 'quiz', type: 'quiz', title: 'Knowledge Check' },
      { id: 'badge', type: 'badge', title: 'Earn Badge' }
    ],
    questions: [
      {
        question: "Robots can move using?",
        options: ["Sensors", "Motors", "Code", "All of the above"],
        correctAnswer: 3 // Index of correct answer (0-based)
      }
    ],
    badge: "Intro to Robotics Badge"
  },
  {
    id: 'cyber-security-basics',
    title: "Cyber Security Basics",
    videoId: "l7SwiFWOQqM",
    steps: [
      { id: 'welcome', type: 'welcome', title: 'Course Welcome' },
      { id: 'video', type: 'video', title: 'Learning Video' },
      { id: 'quiz', type: 'quiz', title: 'Knowledge Check' },
      { id: 'badge', type: 'badge', title: 'Earn Badge' }
    ],
    questions: [
      {
        question: "Which of the following is a strong password?",
        options: ["password123", "Qwerty", "MyName2020", "X$7gT!9kL@"],
        correctAnswer: 3
      }
    ],
    badge: "Cyber Security Basics Badge"
  },
  {
    id: 'ai-introduction',
    title: "Introduction to AI",
    videoId: "JMUxmLyrhSk",
    steps: [
      { id: 'welcome', type: 'welcome', title: 'Course Welcome' },
      { id: 'video', type: 'video', title: 'Learning Video' },
      { id: 'quiz', type: 'quiz', title: 'Knowledge Check' },
      { id: 'badge', type: 'badge', title: 'Earn Badge' }
    ],
    questions: [
      {
        question: "AI stands for?",
        options: ["Artificial Integration", "Artificial Intelligence", "Automatic Internet", "Advanced Information"],
        correctAnswer: 1
      }
    ],
    badge: "Introduction to AI Badge"
  },
  {
    id: 'web-development',
    title: "Web Development Fundamentals",
    videoId: "UB1O30fR-EE",
    steps: [
      { id: 'welcome', type: 'welcome', title: 'Course Welcome' },
      { id: 'video', type: 'video', title: 'Learning Video' },
      { id: 'quiz', type: 'quiz', title: 'Knowledge Check' },
      { id: 'badge', type: 'badge', title: 'Earn Badge' }
    ],
    questions: [
      {
        question: "Which language is used to style web pages?",
        options: ["HTML", "CSS", "JavaScript", "Python"],
        correctAnswer: 1
      }
    ],
    badge: "Web Development Fundamentals Badge"
  }
];
