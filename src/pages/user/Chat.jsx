import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function Chat() {
  const navigate = useNavigate();

  // State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('0:00');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('sovereign');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const recordingStartTime = useRef(null);
  const recordingInterval = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize
  useEffect(() => {
    loadChatHistory();
    loadSelectedModel();
    initSpeechRecognition();
    initSpeechSynthesis();

    setTimeout(() => {
      scrollToBottom(false);
    }, 100);

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // Initialize Speech Recognition (STT)
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSpeechResult(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('음성 인식 오류:', event.error);
        if (event.error === 'no-speech') {
          addAIMessage('음성이 감지되지 않았어요. 다시 시도해주세요.');
        }
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        stopRecording();
      };
    }
  };

  // Initialize Speech Synthesis (TTS)
  const initSpeechSynthesis = () => {
    synthRef.current = window.speechSynthesis;
  };

  // Load chat history from localStorage
  const loadChatHistory = () => {
    const history = localStorage.getItem('eume_chat_history');
    if (!history) return;

    try {
      const parsedMessages = JSON.parse(history);
      const today = new Date().toDateString();
      const todayMessages = parsedMessages.filter(msg => {
        const msgDate = new Date(msg.timestamp).toDateString();
        return msgDate === today;
      });
      setMessages(todayMessages);
    } catch (error) {
      console.error('채팅 기록 로드 오류:', error);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = (updatedMessages) => {
    try {
      localStorage.setItem('eume_chat_history', JSON.stringify(updatedMessages.slice(-50)));
    } catch (error) {
      console.error('채팅 기록 저장 오류:', error);
    }
  };

  // Load selected model from localStorage
  const loadSelectedModel = () => {
    const savedModel = localStorage.getItem('eume_selected_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  };

  // Get current time in Korean format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Format message text (convert newlines to paragraphs)
  const formatMessage = (text) => {
    return text.split('\n').filter(line => line.trim()).map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };

  // Send message
  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;

    const newMessage = {
      text,
      sender: 'user',
      time: getCurrentTime(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setChatInput('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = getAIResponse(text);
      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        time: getCurrentTime(),
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      scrollToBottom();

      // Speak AI response
      speakText(aiResponse);
    }, 1000 + Math.random() * 1000);
  };

  // Add AI message directly
  const addAIMessage = (text) => {
    const aiMessage = {
      text,
      sender: 'ai',
      time: getCurrentTime(),
      timestamp: Date.now()
    };
    const updatedMessages = [...messages, aiMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    scrollToBottom();
  };

  // Get AI response based on user message
  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (lowerMessage.includes('안녕') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return '안녕하세요! 😊\n어떻게 도와드릴까요?';
    }

    // Emotions - sad
    if (lowerMessage.includes('슬퍼') || lowerMessage.includes('우울') || lowerMessage.includes('힘들')) {
      return '그렇군요. 힘든 시간을 보내고 계시는 것 같아요. 😔\n제가 곁에 있으니 편하게 이야기해 주세요.';
    }

    // Emotions - happy
    if (lowerMessage.includes('좋아') || lowerMessage.includes('행복') || lowerMessage.includes('기뻐')) {
      return '정말 좋네요! 😊\n기쁜 일이 있으신가 봐요. 더 이야기해주실 수 있나요?';
    }

    // Health
    if (lowerMessage.includes('아프') || lowerMessage.includes('통증') || lowerMessage.includes('병원')) {
      return '건강이 안 좋으시군요. 😟\n병원에 방문하시는 것이 좋을 것 같아요. 제가 가까운 병원을 찾아드릴까요?';
    }

    // Welfare
    if (lowerMessage.includes('복지') || lowerMessage.includes('지원') || lowerMessage.includes('혜택')) {
      return '복지 혜택에 관심이 있으시군요! 📋\n어떤 분야의 복지 정보를 찾으시나요? (의료, 주거, 경제 등)';
    }

    // Weather
    if (lowerMessage.includes('날씨')) {
      return '오늘 날씨는 맑고 화창해요! 🌤️\n산책하기 좋은 날씨네요.';
    }

    // Time
    if (lowerMessage.includes('시간') || lowerMessage.includes('몇 시')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      return `지금은 ${timeStr}이에요. ⏰`;
    }

    // Default responses
    const defaultResponses = [
      '네, 잘 알겠습니다. 😊\n더 궁금하신 것이 있으신가요?',
      '그렇군요!\n제가 도와드릴 수 있는 것이 있을까요?',
      '말씀해주셔서 감사합니다. 💙\n더 자세히 이야기해주실 수 있나요?',
      '이해했습니다.\n다른 도움이 필요하시면 언제든 말씀해주세요!'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Text to Speech
  const speakText = (text) => {
    if (!synthRef.current) return;

    // Cancel previous speech
    synthRef.current.cancel();

    // Remove emojis and special characters
    const cleanText = text.replace(/[😊😐😔😴🤖💙⏰🌤️📋❤️🚨💊🎤]/g, '').trim();

    if (cleanText) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      synthRef.current.speak(utterance);
    }
  };

  // Handle speech recognition result
  const handleSpeechResult = (transcript) => {
    console.log('인식된 텍스트:', transcript);

    const newMessage = {
      text: `🎤 "${transcript}"`,
      sender: 'user',
      time: getCurrentTime(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = getAIResponse(transcript);
      const aiMessage = {
        text: aiResponse,
        sender: 'ai',
        time: getCurrentTime(),
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      scrollToBottom();

      // Speak AI response
      speakText(aiResponse);
    }, 1000 + Math.random() * 1000);
  };

  // Start recording (Speech Recognition)
  const startRecording = async () => {
    if (!recognitionRef.current) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    try {
      setIsRecording(true);
      recordingStartTime.current = Date.now();

      // Update recording time
      updateRecordingTime();
      recordingInterval.current = setInterval(() => {
        updateRecordingTime();
      }, 1000);

      // Start speech recognition
      recognitionRef.current.start();
    } catch (error) {
      console.error('음성 인식 시작 오류:', error);
      alert('음성 인식을 시작할 수 없습니다.');
      stopRecording();
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);

    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('음성 인식 중지 오류:', error);
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    setIsRecording(false);

    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.error('음성 인식 취소 오류:', error);
      }
    }
  };

  // Update recording time
  const updateRecordingTime = () => {
    const elapsed = Math.floor((Date.now() - recordingStartTime.current) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    setRecordingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  };

  // Handle scroll event
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    setShowScrollDown(!isNearBottom);
  };

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setChatInput(e.target.value);

    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Toggle model selector
  const toggleModelSelector = () => {
    setModelSelectorOpen(!modelSelectorOpen);
  };

  // Select AI model
  const selectModel = (modelId) => {
    setSelectedModel(modelId);
    setModelSelectorOpen(false);
    localStorage.setItem('eume_selected_model', modelId);
    console.log('선택된 모델:', modelId);
  };

  return (
    <div className="app-container theme-ocean">
      {/* Chat Header */}
      <header className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <div className="chat-header-info">
          <div className="chat-avatar">
            <span className="avatar-emoji">🤖</span>
          </div>
          <div className="chat-title">
            <h1 className="chat-name">이음이</h1>
            <span className="chat-status">
              <span className="status-dot"></span>
              대화 가능
            </span>
          </div>
        </div>
        <button className="menu-button">
          <span>⋮</span>
        </button>
      </header>

      {/* Chat Messages */}
      <main
        className="chat-container"
        id="chatContainer"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
          {/* Date Divider */}
          <div className="date-divider">
            <span className="date-text">오늘</span>
          </div>

          {/* Welcome Message */}
          <div className="message ai">
            <div className="message-avatar">
              <span className="avatar-emoji">🤖</span>
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <p>안녕하세요! 저는 이음이예요. 😊</p>
                <p>오늘은 어떻게 지내셨나요?</p>
              </div>
              <span className="message-time">오전 10:30</span>
            </div>
          </div>

          {/* User Messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.sender === 'ai' && (
                <div className="message-avatar">
                  <span className="avatar-emoji">🤖</span>
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {formatMessage(msg.text)}
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message ai typing" id="typingIndicator">
              <div className="message-avatar">
                <span className="avatar-emoji">🤖</span>
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Down Button */}
        {showScrollDown && (
          <button
            className="scroll-down-btn"
            id="scrollDownBtn"
            onClick={() => scrollToBottom(true)}
          >
            <span>↓</span>
          </button>
        )}
      </main>

      {/* Model Selector */}
      <div className="model-selector-container">
        <button
          className={`model-selector-toggle ${modelSelectorOpen ? '' : 'collapsed'}`}
          id="modelSelectorToggle"
          onClick={toggleModelSelector}
        >
          <span id="modelToggleIcon">{modelSelectorOpen ? '▼' : '▶'}</span>
          <span>모델 선택</span>
        </button>
        <div
          className={`model-selector-dropdown ${modelSelectorOpen ? '' : 'collapsed'}`}
          id="modelSelectorDropdown"
        >
          <button
            className={`model-option ${selectedModel === 'sovereign' ? 'selected' : ''}`}
            data-model="sovereign"
            onClick={() => selectModel('sovereign')}
          >
            <img src="/shared/assets/government_logo.png" alt="소버린 AI" className="model-logo" />
            <span className="model-name">소버린 AI</span>
          </button>
          <button
            className={`model-option ${selectedModel === 'gpt' ? 'selected' : ''}`}
            data-model="gpt"
            onClick={() => selectModel('gpt')}
          >
            <img src="/shared/assets/gpt_logo.png" alt="GPT" className="model-logo" />
            <span className="model-name">GPT</span>
          </button>
          <button
            className={`model-option ${selectedModel === 'gemini' ? 'selected' : ''}`}
            data-model="gemini"
            onClick={() => selectModel('gemini')}
          >
            <img src="/shared/assets/gemini_logo.png" alt="Gemini" className="model-logo" />
            <span className="model-name">Gemini</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <footer className="chat-input-container">
        <div className="chat-input-wrapper">
          <button
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            id="voiceButton"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
          </button>

          <div className="input-field-wrapper">
            <textarea
              className="chat-input"
              id="chatInput"
              placeholder="메시지 입력"
              rows="1"
              maxLength="500"
              value={chatInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isRecording}
            />
          </div>

          <button
            className="send-button"
            id="sendButton"
            disabled={!chatInput.trim()}
            onClick={sendMessage}
          >
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
          </button>
        </div>

        {/* Voice Recording UI */}
        {isRecording && (
          <div className="voice-recording" id="voiceRecording">
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              <span className="recording-text">녹음 중...</span>
              <span className="recording-time" id="recordingTime">{recordingTime}</span>
            </div>
            <button className="cancel-recording" onClick={cancelRecording}>취소</button>
            <button className="stop-recording" onClick={stopRecording}>완료</button>
          </div>
        )}
      </footer>

      {/* Bottom Navigation */}
      <nav className="nav-bottom">
        <button className="nav-item" onClick={() => navigate('/user/home')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="nav-label">홈</span>
        </button>
        <button className="nav-item active">
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
          </svg>
          <span className="nav-label">대화</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/welfare')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="nav-label">정보</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/health')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="nav-label">건강</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/settings')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="nav-label">설정</span>
        </button>
      </nav>
    </div>
  );
}

export default Chat;
