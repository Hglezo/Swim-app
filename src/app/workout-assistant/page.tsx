'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaPaperPlane, FaLightbulb, FaSave, FaCalculator, FaHeart, FaVideo } from 'react-icons/fa';
import { MdDashboard, MdPerson, MdContentCopy, MdTimer } from 'react-icons/md';
import ToolsDialog from './components/ToolsDialog';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestionCard {
  title: string;
  description: string;
  example: string;
}

interface WorkoutTemplate {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string[];
}

interface Tool {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function WorkoutAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your swimming workout assistant. I can help you create new workouts, modify existing ones, or answer any questions about swimming training. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedConversations, setSavedConversations] = useState<{ title: string; messages: Message[] }[]>([]);
  const [showTools, setShowTools] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showToolsDialog, setShowToolsDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('pace');

  const workoutTemplates: WorkoutTemplate[] = [
    {
      title: "Endurance Builder",
      description: "Long-distance workout focusing on building stamina",
      duration: "60 min",
      difficulty: "Intermediate",
      focus: ["Endurance", "Pacing"]
    },
    {
      title: "Sprint Session",
      description: "High-intensity interval training for speed",
      duration: "45 min",
      difficulty: "Advanced",
      focus: ["Speed", "Power"]
    },
    {
      title: "Technique Focus",
      description: "Drill-based workout for stroke improvement",
      duration: "45 min",
      difficulty: "Beginner",
      focus: ["Technique", "Form"]
    }
  ];

  const tools: Tool[] = [
    {
      title: "Pace Calculator",
      description: "Calculate split times and race predictions",
      icon: <FaCalculator className="h-6 w-6" />,
      action: () => setShowTools(true)
    },
    {
      title: "Heart Rate Zones",
      description: "Calculate your training zones",
      icon: <FaHeart className="h-6 w-6" />,
      action: () => setShowTools(true)
    },
    {
      title: "Technique Analysis",
      description: "Analyze your swimming technique",
      icon: <FaVideo className="h-6 w-6" />,
      action: () => setShowTools(true)
    }
  ];

  const suggestionCards: SuggestionCard[] = [
    {
      title: "Modify Existing Workout",
      description: "Need to adjust your current workout? I can help you modify intensity, distance, or focus areas.",
      example: "Help me modify my 2000m workout to focus more on technique"
    },
    {
      title: "Create New Workout",
      description: "Get a personalized workout based on your goals and preferences.",
      example: "Create a 45-minute workout focusing on endurance"
    },
    {
      title: "Training Tips",
      description: "Get advice on technique, pacing, and training strategies.",
      example: "How can I improve my butterfly technique?"
    }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // TODO: Replace with actual AI API call
    setTimeout(() => {
      const response: Message = {
        role: 'assistant',
        content: 'This is a placeholder response. In the actual implementation, this would be replaced with a real AI response.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const saveConversation = () => {
    const title = `Conversation ${savedConversations.length + 1}`;
    setSavedConversations(prev => [...prev, { title, messages }]);
  };

  const useTemplate = (template: WorkoutTemplate) => {
    const message = `Create a workout based on the ${template.title} template, focusing on ${template.focus.join(' and ')}`;
    setInputMessage(message);
    handleSendMessage();
  };

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool.title.toLowerCase().replace(' ', ''));
    setShowToolsDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaHome className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/history" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              Calendar
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <Link 
              href="/logout" 
              className="text-gray-700 hover:text-teal-500 transition-colors flex items-center"
            >
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Workout Templates Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Workout Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutTemplates.map((template, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                      {template.duration}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {template.difficulty}
                    </span>
                    {template.focus.map((focus, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {focus}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => useTemplate(template)}
                    className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
                  >
                    <MdContentCopy className="mr-2" />
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-teal-500 mr-3">
                      {tool.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <button
                    onClick={() => handleToolClick(tool)}
                    className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Open Tool
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Suggestion Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Suggestions</h2>
                {suggestionCards.map((card, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow mb-6">
                    <div className="flex items-center mb-4">
                      <FaLightbulb className="h-6 w-6 text-teal-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 italic">Example: "{card.example}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saved Conversations */}
              {savedConversations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Conversations</h2>
                  <div className="space-y-4">
                    {savedConversations.map((conv, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                        <h3 className="font-medium text-gray-900">{conv.title}</h3>
                        <p className="text-sm text-gray-500">
                          {conv.messages.length} messages
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
              <div className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Workout Assistant</h2>
                  <button
                    onClick={saveConversation}
                    className="text-teal-500 hover:text-teal-600 transition-colors flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save Chat
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-600">Assistant is typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about workouts, techniques, or training plans..."
                      className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                    >
                      <FaPaperPlane className="mr-2" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Dialog */}
          <ToolsDialog
            isOpen={showToolsDialog}
            onClose={() => setShowToolsDialog(false)}
            initialTool={selectedTool}
          />
        </div>
      </div>
    </div>
  );
} 