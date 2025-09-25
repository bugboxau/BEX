

# Bugbox AI Tutor

This project implements the **AI tutor** BEX, designed to help young students understand the basics of coding, robotics, and Arduino. It uses OpenAI’s `gpt-4o` API and a modern React-based frontend to deliver clean, lesson-friendly interactions through a dynamic chat interface. The current plan is for it to be implemented through an IFrame on to Bugbox Playground. To do so, this trimester we have built an URL/Site through Netlify and switched our build command to it.  

---

## Features

- Real-time chat interface built with React.js.
- Integration with OpenAI `gpt-4o` API (configurable).
- Displays typing indicators while AI is thinking.
- Syntax-aware code formatting in markdown.
- Fallback "offline mode" if API key is missing.
- Clean UI styled with `@chatscope/chat-ui-kit-react`.

---

##Repository Structure

This project is split across two repositories due to having to workaround Netlify. Due to being an organization, Redback will have to pay a $2K fine to access Netlify. Thus we have forked it to a personal account and made it public so that multiple people can contribute to the repository and push to Netlify automatically. As it is public, we will need to store an working version of the repository safely, thus we will have to push to both repositories upon completion. 
-https://github.com/bugboxau/BEX (Repository linked to Netlify)
-https://github.com/Redback-Operations/redback-bugbox-ai (Private Organization Repository)

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (included with Node)
- A valid OpenAI API key (requires paid account)
- Netlify. Run "npm install Netlify"

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
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**NOTE: Never commit the `.env` file to a public repository.**

## Linking to the second repository

**This is best done by one person pulling from the main repo after all changes have been made. To fix any merge issues then updating the bugbox repository**

You will need to add this command to the command prompt. I have named it bugbox in my example, but you can name it whatever you like to show it is different to your repository. 

```
git remote add bugbox https://github.com/bugboxau/BEX.git
```

You can confirm that the repository is present by typing: 

```
git remote -v
```

You will see the repositories you are linked to as such: 

```
bugbox  https://github.com/bugboxau/BEX.git (fetch)
bugbox  https://github.com/bugboxau/BEX.git (push)
origin  https://github.com/Redback-Operations/redback-bugbox-ai.git (fetch)
origin  https://github.com/Redback-Operations/redback-bugbox-ai.git (push)
```

Always push as a group to the main organization repository (the one you cloned from) and leave it to one team member to pull these changes and push to the Bugbox repository which is connected to Netlify. 

```
git add .
git commit -m "BEX update"
git push origin bugbox
```

## Requirements on Netlify

Dylan Nguyen's personal Netlify account is hosting BEX @ https://bex-project-bugbox.netlify.app/ which you can check to see if the pushes have worked. If you have a white screen, consult with Dylan for access to the Netlify Account and changes will have to be made. 

Netlify safely stores your OPEN_API_KEY. It is currently using my API_KEY which will run out after I complete Capstone, when it runs out you can add one by going to:

Deployment Settings -> Environment Variables -> Create new environment variable. 

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Running the Application

Assuming that all dependencies have been are installed and your API key is secured in a .env file, to start the development server run the following command:

```bash
netlify dev 
```

This will start the app on `http://localhost:5173/` (default Vite port), and 'http://localhost:8888/' (default Netlify Host), where you can interact with the ChatGPT AI.

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
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
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
- Implement the IFrame in Bugbox Playground upon determining how to proceed with user authentication. 
- Analytics dashboard for educators (what students ask, where they struggle).

---

## License

This project is licensed under the MIT License.

---

This README provides all the necessary details to install, run, and secure the API key for the ChatGPT AI project.
