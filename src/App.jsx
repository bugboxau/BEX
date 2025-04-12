import React, { useState } from 'react';
import './App.css';
import './Chat.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import bugboxLogo from './assets/bugbox-logo.png'; // Import the logo
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const systemMessage = {
  role: 'system',
  content:
    "When providing code examples, always format them in markdown code blocks with the appropriate language syntax highlighting. For example: ```javascript\nconst example = 'code';\n```",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm BugBox AI! Ask me anything!",
      sentTime: 'just now',
      sender: 'ChatGPT',
      direction: 'incoming',
      avatar: '🤖',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState(''); // State to manage input value

  const formatMessage = (message) => {
    return message.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const formattedCode = code
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      return `<pre><code class="language-${language || ''}">${formattedCode}</code></pre>`;
    });
  };

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
      position: 'right',
      avatar: '👤',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputValue(''); // Clear the input after sending
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === 'ChatGPT' ? 'assistant' : 'user';
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();

      setMessages([
        ...chatMessages,
        {
          message: formatMessage(data.choices[0].message.content),
          sender: 'ChatGPT',
          direction: 'incoming',
          position: 'left',
          avatar: '🤖',
          sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...chatMessages,
        {
          message: 'Sorry, I encountered an error. Please try again.',
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
                        position: message.sender === 'user' ? 'right' : 'left',
                        className: message.sender === 'user' ? 'user-message' : 'chatgpt-message',
                        avatar: message.avatar,
                        message: message.message,
                      }}
                    />
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