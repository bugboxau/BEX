

BugBox AI Project

This project demonstrates the implementation of a ChatGPT AI chatbot using the OpenAI GPT-3.5-turbo API, React.js for the frontend, and various UI components for the chat interface. The chatbot responds to user inputs by sending requests to the OpenAI API and displaying AI-generated responses in real time.

 Features
- Real-time chat interface built with React.js.
- Integration with OpenAI GPT-3.5-turbo API.
- Displays typing indicators when the AI is processing inputs.
- Dynamic message rendering with a clean chat interface.

 Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- An active OpenAI API key (paid subscription).

Packages Used
The following NPM packages are required for this project:

1. **React.js**: JavaScript library for building user interfaces.
2. **@chatscope/chat-ui-kit-react**: A UI library for chat interfaces.
3. **@chatscope/chat-ui-kit-styles**: Styles for the chat UI components.
4. **dotenv**: A module to load environment variables (optional but recommended for hiding sensitive API keys).

 Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/chatgpt-ai-project.git
cd chatgpt-ai-project
```

#### 2. Install Dependencies
Run the following command to install all the necessary dependencies:

```bash
npm install
```

This will install:
- React.js
- @chatscope/chat-ui-kit-react
- @chatscope/chat-ui-kit-styles
- dotenv (optional, but highly recommended for hiding API keys)

#### 3. Create an Environment File (Optional but Recommended)

Since the OpenAI API key is sensitive, it's important to store it securely. You can do this by using the `dotenv` package to load environment variables from a `.env` file.

- Create a `.env` file in the root directory of the project:

```bash
touch .env
```

- Inside the `.env` file, add your API key:

```
REACT_APP_OPENAI_API_KEY=your-api-key-here
```

Note: Never commit the `.env` file to a public repository.

#### 4. Update the Code to Use Environment Variables

In the code, update the section where the API key is used to load it from the `.env` file instead of hardcoding it:

```js
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
```

Make sure you import `dotenv` at the top of the main component if you haven't already:

```js
import dotenv from 'dotenv';
dotenv.config();
```

#### 5. Run the Application

Now that the dependencies are installed and your API key is secured, start the development server:

```bash
npm start
```

This will start the app on `http://localhost:3000`, where you can interact with the ChatGPT AI.

 How It Works

- Frontend: The app is built with React.js and displays a real-time chat interface using components from `@chatscope/chat-ui-kit-react`.
- API Integration**: When a user sends a message, the app makes a POST request to the OpenAI GPT-3.5 API, processes the response, and renders it back into the chat window.
- Typing Indicator**: While the API processes the request, a typing indicator shows that the AI is generating a response.

Important Notes

- API Key: The OpenAI API is a **paid service**. Make sure you have a valid API key to interact with the GPT-3.5-turbo model. **Never expose your API key publicly** by committing it to a repository. Use environment variables as described in this README.
  
 Future Improvements
- Implement authentication for user access control.
- Add error-handling for cases when the API is down or the rate limit is reached.
- Further optimize the user interface with advanced animations and custom themes.

 License
This project is licensed under the MIT License.

---

 Example `.env` File (Do Not Commit)

```bash
REACT_APP_OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

This README provides all the necessary details to install, run, and secure the API key for the ChatGPT AI project.
