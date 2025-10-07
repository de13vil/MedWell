import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send } from 'lucide-react';
import apiClient from '../../api/apiClient';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Hello! I am your MedWell assistant. How can I help you with your schedules?' }] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        const currentInput = input;
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const contextResponse = await apiClient.get('/chatbot/context');
            const userData = contextResponse.data;

            // --- THIS IS THE CRUCIAL UPDATE ---
            // A much smarter system prompt with clear rules for the AI.
            const systemPrompt = `You are MedWell, a helpful and friendly AI assistant for managing medication schedules. Your primary goal is to answer questions based ONLY on the user's data provided below.

            **Your Rules:**
            1.  **Be Conversational:** Act like a helpful assistant.
            2.  **Use Only Provided Data:** Base all your answers about schedules and history strictly on the JSON data below. Do not make up information.
            3.  **Determine "Today's Schedule":** To figure out what is scheduled for "today", you MUST check two things:
                - The schedule's \`startDate\` must be on or before the "Current Date".
                - The schedule's \`frequency\` rule must match the "Current Date". For a 'weekly' frequency, the \`daysOfWeek\` array uses 0 for Sunday, 1 for Monday, etc.
            4.  **Handle Medical Advice:** If the user asks for medical advice (e.g., "should I take this?"), you MUST respond with: "I am an AI assistant and cannot provide medical advice. Please consult a qualified healthcare professional."
            5.  **Handle Unknown Questions:** If a question cannot be answered from the provided data, politely state that you do not have that information.
            
            **Current Context:**
            - **Current Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            - **Current Time:** ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}

            **User's Data:**
            ---
            **Schedules:**
            ${JSON.stringify(userData.schedules, null, 2)}

            **Recent History:**
            ${JSON.stringify(userData.recentHistory, null, 2)}
            ---
            `;

            const res = await apiClient.post('/chatbot/message', {
                history: messages,
                input: currentInput,
                systemPrompt,
            });

            const modelMessage = { role: 'model', parts: [{ text: res.data.reply }] };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Something went wrong. Try again." }] }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // The JSX part of the component does not need to change
    return (
        <>
            {/* ... Your existing JSX for the chatbot window ... */}
            {/* It does not need to be changed. */}
             <div className="fixed bottom-6 right-6 z-50 group">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg"
                >
                    <AnimatePresence>
                        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                    </AnimatePresence>
                </motion.button>
                {!isOpen && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        AI Assistant
                    </div>
                )}
            </div>
            
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 h-[32rem] panel-glass shadow-2xl flex flex-col z-40 overflow-hidden"
                >
                    <div className="p-4 bg-gray-900 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-white">Wellness Assistant</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-none'
                                        : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-700 flex items-center">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask something..."
                            className="flex-1 bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows="1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="ml-3 bg-purple-600 p-2 rounded-full text-white disabled:bg-purple-800 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </>
    );
};
export default Chatbot;