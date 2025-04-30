import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './Chat.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import bugboxLogo from './assets/bugbox-logo.png';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// NOTE: Ensure that your personal API key is loaded into the .env file
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// NOTE: Toggle DEBUG to 'false' in order to remove console logs 
const DEBUG = true;
// NOTE: OpenAI model used for chat responses
const OPENAI_MODEL = 'gpt-4o';

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Bugbox AI! Ask me anything!",
      sentTime: 'just now',
      sender: 'ChatGPT',
      direction: 'incoming',
      avatar: '🤖',
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Onboarding state
  const [showModal, setShowModal] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentLesson, setStudentLesson] = useState('');

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
          message: "Hello, I'm Bugbox AI! Ask me anything!",
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

  const generateSystemMessage = () => {
    const name = studentName || "student";
    const lessonInfo = studentLesson.trim() !== ''
      ? ` You're currently working on "${studentLesson}", so make sure to keep explanations focused on that topic.`
      : " Feel free to ask about any programming topic.";

    const tone = Number(studentAge) < 10
      ? "Use simple words and be friendly like you're explaining something to a younger kid."
      : "Explain things clearly as if you're helping a student who's just starting out with coding.";

    return {
      role: 'system',
      content: `Your name is Bugbox AI. Refer to the student as "${name}". ${tone}${lessonInfo} When providing code examples, always use markdown formatting with language syntax highlighting. For example:\n\n\`\`\`javascript\nconst example = 'code';\n\`\`\``,
    };
  };

  const handleSend = async (message) => {
    if (!message || message.trim() === '') {
      console.warn('[handleSend] Empty message skipped.');
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

    const newMessages = [...messages, newMessage];
    debugLog('[handleSend] New user message:', newMessage);
    setMessages(newMessages);
    setInputValue(''); // Clear the input after sending
    setIsTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((msg) => {
      const role = msg.sender === 'ChatGPT' ? 'assistant' : 'user';
      return { role, content: msg.message };
    });

    const systemMessage = generateSystemMessage();

    const apiRequestBody = {
      model: OPENAI_MODEL,
      messages: [systemMessage, ...apiMessages],
    };

    debugLog('[API Request Body]', apiRequestBody);

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
      
      const replyContent = data.choices?.[0]?.message?.content;
      if (!replyContent) {
        throw new Error("Missing message content from OpenAI.");
      }

      setMessages([
        ...chatMessages,
        {
          message: replyContent,
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: '🤖',
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
                <label>Lesson (optional):</label>
                <input
                  type="text"
                  value={studentLesson}
                  onChange={(e) => setStudentLesson(e.target.value.trimStart())}
                  placeholder="e.g. Variables in Python"
                />
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
                    // Use e.target.value only if it's a native input (this lib may pass string directly)
                    setInputValue(e);
                  }}
                  onSend={(message) => {
                    handleSend(message);
                    // Do NOT reset inputValue here, it will conflict with internal clearing
                    // Just let ChatScope handle it automatically
                  }}
                  attachButton={false}
                />


              </ChatContainer>
            </MainContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;