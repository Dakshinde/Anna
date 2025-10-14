// frontend/src/components/ChatbotComponent.js
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ArrowLeft } from 'lucide-react';
import { Box, TextField, IconButton, Typography, Paper, Avatar, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm Anna, your food waste management assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [conversationState, setConversationState] = useState('idle');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    let command = '';
    let context = '';

    if (conversationState === 'awaiting_recipe') {
      command = 'GET_LEFTOVER_RECIPES';
      context = inputMessage;
    } else if (conversationState === 'awaiting_safety') {
      command = 'GET_FOOD_SAFETY_TIPS';
      context = inputMessage;
    } else {
      command = inputMessage;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', {
        message: command,
        context: context
      });
      
      const botMessage = { type: 'bot', text: response.data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { type: 'bot', text: "Sorry, I'm having trouble connecting right now.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (conversationState !== 'idle') {
        setConversationState('answered');
      }
    }
  };
  
  const handleMenuClick = (action) => {
      switch(action) {
          case 'recipe':
              setMessages(prev => [...prev, { type: 'user', text: "Leftover Recipes", timestamp: new Date() }, { type: 'bot', text: "Of course! What leftover ingredients do you have?", timestamp: new Date() }]);
              setConversationState('awaiting_recipe');
              break;
          case 'safety':
              setMessages(prev => [...prev, { type: 'user', text: "Food Safety Tips", timestamp: new Date() }, { type: 'bot', text: "Sure. What food would you like safety tips for?", timestamp: new Date() }]);
              setConversationState('awaiting_safety');
              break;
          case 'ngo':
              navigate('/ngos');
              setIsOpen(false);
              break;
          case 'predict':
              navigate('/predict');
              setIsOpen(false);
              break;
          default:
              break;
      }
  };
  
  const handleGoBack = () => {
      setMessages(prev => [...prev, { type: 'bot', text: "How else can I help you?", timestamp: new Date() }]);
      setConversationState('idle');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MainMenu = () => (
    <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => handleMenuClick('recipe')}>Leftover Recipes</Button>
        <Button size="small" variant="outlined" onClick={() => handleMenuClick('safety')}>Food Safety</Button>
        <Button size="small" variant="outlined" onClick={() => handleMenuClick('ngo')}>Find NGOs</Button>
        {/* --- THIS IS THE FIX --- */}
        <Button size="small" variant="outlined" onClick={() => handleMenuClick('predict')}>Predict Spoilage</Button>
      </Box>
    </Box>
  );

  const GoBackMenu = () => (
     <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0', display: 'flex' }}>
       <Button size="small" variant="contained" startIcon={<ArrowLeft />} onClick={handleGoBack}>Main Menu</Button>
     </Box>
  );

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {!isOpen && (
        <IconButton onClick={() => setIsOpen(true)} sx={{ backgroundColor: 'primary.main', color: 'white', width: 64, height: 64, boxShadow: 3, '&:hover': { backgroundColor: '#1B5E20', transform: 'scale(1.1)' }, transition: 'all 0.3s ease' }}>
          <MessageCircle size={32} />
        </IconButton>
      )}

      {isOpen && (
        <Paper elevation={8} sx={{ width: 400, height: 650, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}><Bot size={24} /></Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 18 }}>Anna Assistant</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>Always here to help</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              <X size={20} />
            </IconButton>
          </Box>
          
           <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1.5, flexDirection: message.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <Avatar sx={{ backgroundColor: message.type === 'user' ? '#1976d2' : 'primary.main', width: 32, height: 32 }}>
                  {message.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                </Avatar>
                <Box sx={{ maxWidth: '75%' }}>
                  <Paper elevation={1} sx={{ p: 1.5, backgroundColor: message.type === 'user' ? '#1976d2' : 'white', color: message.type === 'user' ? 'white' : '#333', borderRadius: 2, borderTopLeftRadius: message.type === 'bot' ? 0 : 16, borderTopRightRadius: message.type === 'user' ? 0 : 16 }}>
                    <Typography component="div" variant="body2" sx={{ '& p': { m: 0 }, '& ol, & ul': { m: 0, pl: 2 }, wordBreak: 'break-word' }}>
                      {message.type === 'bot' ? <ReactMarkdown>{message.text}</ReactMarkdown> : message.text}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : '#999', fontSize: 11 }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}><Bot size={18} /></Avatar>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, backgroundColor: 'white' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 18 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#999', animation: 'bounce 1.4s infinite ease-in-out', '@keyframes bounce': { '0%, 80%, 100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' }}}} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#999', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.2s', '@keyframes bounce': { '0%, 80%, 100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' }}}} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#999', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.4s', '@keyframes bounce': { '0%, 80%, 100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' }}}} />
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {!isLoading && conversationState === 'idle' && <MainMenu />}
          {!isLoading && conversationState === 'answered' && <GoBackMenu />}
          
          <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField fullWidth variant="outlined" placeholder="Type your message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 25 } }} />
              <IconButton onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: '#1b5e20' }, '&:disabled': { backgroundColor: '#e0e0e0' } }}>
                <Send size={20} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatbotComponent;