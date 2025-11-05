import { getOfflineResponse } from './utils/offlineTutor';
import { courses } from "./utils/courses";
import BadgeDisplay from './components/BadgeDisplay';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import './App.css';
import './Chat.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import bugboxLogo from './assets/bugbox-logo.png';
import { filterMessage } from './ContentFilter';
import { generateSystemMessage } from './tutorConfig';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  InputToolbox,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { extractTextFromPDF, extractTextFromImage } from './FileProcessor';
import { extractText } from './FileProcessor.js';

import ChatHistory from './ChatHistory.jsx';
import ProgressBar from './components/ProgressBar';
import useCourseProgress from './hooks/useCourseProgress';
import QuizComponent from './components/QuizComponent';
import IndependentQuiz from './components/IndependentQuiz';
import quizData from './components/quizData.jsx'; 


// === NEW: Certificate Data ===
// === NEW: Certificate Data ===
const certificateData = [
  {
    id: 'web-security',
    badgeName: 'Web Application Security Basics',
    title: 'Certificate of Completion',
    description: 'For successfully completing the Web Application Security Basics course',
    imageUrl: '/certificates/security-certificate.jpg',
    backgroundColor: '#f0f8ff',
    textColor: '#2c3e50'
  },
  {
    id: 'bug-bounty',
    badgeName: 'Introduction to Bug Bounty Hunting', 
    title: 'Bug Bounty Achievement Award',
    description: 'For demonstrating exceptional skills in bug bounty hunting fundamentals',
    imageUrl: '/certificates/bug-bounty-certificate.jpg',
    backgroundColor: '#fff0f5',
    textColor: '#8b4513'
  },
  {
    id: 'pen-testing',
    badgeName: 'Advanced Penetration Testing',
    title: 'Penetration Testing Excellence Certificate',
    description: 'For showing advanced skills in penetration testing techniques',
    imageUrl: '/certificates/pen-testing-certificate.jpg',
    backgroundColor: '#f0fff0',
    textColor: '#006400'
  },
  {
    id: 'iot-security',
    badgeName: 'IoT Security Expert',
    title: 'IoT Security Specialist Certificate',
    description: 'For demonstrating expertise in IoT security and device authentication',
    imageUrl: '/certificates/iot-certificate.jpg',
    backgroundColor: '#fffaf0',
    textColor: '#8b0000'
  },
  {
    id: 'react-developer',
    badgeName: 'React Frontend Developer',
    title: 'React Development Certificate',
    description: 'For building interactive UI components with React and modern frameworks',
    imageUrl: '/certificates/react-certificate.jpg',
    backgroundColor: '#f8f8ff',
    textColor: '#4b0082'
  }
];
const sampleCourse = {
  id: 'intro-course',
  title: 'Introduction to Programming',
  videos: [
    { id: 'vid1', title: 'Basic Robotics', videoId: 'HvMQONnCXbE' },
    { id: 'vid2', title: 'Simple Programming', videoId: 'YrJi_4yc6_c' },
    { id: 'vid3', title: 'Building Robots', videoId: 'xbyEP0M9w7k' },
    { id: 'vid4', title: 'The quiz', videoId: 'RVPhyG0AZFY' }
  ],
  
  steps: [
    { id: 'welcome', type: 'welcome', title: 'Course Welcome' },
    { id: 'video', type: 'video', title: 'Learning Video' },
    { id: 'quiz', type: 'quiz', title: 'Knowledge Check' },
    { id: 'badge', type: 'badge', title: 'Earn Badge' }
  ],
  
  questions: [
    {
      question: "What is the main topic of this video?",
      options: [
        "Learning programming basics",
        "Cooking recipes", 
        "Sports techniques",
        "Music lessons"
      ],
      correctAnswer: 0
    },
    {
      question: "Why is programming important according to the video?",
      options: [
        "It helps solve problems creatively",
        "It makes you popular",
        "It's easy to learn overnight",
        "It requires no practice"
      ],
      correctAnswer: 0
    },
    {
      question: "What should you do after watching this video?",
      options: [
        "Practice what you learned",
        "Forget everything",
        "Watch more videos without practicing",
        "Skip to advanced topics"
      ],
      correctAnswer: 0
    }
  ],
  badge: "Programming Beginner"
};

