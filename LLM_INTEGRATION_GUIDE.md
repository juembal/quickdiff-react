# LLM Integration Guide for QuickDiff React

## Overview
Your QuickDiff React app now supports real LLM integration instead of hardcoded AI responses. You can use various LLM providers including OpenAI, Anthropic Claude, local Ollama models, and Google Gemini.

## Setup Instructions

### 1. Install Dependencies
No additional dependencies are required - the integration uses the native `fetch` API.

### 2. Configure Your LLM Provider

#### Option A: OpenAI (GPT Models)
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Click the ⚠️ button next to "AI Tools" in the app
3. Select "OpenAI (GPT)" as provider
4. Enter your API key (starts with `sk-`)
5. Choose a model (gpt-3.5-turbo, gpt-4, etc.)
6. Test the connection

#### Option B: Anthropic Claude
1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Select "Anthropic (Claude)" as provider
3. Enter your API key (starts with `sk-ant-`)
4. Choose a Claude model
5. Test the connection

#### Option C: Local Ollama (No API Key Required)
1. Install [Ollama](https://ollama.ai/) on your machine
2. Pull a model: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. Select "Ollama (Local)" as provider
5. Set URL to `http://localhost:11434`
6. Choose your installed model
7. Test the connection

#### Option D: Google Gemini
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Select "Google Gemini" as provider
3. Enter your API key (starts with `AIza`)
4. Choose gemini-pro model
5. Test the connection

### 3. Using AI Features

Once configured, you can use these AI analysis features:

- **🧠 Explain**: Get detailed analysis of text differences
- **✨ Rewrite**: Receive suggestions for improving the text
- **📝 Summary**: Generate summaries of both text versions
- **🎭 Tone**: Analyze the tone and sentiment of texts
- **🧹 Cleanup**: Get recommendations for formatting improvements

### 4. Security Notes

- API keys are stored locally in your browser
- Keys are never sent to our servers
- For production use, consider using environment variables
- Ollama runs locally and doesn't require API keys

### 5. Troubleshooting

#### Connection Issues
- Verify your API key is correct
- Check your internet connection
- For Ollama, ensure the service is running
- Try the "Test Connection" button

#### Rate Limits
- OpenAI: Check your usage limits
- Anthropic: Monitor your API quota
- Gemini: Verify your request limits

#### CORS Issues
- Some providers may have CORS restrictions
- Consider using a proxy server for production
- Ollama typically works without CORS issues

### 6. Cost Considerations

- **OpenAI**: Pay per token usage
- **Anthropic**: Pay per token usage  
- **Ollama**: Free (runs locally)
- **Gemini**: Has free tier with limits

### 7. Advanced Configuration

You can customize:
- **Max Tokens**: Control response length (100-4000)
- **Temperature**: Control creativity (0.0-2.0)
- **Base URL**: Use custom endpoints or proxies

## Example Usage

1. Enter your original and changed text
2. Click "Compare Texts" to see differences
3. Click any AI tool button (🧠, ✨, 📝, 🎭, 🧹)
4. Wait for the AI analysis to complete
5. View results in the AI Results section

## Development Notes

The LLM integration consists of:
- `LLMService.js`: Main service handling different providers
- `LLMConfig.js`: Configuration modal component
- `LLMConfig.css`: Styling for the modal
- Updated `App.js`: Integration with existing app
- Updated `Controls.js`: UI for configuration and loading states

The old `AIEngine.js` has been replaced with real LLM calls, providing much more accurate and helpful analysis results.