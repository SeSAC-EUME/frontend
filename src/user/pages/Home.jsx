import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import axiosRaw from '../../shared/api/axiosRaw';
import { STORAGE_KEYS } from '../../shared/constants/storage';

const pinnedRooms = [
  {
    id: 'new-chat',
    title: '새 채팅',
    description: '빈 대화를 시작합니다',
    icon: '＋',
  },
  {
    id: 'policy-info',
    title: '정책 정보',
    description: '정책/제도 안내를 받아보세요',
    icon: '⚖️',
  },
  {
    id: 'ieum-talk',
    title: '이음이 톡',
    description: '대화/정책 RAG로 먼저 제안하는 자동 상담',
    icon: '🤖',
    badge: 'AUTO',
  },
];

const defaultHistory = [
  { id: 'h-1', title: '세상 목욕 제공', updatedAt: '방금 전' },
  { id: 'h-2', title: 'TTS 기능 제공 여부', updatedAt: '오늘' },
  { id: 'h-3', title: '학점은행제 자격증 인정', updatedAt: '오늘' },
  { id: 'h-4', title: 'R 언어 개요 설명', updatedAt: '오늘' },
  { id: 'h-5', title: '자동 sql 실행 방법', updatedAt: '오늘' },
];

const initialMessages = {
  'ieum-talk': [
    {
      id: 'msg-1',
      text: '안녕하세요, 오늘 하루는 어떠셨어요?',
      sender: 'ai',
      timestamp: '09:12',
    },
  ],
  'policy-info': [
    {
      id: 'msg-2',
      text: '필요한 정책 키워드를 알려주시면 바로 찾아볼게요.',
      sender: 'ai',
      timestamp: '09:10',
    },
  ],
  'new-chat': [],
};

const emptyUser = {
  userId: '',
  email: '',
  userName: '사용자',
  nickname: '',
  profileImage: '',
};

