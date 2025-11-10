// =====================================
// Imports – External libs & styles
// =====================================
import { getOfflineResponse } from './utils/offlineTutor';
import { courses } from "./utils/courses";
import BadgeDisplay from './components/BadgeDisplay';
import React, { useEffect, useMemo, useState } from 'react';
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
import { extractTextFromPDF } from './FileProcessor';
import { extractText } from './FileProcessor.js';

import ChatHistory from './ChatHistory.jsx';
import useCourseProgress from './hooks/useCourseProgress';


// === Config ===
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEBUG = true;
const OPENAI_MODEL = 'gpt-4o';
const MAX_FILE_TEXT = 1000;
const STORAGE_KEY = 'bbx_convos_v2';

// =====================================
// Small utilities (debug, uuid, greeting)
// =====================================
function debugLog(...args) { if (DEBUG) console.log(...args); }
const uuid = () => Math.random().toString(36).slice(2, 10);
const greeting = () => ({
  message: "Hello! I'm your BEX your friendly tutor. How can I help you?",
  sentTime: 'just now',
  sender: 'ChatGPT',
  direction: 'incoming',
  avatar: '🤖',
});

// =====================================
// <App/> component
// =====================================
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

// -------------------------------------
// Derived: active conversation + helpers
// -------------------------------------
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

// -------------------------------------
// UI state (chat, files, panels, badges)
// -------------------------------------
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
    stage: 'welcome', // 'welcome', video, quiz and badges have been removed for BBX integration
    currentCourse: null,
    earnedBadges: []
  });
  // Leave this, as removing the courseID and certificate parts may cause issues
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('intro-course');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

// -------------------------------------
// Theme state & persistence (dark/light)
// -------------------------------------
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });
  const toggleDarkMode = () => setDarkMode(v => !v);
  useEffect(() => {
    const currentTheme = darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [darkMode]);

// -------------------------------------
// Onboarding state (modal + student info)
// -------------------------------------
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');

// -------------------------------------
// Agreements (checkboxes) + image buffer
// -------------------------------------
  const [agreeRespect, setAgreeRespect] = useState(false);
  const [agreeFocus, setAgreeFocus]   = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);
  const [pendingImageData, setPendingImageData] = useState(null); // { url, name, mime }

// -------------------------------------
// Helpers (file → data URL, course progress)
// -------------------------------------
  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const { progress, markStepCompleted } = useCourseProgress(selectedCourseId);

// -------------------------------------
// Derived: allAgreed checkbox gate
// -------------------------------------
  const allAgreed = useMemo(
    () => agreeRespect && agreeFocus && agreeSafety,
    [agreeRespect, agreeFocus, agreeSafety]
  );

// =====================================
// Sidebar actions (new/rename/select/delete)
// =====================================  
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

// =====================================
// Reset Student Info (active chat only)
// =====================================
  const resetStudentInfo = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your name, age, and lesson?\nThis will restart the conversation setup.'
    );
    if (!confirmed) return;
    setStudentName(''); setStudentAge(''); setStudentLesson('');
    setActiveMessages([greeting()]);
    setShowModal(true);
  };

// =====================================
// File upload handlers (PDF/image) – BBX: may remove
// =====================================
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setShowUploadPopup(true);
    setUploadFileName(file.name);
    setTimeout(() => setShowUploadPopup(false), 3000);
    processUploadedFile(file);
  };

  const MAX_ATTACHMENT_CHARS = 6000;

// -------------------------------------
// File processing (PDF OCR / image pass-through)
// -------------------------------------
  const processUploadedFile = async (file) => {
    try {
      setIsTyping(true);

      if (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
        const text = await extractTextFromPDF(file);
        const clipped = text && text.length > MAX_ATTACHMENT_CHARS
          ? `${text.slice(0, MAX_ATTACHMENT_CHARS)}… [truncated]`
          : (text || '');
        setPendingFileContent(clipped || '(No text could be extracted)');
        setUploadFileName(file.name);
        return;
      }

      if (file.type.startsWith('image/')) {
        const url = await fileToDataURL(file);
        setPendingImageData({ url, name: file.name, mime: file.type });
        setUploadFileName(file.name);
        return;
      }

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

// =====================================
// Send message pipeline (UI → state → API)
// =====================================
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

      messagesForAI = [...messages, hiddenImageContext, userMsg];
      newState = [...messages, visibleIndicator, userMsg];

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

    await processMessageToChatGPT(messagesForAI);
  };

// -------------------------------------
// Adapter: Chatscope message → OpenAI format
// -------------------------------------
  function toApiMessage(m) {
    if (m.hidden && m.kind === 'image' && m.dataUrl) {
      return {
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyse this image for a student and explain the key steps and tips.' },
          { type: 'image_url', image_url: { url: m.dataUrl } }
        ]
      };
    }
    const role = m.sender === 'ChatGPT' ? 'assistant' : 'user';
    return { role, content: m.message };
  }