// === Config ===
const API_KEY = import.meta.env.OPENAI_API_KEY;
const DEBUG = true;
const OPENAI_MODEL = 'gpt-4o';
const MAX_FILE_TEXT = 1000;
const STORAGE_KEY = 'bbx_convos_v2';

function debugLog(...args) { if (DEBUG) console.log(...args); }
const uuid = () => Math.random().toString(36).slice(2, 10);
const greeting = () => ({
  message: "Hello! I'm your Bugbox Tutor. How can I help you?",
  sentTime: 'just now',
  sender: 'ChatGPT',
  direction: 'incoming',
  avatar: '🤖',
});

// ============== App ==============
export default function App() {
  // ---- Conversations state (persisted) ----
  const [convos, setConvos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const first = { id: uuid(), title: 'New chat', messages: [greeting()] };
    return [first];
  });
  const [activeId, setActiveId] = useState(() => (convos[0] ? convos[0].id : undefined));
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(convos)); }, [convos]);

  const activeConvo = useMemo(
    () => convos.find(c => c.id === activeId) ?? convos[0],
    [convos, activeId]
  );
  const messages = activeConvo?.messages ?? [];

  const setActiveMessages = (updater) => {
    setConvos(prev => prev.map(c => {
      if (c.id !== activeConvo.id) return c;
      const next = typeof updater === 'function' ? updater(c.messages) : updater;
      return { ...c, messages: next };
    }));
  };

  const messageInputRef = useRef(null);

  // ---- UI state 
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pendingFileContent, setPendingFileContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showBadges, setShowBadges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [courseFlow, setCourseFlow] = useState({
  active: false,
  stage: 'welcome', // 'welcome', 'video', 'quiz', 'badge'
  currentCourse: null,
  earnedBadges: []
});

const [selectedCertificate, setSelectedCertificate] = useState(null);
const [selectedCourseId, setSelectedCourseId] = useState('intro-course');
const [showCertificateModal, setShowCertificateModal] = useState(false);
const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme ? savedTheme === 'dark' : false;
});
const toggleDarkMode = () => {
  setDarkMode(!darkMode);
};
useEffect(() => {
  const currentTheme = darkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
}, [darkMode]);

  // Onboarding
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');
  
  // Agreements (new) – keep these OUTSIDE of JSX
  const [agreeRespect, setAgreeRespect] = useState(false);
  const [agreeFocus, setAgreeFocus]   = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);
  const [pendingImageData, setPendingImageData] = useState(null); 