function Home() {
  const navigate = useNavigate();
  const { theme: currentTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messagesByRoom, setMessagesByRoom] = useState(initialMessages);
  const [isStreamingByRoom, setIsStreamingByRoom] = useState({});
  const [chatHistory, setChatHistory] = useState(defaultHistory);
  const [selectedChatId, setSelectedChatId] = useState('ieum-talk');
  const [userInfo, setUserInfo] = useState(emptyUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [chatListId, setChatListId] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true); // 채팅 로딩 상태
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 인증 확인 상태
  const [paginationByRoom, setPaginationByRoom] = useState({}); // 페이지네이션 상태 { roomId: { page, hasMore, isLoadingMore } }
  const messagesContainerRef = useRef(null);
  const shouldScrollToBottom = useRef(false); // 하단 스크롤 필요 여부 플래그

  // 인증 확인 및 사용자 정보 초기화
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // 1. localStorage에서 사용자 정보 확인
        const storedUserStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);

        if (!storedUserStr) {
          // localStorage에 정보 없음 - 로그인 페이지로
          console.log('사용자 정보 없음 - 로그인 페이지로 이동');
          navigate('/user/login', { replace: true });
          return;
        }

        const storedUser = JSON.parse(storedUserStr);

        // 2. 사용자 정보 설정
        setUserInfo({
          userId: storedUser.id || storedUser.userId || '',
          email: storedUser.email || '',
          userName: storedUser.userName || storedUser.name || '사용자',
          nickname: storedUser.nickname || '',
          profileImage: storedUser.profileImage || '',
        });

        // 3. 백엔드 인증 확인 (선택적)
        try {
          await axiosInstance.get(API_ENDPOINTS.USER.ME);
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            // 인증 실패 - localStorage 정리 후 로그인 페이지로
            console.log('인증 실패 - 로그인 페이지로 이동');
            localStorage.removeItem(STORAGE_KEYS.USER_INFO);
            localStorage.removeItem(STORAGE_KEYS.USER_THEME);
            localStorage.removeItem(STORAGE_KEYS.EUME_CHAT_ID);
            navigate('/user/login', { replace: true });
            return;
          }
        }

        // 4. 인증 완료 - 채팅 초기화
        setIsCheckingAuth(false);
        initializeEumeChat();
        loadUserChatList();
      } catch (error) {
        console.error('사용자 초기화 오류:', error);
        navigate('/user/login', { replace: true });
      }
    };

    initializeUser();
  }, [navigate]);

  // 사용자 채팅 목록 로드 (GET /api/user-chats)
  const loadUserChatList = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_CHAT.LIST);
      const chatList = Array.isArray(response) ? response : response.chatLists || [];

      if (chatList.length > 0) {
        // id desc 정렬 (최신 채팅방이 위로)
        const sortedList = [...chatList].sort((a, b) => {
          const idA = a.id || a.chatListId || 0;
          const idB = b.id || b.chatListId || 0;
          return idB - idA;
        });

        const formattedHistory = sortedList.map((chat) => ({
          id: chat.id || chat.chatListId,
          // title이 없으면 생성일자로 표시
          title: chat.title || formatDateTitle(chat.createdAt),
          updatedAt: chat.updatedAt
            ? formatRelativeTime(chat.updatedAt)
            : '이전',
        }));
        setChatHistory(formattedHistory);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      // 404는 채팅 목록이 없는 경우 - 정상
      if (error.response?.status !== 404) {
        console.error('채팅 목록 로드 오류:', error);
      }
      setChatHistory([]);
    }
  };

  // 날짜를 채팅방 제목으로 포맷
  const formatDateTitle = (dateString) => {
    if (!dateString) return '새 채팅';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes} 대화`;
  };

  // 상대 시간 포맷 (예: "방금 전", "1시간 전", "어제")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay === 1) return '어제';
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // Eume AI 채팅방 생성 또는 조회
  const initializeEumeChat = async () => {
    setIsLoadingChat(true);
    try {
      // 1. localStorage에서 캐시된 chatListId 확인
      const cachedChatId = localStorage.getItem(STORAGE_KEYS.EUME_CHAT_ID);
      if (cachedChatId) {
        console.log('캐시된 채팅방 ID 사용:', cachedChatId);
        setChatListId(cachedChatId);
        await loadChatContents(cachedChatId);
        return;
      }

      // 2. POST /api/eume-chats (201: 새로 생성, 409: 이미 존재)
      const response = await axiosRaw.post(API_ENDPOINTS.EUME_CHAT.CREATE);
      if (response.status === 201) {
        console.log('Eume 채팅방 생성:', response.data);
        const newChatId = response.data?.id;
        if (newChatId) {
          setChatListId(newChatId);
          localStorage.setItem(STORAGE_KEYS.EUME_CHAT_ID, newChatId);
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        // 이미 채팅방 존재 - 기존 채팅 내역 로드
        console.log('기존 Eume 채팅방 사용');
        await loadExistingChat();
      } else {
        console.error('채팅방 초기화 오류:', error);
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  // 기존 채팅방 정보 조회 후 내역 로드
  const loadExistingChat = async () => {
    try {
      // GET /api/eume-chats/me 로 채팅방 정보 조회
      const chatInfo = await axiosInstance.get(API_ENDPOINTS.EUME_CHAT.ME);
      console.log('기존 채팅 정보:', chatInfo);

      if (chatInfo.id) {
        setChatListId(chatInfo.id);
        localStorage.setItem(STORAGE_KEYS.EUME_CHAT_ID, chatInfo.id);

        // 채팅 내역 로드
        await loadChatContents(chatInfo.id);
      }
    } catch (error) {
      console.error('채팅방 조회 오류:', error);
    }
  };

  // 채팅 내역 로드 (GET /api/eume-chats/{id}/contents)
  const loadChatContents = async (chatId, page = 0, isLoadMore = false) => {
    const roomId = 'ieum-talk';

    // 추가 로드 시 로딩 상태 설정
    if (isLoadMore) {
      setPaginationByRoom((prev) => ({
        ...prev,
        [roomId]: { ...prev[roomId], isLoadingMore: true },
      }));
    }

    try {
      const contentsResponse = await axiosInstance.get(
        API_ENDPOINTS.EUME_CHAT.CONTENTS(chatId, page, 20)
      );
      console.log('채팅 내역:', contentsResponse);

      // 응답이 배열인 경우 (메시지 목록)
      const contents = Array.isArray(contentsResponse)
        ? contentsResponse
        : contentsResponse.contents || contentsResponse.messages || [];

      // 페이지네이션 정보 추출
      const hasMore = contentsResponse.hasNext ?? contents.length >= 20;

      if (contents.length > 0) {
        const loadedMessages = contents.map((content, index) => ({
          id: `loaded-${content.id || index}-${page}`,
          text: content.messageContent || content.content || content.message,
          sender: content.messageType === 'USER' || content.sender === 'user' ? 'user' : 'ai',
          timestamp: content.createdAt
            ? new Date(content.createdAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
        }));

        // 서버에서 최신순으로 오는 경우 reverse (오래된 것이 위, 최신이 아래)
        const orderedMessages = [...loadedMessages].reverse();

        setMessagesByRoom((prev) => {
          if (isLoadMore) {
            // 추가 로드: 이전 메시지를 앞에 붙임
            return {
              ...prev,
              [roomId]: [...orderedMessages, ...(prev[roomId] || [])],
            };
          }
          // 초기 로드: 하단 스크롤 플래그 설정
          shouldScrollToBottom.current = true;
          return {
            ...prev,
            [roomId]: orderedMessages,
          };
        });
      }

      // 페이지네이션 상태 업데이트
      setPaginationByRoom((prev) => ({
        ...prev,
        [roomId]: { page, hasMore, isLoadingMore: false },
      }));
    } catch (error) {
      // 404는 아직 대화 내역이 없는 경우 - 정상
      if (error.response?.status !== 404) {
        console.error('채팅 내역 로드 오류:', error);
      }
      setPaginationByRoom((prev) => ({
        ...prev,
        [roomId]: { page: 0, hasMore: false, isLoadingMore: false },
      }));
    }
  };

  const selectedChat = useMemo(() => {
    return (
      pinnedRooms.find((room) => room.id === selectedChatId) ||
      chatHistory.find((room) => room.id === selectedChatId) ||
      pinnedRooms[0]
    );
  }, [chatHistory, selectedChatId]);

  const currentMessages = messagesByRoom[selectedChatId] || [];
  const isStreaming = !!isStreamingByRoom[selectedChatId];
  const currentPagination = paginationByRoom[selectedChatId] || { page: 0, hasMore: false, isLoadingMore: false };

  // 하단 스크롤 처리 (초기 로드 또는 새 메시지 시에만)
  useEffect(() => {
    if (messagesContainerRef.current && shouldScrollToBottom.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
      shouldScrollToBottom.current = false;
    }
  }, [currentMessages.length, isStreaming]);

  // 채팅방 변경 시 하단 스크롤 플래그 설정
  useEffect(() => {
    shouldScrollToBottom.current = true;
  }, [selectedChatId]);

  // 무한 스크롤: 맨 위로 스크롤 시 이전 메시지 로드
  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // 맨 위에 도달했을 때 (약간의 여유 두어 50px 이내)
    if (container.scrollTop < 50) {
      const { page, hasMore, isLoadingMore } = currentPagination;

      if (hasMore && !isLoadingMore) {
        // 무한 스크롤 시 하단 스크롤 방지
        shouldScrollToBottom.current = false;
        const previousScrollHeight = container.scrollHeight;

        if (selectedChatId === 'ieum-talk' && chatListId) {
          await loadChatContents(chatListId, page + 1, true);
        } else if (!['new-chat', 'policy-info', 'ieum-talk'].includes(selectedChatId)) {
          await loadUserChatContents(selectedChatId, page + 1, true);
        }

        // 이전 메시지 로드 후 스크롤 위치 유지 (새로 추가된 높이만큼 아래로)
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
      }
    }
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedChatId, currentPagination, chatListId]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSelectRoom = async (roomId) => {
    setSelectedChatId(roomId);
    setPrompt('');
    setIsSidebarOpen(false);

    // 이미 메시지가 로드된 경우 스킵
    if (messagesByRoom[roomId] && messagesByRoom[roomId].length > 0) {
      return;
    }

    // 고정 채팅방이 아닌 경우 (일반 채팅방) 과거 대화 로드
    const isPinnedRoom = ['new-chat', 'policy-info', 'ieum-talk'].includes(roomId);
    if (!isPinnedRoom && !roomId.startsWith('temp-')) {
      await loadUserChatContents(roomId);
    } else {
      // 고정 채팅방은 빈 배열로 초기화
      setMessagesByRoom((prev) =>
        prev[roomId] ? prev : { ...prev, [roomId]: [] }
      );
    }
  };

  // 일반 채팅방 내용 로드 (GET /api/user-chats/{chatListId}/contents)
  const loadUserChatContents = async (chatId, page = 0, isLoadMore = false) => {
    // 추가 로드 시 로딩 상태 설정
    if (isLoadMore) {
      setPaginationByRoom((prev) => ({
        ...prev,
        [chatId]: { ...prev[chatId], isLoadingMore: true },
      }));
    }

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_CHAT.CONTENTS(chatId, page, 20));
      const contents = Array.isArray(response) ? response : response.contents || [];

      // 페이지네이션 정보 추출
      const hasMore = response.hasNext ?? contents.length >= 20;

      if (contents.length > 0) {
        const loadedMessages = contents.map((content, index) => ({
          id: `loaded-${content.id || index}-${page}`,
          text: content.messageContent || content.content || content.message,
          sender: content.messageType === 'USER' || content.sender === 'user' ? 'user' : 'ai',
          timestamp: content.createdAt
            ? new Date(content.createdAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
        }));

        // 서버에서 최신순으로 오는 경우 reverse (오래된 것이 위, 최신이 아래)
        const orderedMessages = [...loadedMessages].reverse();

        setMessagesByRoom((prev) => {
          if (isLoadMore) {
            // 추가 로드: 이전 메시지를 앞에 붙임
            return {
              ...prev,
              [chatId]: [...orderedMessages, ...(prev[chatId] || [])],
            };
          }
          // 초기 로드: 하단 스크롤 플래그 설정
          shouldScrollToBottom.current = true;
          return {
            ...prev,
            [chatId]: orderedMessages,
          };
        });
      } else if (!isLoadMore) {
        setMessagesByRoom((prev) => ({
          ...prev,
          [chatId]: [],
        }));
      }

      // 페이지네이션 상태 업데이트
      setPaginationByRoom((prev) => ({
        ...prev,
        [chatId]: { page, hasMore, isLoadingMore: false },
      }));
    } catch (error) {
      // 404는 대화 내역이 없는 경우 - 정상
      if (error.response?.status !== 404) {
        console.error('채팅 내용 로드 오류:', error);
      }
      setMessagesByRoom((prev) => ({
        ...prev,
        [chatId]: [],
      }));
      setPaginationByRoom((prev) => ({
        ...prev,
        [chatId]: { page: 0, hasMore: false, isLoadingMore: false },
      }));
    }
  };

  const handleStartNewChat = async () => {
    try {
      // POST /api/user-chats - 새 채팅방 생성
      const response = await axiosInstance.post(API_ENDPOINTS.USER_CHAT.CREATE);
      const newChatId = response.id || response.chatListId;

      if (newChatId) {
        const newEntry = {
          id: newChatId,
          title: response.title || '새 채팅',
          updatedAt: '방금 전',
        };
        setChatHistory((prev) => [newEntry, ...prev]);
        setMessagesByRoom((prev) => ({ ...prev, [newChatId]: [] }));
        handleSelectRoom(newChatId);
      }
    } catch (error) {
      console.error('새 채팅 생성 오류:', error);
      // 백엔드 오류 시 로컬 임시 채팅방 생성
      const tempId = `temp-${Date.now()}`;
      const newEntry = { id: tempId, title: '새 채팅', updatedAt: '방금 전' };
      setChatHistory((prev) => [newEntry, ...prev]);
      setMessagesByRoom((prev) => ({ ...prev, [tempId]: [] }));
      handleSelectRoom(tempId);
    }
  };

  const handleActionClick = (id) => {
    if (id === 'new-chat') {
      handleStartNewChat();
      return;
    }
    handleSelectRoom(id);
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const roomId = selectedChatId;
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      id: `user-${Date.now()}`,
      text: prompt.trim(),
      sender: 'user',
      timestamp,
    };

    // 새 메시지 추가: 하단 스크롤 플래그 설정
    shouldScrollToBottom.current = true;
    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), userMessage],
    }));
    const messageText = prompt.trim();
    setPrompt('');

    setChatHistory((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, updatedAt: '지금' } : room
      )
    );

    setIsStreamingByRoom((prev) => ({ ...prev, [roomId]: true }));

    try {
      // ieum-talk인 경우 Eume AI API 호출
      if (roomId === 'ieum-talk') {
        // chatListId가 없으면 조회
        let currentChatListId = chatListId;
        if (!currentChatListId) {
          const chatInfo = await axiosInstance.get(API_ENDPOINTS.EUME_CHAT.ME);
          currentChatListId = chatInfo.id;
          setChatListId(currentChatListId);
        }

        // POST /api/eume-chats/{chatListId}/contents
        console.log('=== EUME_CHAT API 요청 ===');
        console.log('URL:', API_ENDPOINTS.EUME_CHAT.CONTENTS(currentChatListId));
        console.log('Body:', { messageContent: messageText });

        const response = await axiosInstance.post(
          API_ENDPOINTS.EUME_CHAT.CONTENTS(currentChatListId),
          { messageContent: messageText }
        );

        console.log('=== EUME_CHAT API 응답 ===');
        console.log('Response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        console.log('===========================');

        // 백엔드 응답에서 AI 메시지 추출
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: response.eumeMessage?.messageContent || '답변을 생성할 수 없습니다.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        // AI 응답: 하단 스크롤 플래그 설정
        shouldScrollToBottom.current = true;
        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), aiMessage],
        }));
      } else if (roomId === 'policy-info') {
        // 정책 정보 채팅방은 목업 유지 (별도 API 미구현)
        setTimeout(() => {
          const aiMessage = {
            id: `ai-${Date.now()}`,
            text: '정책 정보 검색 기능은 준비 중입니다.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          // AI 응답: 하단 스크롤 플래그 설정
          shouldScrollToBottom.current = true;
          setMessagesByRoom((prev) => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), aiMessage],
          }));
        }, 600);
      } else {
        // 일반 채팅방은 USER_CHAT API 호출
        const response = await axiosInstance.post(
          API_ENDPOINTS.USER_CHAT.CONTENTS(roomId),
          { messageContent: messageText }
        );

        // 백엔드 응답에서 AI 메시지 추출
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: response.eumeMessage?.messageContent || response.message || '답변을 생성할 수 없습니다.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        // AI 응답: 하단 스크롤 플래그 설정
        shouldScrollToBottom.current = true;
        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), aiMessage],
        }));
      }
    } catch (error) {
      // 디버깅 로그
      console.error('=== 메시지 전송 오류 상세 ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error code:', error.code);
      console.error('Is timeout?:', error.code === 'ECONNABORTED');
      console.error('============================');

      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `메시지 전송 중 오류가 발생했습니다. (${error.code || error.response?.status || 'unknown'})`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      // 에러 메시지도 하단 스크롤
      shouldScrollToBottom.current = true;
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), errorMessage],
      }));
    } finally {
      setIsStreamingByRoom((prev) => ({
        ...prev,
        [roomId]: false,
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = currentMessages.length > 0;

  // 인증 확인 중에는 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className={`theme-${currentTheme} home-page`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-${currentTheme} home-page`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedChatId={selectedChatId}
        onActionClick={handleActionClick}
        chatHistory={chatHistory}
        onSelectRoom={handleSelectRoom}
        userInfo={userInfo}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 60 }}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

        <div className="chat-messages" ref={messagesContainerRef}>
          {isLoadingChat && selectedChatId === 'ieum-talk' ? (
            <div className="chat-welcome">
              <div style={{ textAlign: 'center', color: '#666' }}>
                <p>대화 내역을 불러오는 중...</p>
              </div>
            </div>
          ) : !hasMessages ? (
            <div className="chat-welcome">
              <h2 className="welcome-title">어디서부터 시작할까요?</h2>
              <div className="prompt-bar prompt-bar-large">
                <span className="prompt-icon">＋</span>
                <input
                  className="prompt-input"
                  placeholder="무엇이든 물어보세요"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="prompt-actions">
                  <button className="prompt-action" aria-label="음성 입력">🎙️</button>
                  <button className="prompt-action" aria-label="업로드">⬆️</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 무한 스크롤 로딩 인디케이터 */}
              {currentPagination.isLoadingMore && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>
                  이전 대화 불러오는 중...
                </div>
              )}
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-timestamp">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {isStreaming ? (
                <div className="message ai">
                  <div className="message-content">
                    <div className="message-text">답변 작성 중...</div>
                    <div className="message-timestamp">지금</div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {hasMessages && (
          <div
            className="chat-input-container"
            style={
              isSidebarOpen
                ? { left: 320, width: 'calc(100% - 320px)' }
                : { left: 0, width: '100%' }
            }
          >
            <div className="chat-input-wrapper chat-input-floating">
              <textarea
                className="chat-input"
                placeholder="메시지를 입력하세요..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button className="send-btn" onClick={handleSendMessage} disabled={!prompt.trim()}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
