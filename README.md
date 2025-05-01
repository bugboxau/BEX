

# Bugbox AI Tutor

This project implements a simple **AI tutor** designed to help young students understand the basics of coding. It uses OpenAI’s `gpt-4o` API and a modern React-based frontend to deliver clean, lesson-friendly interactions through a dynamic chat interface.

---

## Features

- Real-time chat interface built with React.js.
- Integration with OpenAI `gpt-4o` API (configurable).
- Displays typing indicators while AI is thinking.
- Syntax-aware code formatting in markdown.
- Fallback "offline mode" if API key is missing.
- Clean UI styled with `@chatscope/chat-ui-kit-react`.

---

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (included with Node)
- A valid OpenAI API key (requires paid account)

---

## Packages Used

- `react`: Core frontend framework.
- `@chatscope/chat-ui-kit-react`: Chat interface components.
- `@chatscope/chat-ui-kit-styles`: Style dependencies for the above.
- `dotenv`: (Optional) Load environment variables like the API key securely.

---

## Installation Steps

#### 1. Clone the Repository

Clone the repository onto your local system:

```bash
git clone https://github.com/yourusername/redback-bugbox-ai.git
cd redback-bugbox-ai.git
```

#### 2. Install Dependencies

Run the following command to install all the necessary dependencies:

```bash
npm install
```
#### 3. Create an Environment File

Since the OpenAI API key is sensitive, it's important to store it securely. You can do this by using `.env` file.

- Create a `.env` file in the root directory of the project:

```bash
touch .env
```

- Inside the `.env` file, add your API key:

```
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**NOTE: Never commit the `.env` file to a public repository.**

## Running the Application

Assuming that all dependencies have been are installed and your API key is secured in a .env file, to start the development server run the following command:

```bash
npm run dev
```

This will start the app on `http://localhost:5173/` (default Vite port), where you can interact with the ChatGPT AI.

---

## How It Works

- **Frontend**: The app is built with React.js and displays a real-time chat interface using components from `@chatscope/chat-ui-kit-react`.
- **API Integration**: When a user sends a message, the app makes a POST request to the OpenAI gpt-4o API, processes the response, and renders it back into the chat window.
- **Typing Indicator**: While the API processes the request, a typing indicator shows that the AI is generating a response.
- **System Prompt Control**: The application uses a predefined system message to guide the AI’s tone and formatting. This ensures that code examples are displayed using properly formatted markdown blocks with language-specific syntax highlighting.
- **Model Configuration**: The OpenAI model is set via the `OPENAI_MODEL` constant and can be easily updated or moved to an environment variable for flexible deployment.
- **Error Handling**: The system handles malformed responses, HTTP request failures, and missing API keys. If the API is unavailable or misconfigured, a fallback "offline mode" simulates a basic reply so that local development can continue without interruption.
- **Security Consideration**: All API requests require a valid OpenAI API key, which is injected through environment variables and never exposed in code or committed files.

---

## Important Notes

- **API Key**: The OpenAI API is a **paid service**. Always ensure your API key is valid and kept secure. 
- **Environment Configuration**: Make sure your `.env` file contains the following line (do not include quotes):

```bash
VITE_OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- **Shared Project Caution**: This is a collaborative and ongoing project. Contributors should double-check that they:
    - Do **not hardcode** API keys into components.
    - Use the existing `DEBUG` flag to control console output.
    - Be mindful not to include local logs or test keys when committing to the repository.
    - Keep the OpenAI model (`gpt-4o`, `gpt-3.5-turbo`, etc.) consistent unless testing different configurations intentionally.
- **Never expose your API key publicly** by committing it to a repository. Use environment variables as described in this README.
- **Fallback Mode**: If the API key is missing or misconfigured, the chatbot will switch to an "offline mode" and simulate a placeholder response. This is helpful for frontend debugging and offline testing.

---

## Future Improvements

- Implement authentication for user access control.
- Further optimize the user interface with advanced animations and custom themes.
- Save and load chat history from local storage.
- Analytics dashboard for educators (what students ask, where they struggle).

---

## License

This project is licensed under the MIT License.

---

This README provides all the necessary details to install, run, and secure the API key for the ChatGPT AI project.
