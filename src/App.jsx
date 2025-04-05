import { useState } from 'react'
import './App.css'
import './Chat.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", 
  "content": "When providing code examples, always format them in markdown code blocks with the appropriate language syntax highlighting. For example: ```javascript\nconst example = 'code';\n```"
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm BugBox AI! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: 'incoming',
      avatar: '🤖'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const formatMessage = (message) => {
    // Convert markdown code blocks to HTML
    return message.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const formattedCode = code.trim()
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
      sender: "user",
      position: 'right',
      avatar: '👤',
      sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role, content: messageObject.message }
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });
      
      const data = await response.json();
      
      setMessages([...chatMessages, {
        message: formatMessage(data.choices[0].message.content),
        sender: "ChatGPT",
        direction: 'incoming',
        position: 'left',
        avatar: '🤖',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...chatMessages, {
        message: "Sorry, I encountered an error. Please try again.",
        sender: "ChatGPT",
        direction: 'incoming',
        position: 'left',
        avatar: '🤖',
        sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
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
                    position: message.sender === "user" ? "right" : "left",
                    className: message.sender === "user" ? "user-message" : "chatgpt-message",
                    avatar: message.avatar,
                    message: message.message
                  }} 
                />
              ))}
            </MessageList>
            <MessageInput 
              placeholder="Type your message here..." 
              onSend={handleSend}
              attachButton={false}
            />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App