import BadgeDisplay from './components/BadgeDisplay';
import React, { useState } from 'react';
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


// NOTE: Ensure that your personal API key is loaded into the .env file
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// NOTE: Toggle DEBUG to 'false' in order to remove console logs 
const DEBUG = true
// NOTE: OpenAI model used for chat responses
const OPENAI_MODEL = 'gpt-4o';

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello! I'm your Bugbox Tutor. How can I help you?",
      sentTime: 'just now',
      sender: 'ChatGPT',
      direction: 'incoming',
      avatar: '🤖',
    },
  ]);

  const [uploadedFile, setUploadedFile] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Onboarding state
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');
  const [showBadges, setShowBadges] = useState(false);

  // Upload success popup state
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  // Holds extracted text from a just-uploaded file until the user presses Send
  const [pendingFileContent, setPendingFileContent] = useState('');

  // Max chars from a file we keep to stay within token limits
  const MAX_FILE_TEXT = 1000;

  // File upload handlers
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Show success popup
      setShowUploadPopup(true);
      setUploadFileName(file.name);
      setTimeout(() => setShowUploadPopup(false), 3000);
      // Process the file in the background but do NOT post any chat messages yet
      processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file) => {
    try {
      setIsTyping(true);

      // 1. Extract text depending on file type
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else {
        setMessages(prev => [
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
        setIsTyping(false);
        return;
      }

      if (!text || text.trim() === '') {
        text = '(No text could be extracted from the file.)';
      }

      // Keep only a concise slice of text
      const truncated = text.length > MAX_FILE_TEXT ? `${text.slice(0, MAX_FILE_TEXT)}... [truncated]` : text;

      // Silently store the extracted text; user will decide when to send
      setPendingFileContent(truncated);
    } catch (error) {
      console.error('Error processing file:', error);
      setMessages(prev => [
        ...prev,
        {
          message: `Sorry, I couldn't read the file: ${error.message}`,
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

  const resetStudentInfo = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset your name, age, and lesson?\nThis will restart the conversation setup.'
    );
    if (confirmed) {
      debugLog('[resetStudentInfo] Student info reset confirmed.');
      setStudentName('');
      setStudentAge('');
      setStudentLesson('');
      setMessages([
        {
          message: "Hello! I'm your Bugbox Tutor. How can I help you?",
          sentTime: 'just now',
          sender: 'ChatGPT',
          direction: 'incoming',
          avatar: '🤖',
        },
      ]);
      setShowModal(true);
    } else {
      debugLog('[resetStudentInfo] Reset cancelled by user.');
    }
  };

  const handleSend = async (message) => {
    if (!message || message.trim() === '') {
      console.warn('[handleSend] Empty message skipped.');
      return;
    }

    // Run content filter before proceeding
    const result = filterMessage(message);
    if (!result.allowed) {
      setMessages(prev => [...prev, {
        message: result.reason,
        direction: 'incoming',
        sender: 'ChatGPT',
        avatar: '🤖',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      return;
    }

    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
      position: 'right',
      avatar: '👤',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let messagesForAI;
    let newMessagesState;

    if (pendingFileContent) {
      // Hidden context for the AI so it can read the file
      const hiddenFileContextMessage = {
        message: `Context from uploaded file:\n\n${pendingFileContent}`,
        direction: 'outgoing',
        sender: 'user',
        position: 'right',
        avatar: '👤',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hidden: true, // custom flag – we will ignore in UI rendering
      };

      // Visible indicator for the user in the chat log
      const visibleFileIndicator = {
        message: `📎 ${uploadFileName || 'File attached'}`,
        direction: 'outgoing',
        sender: 'user',
        position: 'right',
        avatar: '👤',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      messagesForAI = [...messages, hiddenFileContextMessage, newMessage];
      newMessagesState = [...messages, visibleFileIndicator, newMessage];

      setPendingFileContent('');
      setUploadFileName('');
    } else {
      messagesForAI = [...messages, newMessage];
      newMessagesState = messagesForAI;
    }

    debugLog('[handleSend] New user message:', newMessage);
    setMessages(newMessagesState);
    setInputValue('');
    setIsTyping(true);

    await processMessageToChatGPT(messagesForAI);
  };

  async function processMessageToChatGPT(chatMessages) {
    if (!API_KEY || API_KEY === 'fake-key') {
      debugLog('[processMessageToChatGPT] No valid API key provided.');
      setMessages([
        ...chatMessages,
        {
          message: '(No connection available) Running in offline mode.',
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: '🤖',
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
      return;
    }

    const apiMessages = chatMessages.map((msg) => {
      const role = msg.sender === 'ChatGPT' ? 'assistant' : 'user';
      return { role, content: msg.message };
    });

    const systemMessage = generateSystemMessage(studentName, Number(studentAge), studentLesson);

    // Additional system-level guidance to keep responses concise and well-structured
    const styleGuideMessage = {
      role: 'system',
      content:
        'Answer concisely (≤150 words). If using bullet points, do NOT insert blank lines between items. There shuld not be any empty or blank lines whatsoever. Use Markdown formatting where appropriate.'
    };

    const apiRequestBody = {
      model: OPENAI_MODEL,
      messages: [systemMessage, styleGuideMessage, ...apiMessages],
      max_tokens: 300, // roughly 150–200 words max
      temperature: 0.7,
    };

    debugLog('[API Request Body]', apiRequestBody);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      debugLog('[OpenAI API Response]', data);
      
      let replyContent = data.choices?.[0]?.message?.content;
      if (!replyContent) {
        throw new Error("Missing message content from OpenAI.");
      }

      // Condense excessive blank lines (2+ \n) into a single newline for compact display
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
      setMessages([...visible, aiMessage]);
    } catch (error) {
      console.error('[processMessageToChatGPT Error]', error);
      setMessages([
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




  return (
    <div id="bugbox-popup-root">
      {showUploadPopup && (
        <div className="upload-success-popup">✅ {uploadFileName} uploaded</div>
      )}
      <div className="bugbox-popup">
        <div className="App">
          {/* Add the logo inside the App container */}
          <div className="bugbox-logo-container">
            <img src={bugboxLogo} alt="BugBox Logo" className="bugbox-logo" />
          </div>

          {/* Reset chat */}
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={resetStudentInfo} style={{ backgroundColor: 'var(--bugbox-secondary)' }}>
              Reset Student Info
            </button>
          </div>

          {/* Onboarding Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Welcome to Bugbox AI!</h2>
                <p>Let's get started. Please tell me a bit about yourself.</p>
                <label>Name:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value.trimStart())}
                  placeholder="e.g. Sam"
                  autoFocus
                />
                <label>Age:</label>
                <input
                  type="number"
                  min="0"
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  placeholder="e.g. 9"
                />
                <label>Upload Lesson Plan (optional):</label>
                <button
                  type="button"
                  onClick={() => document.getElementById('lesson-file-upload').click()}
                  className="upload-button"
                >
                  📎 Upload File
                </button>
                <input
                  id="lesson-file-upload"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {/* Allow user to send first chat message directly from onboarding */}
                <label>Ask me something:</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend(inputValue);
                      setShowModal(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    handleSend(inputValue);
                    setShowModal(false);
                  }}
                >
                  Send & Start Chat
                </button>

                <button onClick={() => setShowModal(false)}>Start Chat</button>
              </div>
            </div>
          )}
          

          {/* Chat content */}
          <div style={{ position: 'relative', height: '800px', width: '700px' }}>
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
                        position: 'single',
                        className: message.sender === 'user' ? 'user-message' : 'chatgpt-message',
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
                  onChange={(e) => {
                    setInputValue(e);
                  }}
                  onSend={(message) => {
                    handleSend(message);
                  }}
                  attachButton={false}
                />

                <InputToolbox>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="upload-button"
                  >
                    📎 Upload File
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </InputToolbox>
              </ChatContainer>
            </MainContainer>
  <div 
    style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "20px", 
      width: "100%", 
      padding: "20px" 
    }}
  >
    <div style={{ textAlign: "center" }}>
      <button
        onClick={() => setShowBadges(!showBadges)}
        style={{
          backgroundColor: '#6c63ff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {showBadges ? 'Hide Badges' : 'Show Badges'}
      </button>

      {showBadges && (
        <div style={{ marginTop: '20px' }}>
          <BadgeDisplay />
        </div>
      )}
    </div>
  </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
