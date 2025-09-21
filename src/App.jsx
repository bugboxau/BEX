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
import { extractTextFromPDF, extractTextFromImage } from './FileProcessor';

import ChatHistory from './ChatHistory.jsx';

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

  // ---- UI state (unchanged from your app) ----
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pendingFileContent, setPendingFileContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showBadges, setShowBadges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Onboarding
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');
  // Agreements (new) – keep these OUTSIDE of JSX
  const [agreeRespect, setAgreeRespect] = useState(false);
  const [agreeFocus, setAgreeFocus]   = useState(false);
  const [agreeSafety, setAgreeSafety] = useState(false);


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

  const processUploadedFile = async (file) => {
    try {
      setIsTyping(true);
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else {
        setActiveMessages(prev => [
          ...prev,
          {
            message: 'Sorry, I can only read PDF or image files at the moment.',
            direction: 'incoming',
            sender: 'ChatGPT',
            position: 'left',
            avatar: '🤖',
            sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }
      if (!text || text.trim() === '') text = '(No text could be extracted from the file.)';
      const truncated = text.length > MAX_FILE_TEXT ? `${text.slice(0, MAX_FILE_TEXT)}... [truncated]` : text;
      setPendingFileContent(truncated);
    } catch (err) {
      console.error('Error processing file:', err);
      setActiveMessages(prev => [
        ...prev,
        {
          message: `Sorry, I couldn't read the file: ${err.message}`,
          direction: 'incoming',
          sender: 'ChatGPT',
          position: 'left',
          avatar: '🤖',
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
  

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((msg) => {
      const role = msg.sender === 'ChatGPT' ? 'assistant' : 'user';
      return { role, content: msg.message };
    });

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
      setActiveMessages([
        ...chatMessages,
        {
          message: `Sorry, I encountered an error. ${error.message}`,
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
        {!showModal && (
          <div className="chat-header">
            <button onClick={resetStudentInfo} style={{ backgroundColor: "var(--bugbox-dark-gray)" }}>
              Reset Student Info
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

        {/* Chat area */}
          {!showModal && (
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
    </div>
  );  
}
