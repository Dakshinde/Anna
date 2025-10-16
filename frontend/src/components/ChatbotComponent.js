import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ArrowLeft, BrainCircuit, ShieldCheck, HeartHandshake, UtensilsCrossed } from 'lucide-react';
import { Box, TextField, IconButton, Typography, Paper, Avatar, Button, useTheme } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { keyframes } from '@mui/system';

// Animation for the chat window
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Loading animation for bot thinking
const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
`;

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
  const theme = useTheme();

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
  
  const menuItems = [
      { action: 'recipe', label: 'Leftover Recipes', icon: <UtensilsCrossed size={16}/> },
      { action: 'safety', label: 'Food Safety', icon: <ShieldCheck size={16}/> },
      { action: 'ngo', label: 'Find NGOs', icon: <HeartHandshake size={16}/> },
      { action: 'predict', label: 'Predict Spoilage', icon: <BrainCircuit size={16}/> }
  ];

  const MainMenu = () => (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {menuItems.map(item => (
            <Button 
                key={item.action}
                size="small" 
                variant="outlined" 
                startIcon={item.icon}
                onClick={() => handleMenuClick(item.action)}
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 500 }}
            >
                {item.label}
            </Button>
        ))}
      </Box>
    </Box>
  );

  const GoBackMenu = () => (
     <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex' }}>
       <Button size="small" variant="contained" startIcon={<ArrowLeft />} onClick={handleGoBack}>Main Menu</Button>
     </Box>
  );

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {!isOpen && (
        <IconButton onClick={() => setIsOpen(true)} sx={{ 
            background: 'linear-gradient(135deg, #43a047 0%, #00897b 100%)', 
            color: 'white', 
            width: 64, 
            height: 64, 
            boxShadow: theme.shadows[6], 
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.1)' } 
        }}>
          <MessageCircle size={32} />
        </IconButton>
      )}

      {isOpen && (
        <Paper elevation={8} sx={{ 
            width: { xs: 'calc(100vw - 32px)', sm: 400 }, 
            height: { xs: 'calc(100vh - 100px)', sm: 650 }, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            bgcolor: 'background.paper',
            animation: `${slideInUp} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`
        }}>
          <Box sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#2e7d32' : '#43a047'} 0%, ${theme.palette.mode === 'dark' ? '#00897b' : '#26a69a'} 100%)`, 
              color: 'white', 
              padding: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><Bot size={24} /></Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 18 }}>Anna Assistant</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>Online</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)'} }}>
              <X size={20} />
            </IconButton>
          </Box>
          
           <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1.5, flexDirection: message.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <Avatar sx={{ bgcolor: message.type === 'user' ? 'secondary.main' : 'primary.main', width: 32, height: 32, boxShadow: theme.shadows[1] }}>
                  {message.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                </Avatar>
                <Paper elevation={0} sx={{ 
                    p: 1.5, 
                    bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper', 
                    color: message.type === 'user' ? 'white' : 'text.primary', 
                    borderRadius: '16px',
                    borderTopLeftRadius: message.type === 'bot' ? 4 : '16px',
                    borderTopRightRadius: message.type === 'user' ? 4 : '16px',
                    maxWidth: '100%',
                    boxShadow: theme.shadows[1]
                }}>
                  <Typography component="div" variant="body2" sx={{ '& p': { m: 0 }, '& ul, & ol': { m: 0, pl: 2 }, wordBreak: 'break-word' }}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
                 <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><Bot size={18} /></Avatar>
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: '16px', borderTopLeftRadius: 4, bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 21 }}>
                            <Box sx={{ animation: `${bounce} 1.4s infinite ease-in-out both`, animationDelay: '0s', height: 8, width: 8, bgcolor: 'text.secondary', borderRadius: '50%' }} />
                            <Box sx={{ animation: `${bounce} 1.4s infinite ease-in-out both`, animationDelay: '0.2s', height: 8, width: 8, bgcolor: 'text.secondary', borderRadius: '50%' }} />
                            <Box sx={{ animation: `${bounce} 1.4s infinite ease-in-out both`, animationDelay: '0.4s', height: 8, width: 8, bgcolor: 'text.secondary', borderRadius: '50%' }} />
                        </Box>
                    </Paper>
                </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {!isLoading && conversationState === 'idle' && <MainMenu />}
          {!isLoading && conversationState === 'answered' && <GoBackMenu />}
          
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField fullWidth variant="outlined" placeholder="Type your message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '50px' }}} />
              <IconButton onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} color="primary" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: theme.palette.action.disabledBackground } }}>
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