// -------------------------------------
// API call: ask-bot (local server / Netlify fallback)
// -------------------------------------
  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = [
      generateSystemMessage(studentName, Number(studentAge), studentLesson),
      { role: 'system', content: 'Answer concisely (≤150 words). If using bullet points, no blank lines.' },
      ...chatMessages.map(toApiMessage)
    ];

    const systemMessage = generateSystemMessage(studentName, Number(studentAge), studentLesson);
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
      //Vercel Deployment. 
      try {
      const response = await fetch("/api/ask-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemMessage, styleGuideMessage, ...apiMessages] }),
      });

      //Local Development - Run with npm run dev, and node src/server.js in another
      //command prompt tab
      /*
      try {
      const response = await fetch("http://localhost:3001/api/ask-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemMessage, styleGuideMessage, ...apiMessages] }),
      });
      */
           
      //Return to Netlify if required
      /*
      try {
      const response = await fetch(".netlify/functions/ask-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [systemMessage, styleGuideMessage, ...apiMessages] }),
      });
      */

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

// =====================================
// Shortcut actions (Hint button)
// =====================================
  const handleHintRequest = () => {
    const hintMessage = "Can I have a hint?";
    handleSend(hintMessage);
  };

  return (
    <div id="bugbox-popup-root">
      {showUploadPopup && (
        <div className="upload-success-popup">✅ {uploadFileName} uploaded</div>
      )}

      {showCertificateModal && (
        <CertificateModal
          certificate={selectedCertificate}
          studentName={studentName}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      <div className="bugbox-popup" style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "stretch" }}>
        {/* Sidebar */}
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
        <div className={`App ${showBadges ? 'with-badges' : ''}`} style={{ flex: 1, minWidth: 0 }}>
          <div className="bugbox-logo-container">
            <img src={bugboxLogo} alt="BugBox Logo" className="bugbox-logo" />
          </div>

          {/* Header row: Reset (left) + Theme toggle (right) */}
          {!showModal && !courseFlow.active && (
            <div className="chat-header">
              <button onClick={resetStudentInfo}>Reset Student Info</button>
              <button
                onClick={toggleDarkMode}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          )}
          {/* Onboarding modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Welcome to Project Bugbox!</h2>
                  <p>Before we get going, please agree to the following.</p>
                </div>

                <div className="agreement-list">
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      checked={agreeRespect}
                      onChange={(e) => setAgreeRespect(e.target.checked)}
                    />
                    <span>
                      I agree to <strong>be respectful</strong> and treat the AI like a teacher.
                    </span>
                  </label>

                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      checked={agreeFocus}
                      onChange={(e) => setAgreeFocus(e.target.checked)}
                    />
                    <span>
                      I agree to <strong>stay focused on learning</strong> and use the tutor to help me achieve my goals.
                    </span>
                  </label>

                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      checked={agreeSafety}
                      onChange={(e) => setAgreeSafety(e.target.checked)}
                    />
                    <span>
                      I agree to <strong>be safe</strong> and never share personal information.
                    </span>
                  </label>
                </div>

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
                </div>
              </div>
            </div>
          )}
          {/* ----Chat area----- */}
          {!showModal && !courseFlow.active && (
            <div className="chat-wrapper">
              <div className="chat-fullbleed">
                <MainContainer>
                  <ChatContainer>
                    <MessageList
                      scrollBehavior="smooth"
                      typingIndicator={isTyping ? <TypingIndicator content="BEX is calculating" /> : null}
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
                      onChange={(e) => setInputValue(e)}
                      onSend={(msg) => handleSend(msg)}
                      attachButton={false}
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

                      <button
                        type="button"
                        onClick={handleHintRequest}
                        className="upload-button hint-button"
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
    </div>
  );
}