# 🍳 Recipe AI Chatbot

A sophisticated AI-powered recipe chatbot built with TypeScript, Node.js, Azure OpenAI, and Langchain. The bot specializes in providing detailed cooking recipes with step-by-step instructions, ingredient lists, cooking times, and helpful tips.

## ✨ Features

- 🤖 **AI-Powered**: Uses Azure OpenAI (O1-Mini) for intelligent recipe generation
- 🔧 **Langchain Integration**: Built with Langchain for robust AI workflow management
- 📝 **Detailed Recipes**: Provides comprehensive recipes with:
  - Complete ingredient lists with measurements
  - Step-by-step cooking instructions
  - Cooking times and temperatures
  - Difficulty levels and serving sizes
  - Helpful cooking tips
- 💬 **Conversation Logging**: All interactions are logged to trace files for analysis
- 🎨 **Clean UI**: Simple, responsive web interface
- 🚀 **TypeScript**: Type-safe development with full TypeScript support
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **AI Integration**: Azure OpenAI, Langchain
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Development**: ts-node, nodemon
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
recipe-ai-chatbot/
├── src/
│   └── server.ts          # Main TypeScript server
├── public/
│   └── index.html         # Frontend interface
├── logs/                  # Conversation logs (auto-created)
├── dist/                  # Compiled JavaScript (auto-created)
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Azure OpenAI account with O1-Mini deployment
- Git (for cloning)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/recipe-ai-chatbot.git
   cd recipe-ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your Azure OpenAI credentials
   nano .env  # or use your preferred editor
   ```

4. **Set up your Azure OpenAI credentials in .env**
   ```bash
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_INSTANCE_NAME=your_instance_name
   AZURE_OPENAI_DEPLOYMENT_NAME=o1-mini
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   PORT=3000
   ```

5. **Run the application**
   ```bash
   # Development mode (recommended)
   npm run dev
   
   # Or production build
   npm run build && npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎯 Usage Examples

Try these example prompts in the chat interface:

- "Give me a recipe for homemade pasta"
- "How to make chocolate chip cookies?"
- "I want to cook something with chicken and rice"
- "Show me an easy vegetarian dinner recipe"
- "What can I make with tomatoes and cheese?"

## 🔧 Available Scripts

```bash
npm run dev      # Development mode with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
npm run watch    # Development with file watching
npm run clean    # Remove compiled files
```

## 📊 API Endpoints

### POST /api/chat
Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "Give me a recipe for homemade pasta",
  "sessionId": "optional_session_id"
}
```

**Response:**
```json
{
  "response": "Here's a detailed recipe for homemade pasta...",
  "sessionId": "session_12345_abcdef",
  "timestamp": "2024-08-07T10:30:00.000Z"
}
```

### GET /api/history/:sessionId
Retrieve conversation history for a specific session.

### GET /api/health
Check server health status and active sessions.

## 🔒 Security & Privacy

- All sensitive data is protected via environment variables
- API keys and credentials are never committed to the repository
- Conversation logs are stored locally and can be configured
- No personal data is sent to external services beyond Azure OpenAI

## 🛠️ Development

### Adding New Features

The modular architecture makes it easy to extend:

1. **New API endpoints**: Add routes in `setupRoutes()` method
2. **Additional logging**: Extend the `TraceLog` interface
3. **UI enhancements**: Modify the frontend JavaScript class
4. **AI model changes**: Update the `initializeChatModel()` method

### Code Structure

- **server.ts**: Main backend logic, API routes, AI integration
- **index.html**: Complete frontend with HTML, CSS, and JavaScript
- **package.json**: Dependencies and build scripts
- **tsconfig.json**: TypeScript compiler configuration

## 📝 Environment Variables

Required environment variables (create these in your `.env` file):

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | `abc123def456...` |
| `AZURE_OPENAI_INSTANCE_NAME` | Azure OpenAI resource name | `my-openai-resource` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name | `o1-mini` |
| `AZURE_OPENAI_API_VERSION` | API version | `2024-02-15-preview` |
| `PORT` | Server port (optional) | `3000` |

## 🐛 Troubleshooting

### Common Issues

**1. "OpenAI API key not found" error**
- Verify your `.env` file exists and contains all required variables
- Check that your Azure OpenAI deployment is active

**2. "Port already in use" error**
- Change the PORT in your `.env` file
- Or stop other services using port 3000

**3. TypeScript compilation errors**
- Run `npm run clean` then `npm run build`
- Ensure TypeScript is installed: `npm install -g typescript`

**4. Connection to Azure OpenAI fails**
- Verify your deployment name matches exactly what's in Azure OpenAI Studio
- Check your instance name and API version

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📋 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature-name'`
5. Push to your branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Langchain](https://langchain.com/) for AI orchestration
- Powered by [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- UI inspired by modern chat interfaces

## 📞 Support

If you encounter any issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [Azure OpenAI documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
3. Open an issue in this repository
4. Check the console logs for detailed error messages

---

**Happy Cooking! 👨‍🍳👩‍🍳**