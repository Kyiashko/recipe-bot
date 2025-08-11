// server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Load environment variables
dotenv.config();

interface ChatMessage {
  id: string;
  timestamp: string;
  userMessage: string;
  botResponse: string;
  sessionId: string;
}

interface TraceLog {
  timestamp: string;
  sessionId: string;
  userInput: string;
  aiResponse: string;
  processingTime: number;
  model: string;
}

class RecipeChatbot {
  private app: express.Application;
  private chatModel!: AzureChatOpenAI; // Using definite assignment assertion
  private conversations: Map<string, ChatMessage[]> = new Map();
  private readonly LOGS_DIR = './logs';
  
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.initializeChatModel();
    this.setupRoutes();
    this.ensureLogsDirectory();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  private initializeChatModel(): void {
    // Validate required environment variables
    const requiredEnvVars = [
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_INSTANCE_NAME', 
      'AZURE_OPENAI_DEPLOYMENT_NAME'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env file and ensure all Azure OpenAI variables are set.`
      );
    }

    console.log('Initializing Azure OpenAI with:');
    console.log('- Instance Name:', process.env.AZURE_OPENAI_INSTANCE_NAME);
    console.log('- Deployment Name:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    console.log('- API Version:', process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview');
    console.log('- API Key:', process.env.AZURE_OPENAI_API_KEY ? '✓ Set' : '✗ Missing');

    try {
      // Configure Azure OpenAI with AzureChatOpenAI
      this.chatModel = new AzureChatOpenAI({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      console.log('✅ Azure OpenAI ChatModel initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Azure OpenAI ChatModel:', error);
      throw error;
    }
  }

  private async ensureLogsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.LOGS_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  private async logTrace(trace: TraceLog): Promise<void> {
    try {
      const logFile = path.join(this.LOGS_DIR, `traces-${new Date().toISOString().split('T')[0]}.json`);
      let logs: TraceLog[] = [];
      
      try {
        const existingLogs = await fs.readFile(logFile, 'utf-8');
        logs = JSON.parse(existingLogs);
      } catch {
        // File doesn't exist, start with empty array
      }
      
      logs.push(trace);
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
      console.log('Trace logged successfully');
    } catch (error) {
      console.error('Failed to log trace:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createRecipePrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      new SystemMessage(`You are a professional chef and recipe expert AI assistant. Your specialty is providing detailed, easy-to-follow recipes based on user requests.

Instructions:
1. Always provide complete recipes with:
   - Ingredient list with precise measurements
   - Step-by-step cooking instructions
   - Cooking times and temperatures
   - Serving size information
   - Difficulty level (Easy/Medium/Hard)
   - Preparation and cooking time estimates

2. When users ask for recipes, be specific and detailed
3. Include helpful cooking tips and variations when appropriate
4. If a user asks for something that's not a recipe, politely redirect them back to recipe-related topics
5. Format your response clearly with sections for ingredients and instructions

Always be friendly, helpful, and encouraging about cooking!`),
      new HumanMessage("{input}")
    ]);
  }

  private setupRoutes(): void {
    // Serve the main HTML page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Chat endpoint
    this.app.post('/api/chat', async (req, res): Promise<void> => {
      try {
        const { message, sessionId: providedSessionId } = req.body;
        const sessionId = providedSessionId || this.generateSessionId();
        const startTime = Date.now();

        if (!message || typeof message !== 'string') {
          res.status(400).json({ error: 'Message is required and must be a string' });
          return;
        }

        // Create prompt template and format it
        const promptTemplate = this.createRecipePrompt();
        const formattedPrompt = await promptTemplate.format({ input: message });

        // Get AI response
        const response = await this.chatModel.invoke([
          new SystemMessage(formattedPrompt.split('\n')[0]), // Extract system message
          new HumanMessage(message)
        ]);

        const aiResponse = response.content as string;
        const processingTime = Date.now() - startTime;

        // Store conversation
        if (!this.conversations.has(sessionId)) {
          this.conversations.set(sessionId, []);
        }

        const chatMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userMessage: message,
          botResponse: aiResponse,
          sessionId: sessionId
        };

        this.conversations.get(sessionId)!.push(chatMessage);

        // Log trace
        await this.logTrace({
          timestamp: new Date().toISOString(),
          sessionId: sessionId,
          userInput: message,
          aiResponse: aiResponse,
          processingTime: processingTime,
          model: 'Azure OpenAI Chat'
        });

        res.json({
          response: aiResponse,
          sessionId: sessionId,
          timestamp: chatMessage.timestamp
        });

      } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
          error: 'Sorry, I encountered an error while processing your request. Please try again.' 
        });
      }
    });

    // Get conversation history
    this.app.get('/api/history/:sessionId', (req, res) => {
      const { sessionId } = req.params;
      const history = this.conversations.get(sessionId) || [];
      res.json({ history });
    });

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        activeSessions: this.conversations.size
      });
    });
  }

  public start(port: number = 3000): void {
    this.app.listen(port, () => {
      console.log(`Recipe AI Chatbot server running on http://localhost:${port}`);
      console.log(`Make sure to set your Azure OpenAI environment variables:`);
      console.log(`- AZURE_OPENAI_API_KEY`);
      console.log(`- AZURE_OPENAI_INSTANCE_NAME`);
      console.log(`- AZURE_OPENAI_DEPLOYMENT_NAME`);
      console.log(`- AZURE_OPENAI_API_VERSION (optional)`);
    });
  }
}

// Start the server
if (require.main === module) {
  const chatbot = new RecipeChatbot();
  const port = parseInt(process.env.PORT || '3000');
  chatbot.start(port);
}

export default RecipeChatbot;