// shape: { url, name, mime }

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const { progress, markStepCompleted } = useCourseProgress(selectedCourseId);



  const allAgreed = useMemo(
  () => agreeRespect && agreeFocus && agreeSafety,
  [agreeRespect, agreeFocus, agreeSafety]
  );

  // ---- Sidebar actions ----
  const handleNewChat = () => {
    const c = { id: uuid(), title: 'New chat', messages: [greeting()] };
    setConvos(prev => [c, ...prev]);
    setActiveId(c.id);
    setInputValue('');
    setPendingFileContent('');
    setUploadFileName('');
  };

  const handleDeleteChat = (id) => {
    setConvos(prev => {
      const next = prev.filter(c => c.id !== id);
      if (!next.length) {
        const fresh = { id: uuid(), title: 'New chat', messages: [greeting()] };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const handleRenameChat = (id, title) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  const handleSelectChat = (id) => setActiveId(id);

  // ---- Reset Student Info (only clears active chat) ----
  const resetStudentInfo = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your name, age, and lesson?\nThis will restart the conversation setup.'
    );
    if (!confirmed) return;
    setStudentName(''); setStudentAge(''); setStudentLesson('');
    setActiveMessages([greeting()]);
    setShowModal(true);
  };
  const startCourse = (courseId = 'intro-course') => {
  const course = courses.find(c => c.id === courseId) || sampleCourse;
  setSelectedCourseId(courseId);
  setCourseFlow({
    active: true,
    stage: 'video',
    currentCourse: course,
    earnedBadges: []
  });
};

const completeWelcome = () => {
  if (courseFlow.currentCourse) {
    markStepCompleted('welcome', courseFlow.currentCourse.steps.length);
  }
  setCourseFlow(prev => ({ ...prev, stage: 'video' }));
};

const completeVideo = () => {
  if (courseFlow.currentCourse) {
    markStepCompleted('video', courseFlow.currentCourse.steps.length);
  }
  setCourseFlow(prev => ({ ...prev, stage: 'quiz' }));
};

const completeQuiz = (success) => {
  if (success) {
    if (courseFlow.currentCourse) {
      markStepCompleted('quiz', courseFlow.currentCourse.steps.length);
    }
    setCourseFlow(prev => ({
      ...prev,
      stage: 'badge',
      earnedBadges: [...prev.earnedBadges, courseFlow.currentCourse.badge]
    }));
  }
};

const closeCourse = () => {
  setCourseFlow({ active: false, stage: 'welcome', currentCourse: null, earnedBadges: [] });
};

const handleBadgeClick = (badgeName) => {
  const certificate = certificateData.find(cert => cert.badgeName === badgeName);
  if (certificate) {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  }
};

const CourseWelcome = ({ onStartCourse, progress }) => (
  <div className="course-welcome">
    <div className="mb-6">
      <ProgressBar progress={progress} label="Overall Progress" color="blue" />
    </div>
    <h2>Welcome to Your First Course! 🎓</h2>
    <p>Get ready to learn programming! This course includes:</p>
    <ul>
      <li>📹 An educational video about programming</li>
      <li>❓ A quick quiz to test your knowledge</li>
      <li>🏆 A digital badge upon completion</li>
    </ul>
    <button className="start-course-btn" onClick={onStartCourse}>
      Let's Begin!
    </button>
  </div>
);

const VideoPlayer = ({ videoId, onVideoComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);

  return (
    <div className="video-section">
      <h3>Watch this programming tutorial:</h3>
      <div className="video-container">
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Programming Tutorial"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onEnded={() => setVideoEnded(true)}
        ></iframe>
      </div>
      {videoEnded && (
        <button className="continue-btn" onClick={onVideoComplete}>
          Continue to Quiz ➡️
        </button>
      )}
    </div>
  );
};

const QuizComponent = ({ questions, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Auto-advance to next question after selection
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      setQuizCompleted(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (quizCompleted) {
    const score = calculateScore();
    const passed = score >= questions.length * 0.7; // 70% to pass

    return (
      <div className="quiz-results">
        <h3>Quiz Complete! 🎉</h3>
        <p>Your score: {score} out of {questions.length}</p>
        {passed ? (
          <div className="success-message">
            <p>Congratulations! You passed! 🏆</p>
            <button 
              className="get-badge-btn" 
              onClick={() => onQuizComplete(true)}
            >
              Claim Your Badge! 🎓
            </button>
          </div>
        ) : (
          <div className="retry-message">
            <p>Don't worry! You can try again.</p>
            <button onClick={() => {
              setCurrentQuestion(0);
              setSelectedAnswers([]);
              setQuizCompleted(false);
            }}>
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz-section">
      <h3>Question {currentQuestion + 1} of {questions.length}</h3>
      <div className="question-card">
        <p className="question-text">{question.question}</p>
        <div className="answer-options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`answer-btn ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BadgeAward = ({ badgeName, onClose }) => (
  <div className="badge-award">
    <div className="badge-animation">✨</div>
    <h2>Congratulations! 🎓</h2>
    <p>You've earned the <strong>{badgeName}</strong> badge!</p>
    <div className="badge-image">
      <div className="badge-icon">🏆</div>
    </div>
    <button className="close-badge-btn" onClick={onClose}>
      Continue Learning
    </button>
  </div>
);

const CertificateModal = ({ certificate, studentName, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-modal-content" style={{ 
        backgroundColor: certificate.backgroundColor,
        color: certificate.textColor
      }}>
        <button className="certificate-close-btn" onClick={onClose}>
          ✕
        </button>
        
        <div className="certificate-header">
          <h2>{certificate.title}</h2>
          <div className="certificate-ribbon">🎓</div>
        </div>
        
        <div className="certificate-body">
          <p className="certificate-awarded-to">This certificate is awarded to</p>
          <h3 className="student-name">{studentName || 'Student'}</h3>
          <p className="certificate-description">{certificate.description}</p>
          <div className="certificate-badge">
            🏆 {certificate.badgeName}
          </div>
          <p className="certificate-date">Date: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="certificate-footer">
          <button className="download-btn" onClick={() => window.print()}>
            📥 Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

  // ---- File upload ----
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setShowUploadPopup(true);
    setUploadFileName(file.name);
    setTimeout(() => setShowUploadPopup(false), 3000);
    processUploadedFile(file);
  };

  const MAX_ATTACHMENT_CHARS = 6000; // keep requests small

const processUploadedFile = async (file) => {
  try {
    setIsTyping(true);

    if (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
      // PDF → text extraction (your existing path)
      const text = await extractTextFromPDF(file);
      const clipped = text && text.length > MAX_ATTACHMENT_CHARS
        ? `${text.slice(0, MAX_ATTACHMENT_CHARS)}… [truncated]`
        : (text || '');

      setPendingFileContent(clipped || '(No text could be extracted)');
      setUploadFileName(file.name);

      // auto-prompt
      // await handleSend('Explain this file.');
      return;
    }

    if (file.type.startsWith('image/')) {
      // IMAGE → send the image itself (vision), no OCR needed
      const url = await fileToDataURL(file);  // e.g. "data:image/png;base64,..."
      setPendingImageData({ url, name: file.name, mime: file.type });
      setUploadFileName(file.name);

      // auto-prompt
      // await handleSend('Explain this image.');
      return;
    }

    // Unsupported type
    setActiveMessages(prev => [...prev, {
      message: 'Sorry, I can only read PDF or image files.',
      direction: 'incoming', sender: 'ChatGPT', position: 'left', avatar: '🤖',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  } catch (err) {
    console.error('Error processing file:', err);
    setActiveMessages(prev => [...prev, {
      message: `Sorry, I couldn't read the file: ${err.message}`,
      direction: 'incoming', sender: 'ChatGPT', position: 'left', avatar: '🤖',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  } finally {
    setIsTyping(false);
  }
};


  // ---- Send message (updates ONLY the active conversation) ----
  const handleSend = async (message) => {
    if (!message || message.trim() === '') return;
  
    const result = filterMessage(message);
    if (!result.allowed) {
      setActiveMessages(prev => [...prev, {
        message: result.reason,
        direction: 'incoming',
        sender: 'ChatGPT',
        avatar: '🤖',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      return;
    }
  
    const userMsg = {
      message,
      direction: 'outgoing',
      sender: 'user',
      position: 'right',
      avatar: '👤',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  
    let messagesForAI;
    let newState;
  
    if (pendingFileContent) {
      const hiddenFileContext = {
        message: `Context from uploaded file:\n\n${pendingFileContent}`,
        direction: 'outgoing',
        sender: 'user',
        position: 'right',
        avatar: '👤',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hidden: true,
      };
      const visibleIndicator = {
        message: `📎 ${uploadFileName || 'File attached'}`,
        direction: 'outgoing',
        sender: 'user',
        position: 'right',
        avatar: '👤',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    
      messagesForAI = [...messages, hiddenFileContext, userMsg];
      newState = [...messages, visibleIndicator, userMsg];
      setPendingFileContent('');
      setUploadFileName('');
    } else if (pendingImageData) {
      // Hidden image message that backend will pass to GPT-4o
      const hiddenImageContext = {
        hidden: true,
        kind: 'image',
        dataUrl: pendingImageData.url,
        alt: uploadFileName || 'uploaded image',
      };
      const visibleIndicator = {
        message: `🖼️ ${uploadFileName || 'Image attached'}`,
        direction: 'outgoing', 
        sender: 'user', 
        position: 'right', 
        avatar: '👤',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    
      messagesForAI = [...messages, hiddenImageContext, userMsg];  // sent to model
      newState = [...messages, visibleIndicator, userMsg];    // shown in UI
    
      setPendingImageData(null);
      setUploadFileName('');
    } else {
      messagesForAI = [...messages, userMsg];
      newState = messagesForAI;
    }

    
  
    setActiveMessages(newState);
  
    // update convo title/preview
    setConvos(prev =>
      prev.map(c => {
        if (c.id !== activeConvo.id) return c;
        const title = c.title === 'New chat' && message.trim()
          ? message.trim().slice(0, 40)
          : c.title;
        const preview = message.trim().slice(0, 60);
        return { ...c, title, preview };
      })
    );
  
    setInputValue('');
    setIsTyping(true);
  
    // ✅ now guaranteed messagesForAI is defined
    await processMessageToChatGPT(messagesForAI);
  };
  
  function toApiMessage(m) {
    // Case 1: Hidden image (we set this in handleSend)
    if (m.hidden && m.kind === 'image' && m.dataUrl) {
      return {
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyse this image for a student and explain the key steps and tips.' },
          { type: 'image_url', image_url: { url: m.dataUrl } }
        ]
      };
    }
  
    // Case 2: Normal text messages
    const role = m.sender === 'ChatGPT' ? 'assistant' : 'user';
    return { role, content: m.message };
  }
  

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = [
      generateSystemMessage(studentName, Number(studentAge), studentLesson),
      {
        role: 'system',
        content: 'Answer concisely (≤150 words). If using bullet points, no blank lines.'
      },
      ...chatMessages.map(toApiMessage)   // <-- use the new helper here
    ];
    

    const systemMessage = generateSystemMessage(studentName, Number(studentAge), studentLesson);

    //Additional system-level guidance to keep responses concise and well-structured
    const styleGuideMessage = {
      role: 'system',
      content:
        'Answer concisely (≤150 words). If using bullet points, do NOT insert blank lines between items. There shuld not be any empty or blank lines whatsoever. Use Markdown formatting where appropriate.'
    };

    const apiRequestBody = {
      model: OPENAI_MODEL,
      messages: [systemMessage, styleGuideMessage, ...apiMessages],
      max_tokens: 300,
      temperature: 0.7,
    };

    debugLog('[API Request Body]', apiRequestBody);

    try {
      const response = await fetch("/.netlify/functions/ask-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [systemMessage, styleGuideMessage, ...apiMessages],
        }),
      });      

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let replyContent = data.reply;
      if (!replyContent) throw new Error("Missing message content from OpenAI.");
      replyContent = replyContent.replace(/\n{2,}/g, '\n');

      const aiMessage = {
        message: replyContent,
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'left',
        avatar: '🤖',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const visible = chatMessages.filter(m => !m.hidden);
      setActiveMessages([...visible, aiMessage]);

      // Update preview to last assistant reply
      setConvos(prev =>
        prev.map(c => c.id === activeConvo.id
          ? { ...c, preview: aiMessage.message.slice(0, 60) }
          : c
        )
      );
    } catch (error) {
      console.error('[processMessageToChatGPT Error]', error);
      
      const userLastMessage = chatMessages[chatMessages.length - 1]?.message || "";
      const fallback = getOfflineResponse(userLastMessage);



      setActiveMessages([
        ...chatMessages,
        {
          message: fallback,
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: '🤖',
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

    // NEW: Handler for hint button click
    const handleHintRequest = () => {
      const hintMessage = "Can I have a hint?"; // Customize this if needed (e.g "Hint please on the current topic!")
      handleSend(hintMessage);
    };

  return (
    <div id="bugbox-popup-root">
      {showUploadPopup && (
        <div 
        className="upload-success-popup">✅ {uploadFileName} uploaded
        </div>
      )}
      {showCertificateModal && (
  <CertificateModal
    certificate={selectedCertificate}
    studentName={studentName}
    onClose={() => setShowCertificateModal(false)}
  />
)}
  
      <div
        className="bugbox-popup"
        style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "stretch" }}
      >
        {/* Slim, controlled sidebar */}
        <ChatHistory
          convos={convos}
          activeId={activeId}
          onNewChat={handleNewChat}
          onSelect={handleSelectChat}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
          sidebarOpen={true}
        />
  
        {/* Right content */}
        <div 

        className={`App ${showBadges ? 'with-badges' : ''}`}
        style={{ flex: 1, minWidth: 0 }}
        
        >
          <div className="bugbox-logo-container">
            <img src={bugboxLogo} alt="BugBox Logo" className="bugbox-logo" />
          </div>
  
        {/* header row: left = Reset, right = Show Badges */}
        {!showModal && !courseFlow.active && (
  <div className="chat-header">
    <button onClick={resetStudentInfo} style={{ backgroundColor: "var(--bugbox-dark-gray)" }}>
      Reset Student Info
    </button>

 
<button
      onClick={toggleDarkMode}
      className="theme-toggle-btn"
      style={{ 
        backgroundColor: "transparent", 
        color: "inherit", 
        padding: "8px 12px", 
        borderRadius: "8px", 
        border: "1px solid currentColor", 
        cursor: "pointer",
        margin: "0 10px",
        fontSize: "1.2rem"
      }}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
    <button
      onClick={startCourse}
      className="start-course-btn"
      style={{ 
        backgroundColor: "#1f1f1f", 
        color: "white", 
        padding: "10px 20px", 
        borderRadius: "8px", 
        border: "none", 
        cursor: "pointer",
        margin: "0 10px"
      }}
    >
      Start Course 
    </button>

    <button
  onClick={() => setShowQuiz((v) => !v)}
  className="take-quiz-btn"
  style={{ backgroundColor: "#1f1f1f", 
        color: "white", 
        padding: "10px 20px", 
        borderRadius: "8px", 
        border: "none", 
        cursor: "pointer",
        margin: "0 10px" }}
>
  Take Quiz 
</button>


    <button
      onClick={() => setShowBadges((v) => !v)}
      className="show-badges-btn"
      style={{ backgroundColor: "var(--bugbox-dark-gray)", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
    >
      {showBadges ? "Hide Badges" : "Show Badges"}
    </button>
  </div>
)}

        {showBadges && !showModal && (
        <div className="badges-holder">
          <BadgeDisplay
            studentName={studentName}
            studentAge={studentAge}
            studentLesson={studentLesson}
            onClose={() => setShowBadges(false)}
            onBadgeClick={handleBadgeClick}
            />
          </div>
        )}


  
          {/* Badges live INSIDE .App */}
          {showBadges && (
            <div className="badges-holder">
              <BadgeDisplay
                studentName={studentName}
                studentAge={studentAge}
                studentLesson={studentLesson}
                onClose={() => setShowBadges(false)}
                onBadgeClick={handleBadgeClick}
              />
            </div>
          )}
  {/* Onboarding modal */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Header */}
      <div className="modal-header">
        <h2>Welcome to Bugbox AI!</h2>
        <p>Before we get going, please agree to the following.</p>
      </div>

      {/* Agreements */}
      <div className="agreement-list">
        <label className="agreement-item">
          <input
            type="checkbox"
            checked={agreeRespect}
            onChange={(e) => setAgreeRespect(e.target.checked)}
          />
          <span>I agree to <strong>be respectful</strong> and treat the AI like a teacher.</span>
        </label>

        <label className="agreement-item">
          <input
            type="checkbox"
            checked={agreeFocus}
            onChange={(e) => setAgreeFocus(e.target.checked)}
          />
          <span>I agree to <strong>stay focused on learning</strong> and use the tutor to help me achieve my goals.</span>
        </label>

        <label className="agreement-item">
          <input
            type="checkbox"
            checked={agreeSafety}
            onChange={(e) => setAgreeSafety(e.target.checked)}
          />
          <span>I agree to <strong>be safe</strong> and never share personal information.</span>
        </label>
      </div>

      {/* Actions */}
      <div className="modal-actions">
        <button
          disabled={!allAgreed}
          onClick={() => {
            if (!allAgreed) return;
            if (inputValue.trim()) handleSend(inputValue);
            setShowModal(false);
          }}
        >
          {inputValue.trim() ? "Send & Start Chat" : "Start Chat"}
        </button>
        <button
          className="secondary"
          disabled={!allAgreed}
          onClick={() => setShowModal(false)}
          title={!allAgreed ? "Please tick all checkboxes first" : undefined}
        >
        </button>
      </div>
    </div>
  </div>
)}

        {/* Course Flow Area */}
{courseFlow.active && (
  <div className="course-flow-container">
    <div className="flex justify-between items-center mb-4">
      <button 
        className="back-to-chat-btn"
        onClick={closeCourse}
        style={{ marginBottom: '20px', backgroundColor: "var(--bugbox-dark-gray)", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        ← Back to Chat
      </button>
      <div className="w-64">
        <ProgressBar 
          progress={progress} 
          label={`${courseFlow.currentCourse?.title} Progress`}
          color="green"
        />
      </div>
    </div>

    {courseFlow.stage === 'welcome' && (
      <CourseWelcome 
        onStartCourse={completeWelcome}
        progress={progress}
      />
    )}

    <div className="video-list max-h-96 overflow-y-auto">
  {sampleCourse.videos.map((vid) => (
    <div key={vid.id} className="video-item p-2 border-b">
      <h3>{vid.title}</h3>
      <iframe
        width="100%"
        height="200"
        src={`https://www.youtube.com/embed/${vid.videoId}`}
        title={vid.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  ))}
</div>


    {courseFlow.stage === 'quiz' && courseFlow.currentCourse && (
      <QuizComponent 
        questions={courseFlow.currentCourse.questions}
        onQuizComplete={completeQuiz}
      />
    )}

    {courseFlow.stage === 'badge' && courseFlow.currentCourse && (
      <BadgeAward 
        badgeName={courseFlow.currentCourse.badge}
        onClose={closeCourse}
      />
    )}
  </div>
)}

{/* Chat area - Only show when course is not active */}
{!showModal && !courseFlow.active && (
  <div className="chat-wrapper">
    <div className="chat-fullbleed">
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={isTyping ? <TypingIndicator content="BugBox is thinking" /> : null}
          >
            {messages.map((message, i) => (
              <Message
                key={i}
                model={{
                  ...message,
                  position: "single",
                  className: message.sender === "user" ? "user-message" : "chatgpt-message",
                  avatar: message.avatar,
                }}
              >
                <Message.CustomContent>
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {message.message}
                  </ReactMarkdown>
                </Message.CustomContent>
              </Message>
            ))}
          </MessageList>

          <MessageInput
            placeholder="Type your message here..."
            value={inputValue}
            onChange={(val) => setInputValue(val)}
            onSend={(msg) => handleSend(msg)}
            attachButton={false}
            autoFocus
            resize="vertical"        // allow vertical resizing
            maxHeight="200px"        // max height before scroll
            ref={messageInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();       // prevent newline
                handleSend(inputValue);   // send message
              }
            }}
          />

            <InputToolbox>
            <button
              type="button"
              onClick={() => document.getElementById("file-upload").click()}
              className="upload-button"
            >
              📎 Upload File
            </button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            {/* Hint button */}
            <button
              type="button"
              onClick={handleHintRequest}
              className="upload-button"
              style={{ marginLeft: '10px' }}
            >
              💡 Hint
            </button>
          </InputToolbox>
        </ChatContainer>
      </MainContainer>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        padding: "20px",
      }}
    />
  </div>
)}
        </div>
      </div>
      {showQuiz && <IndependentQuiz />}
    </div>
  );  
}