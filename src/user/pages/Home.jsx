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
import {
  toKoreanTime,
  formatKoreanTime,
  formatRelativeTime as formatRelativeTimeUtil,
  formatDateTitle as formatDateTitleUtil,
} from '../../shared/utils/dateUtils';

const pinnedRooms = [
  {
    id: 'new-chat',
    title: '새 채팅',
    description: '빈 대화를 시작합니다',
    icon: '＋',
  },
  {
    id: 'ieum-talk',
    title: '이음이 톡',
    description: '대화/정책 RAG로 먼저 제안하는 자동 상담',
    icon: '🤖',
    badge: 'AUTO',
  },
];

// 초기 채팅 기록은 빈 배열 (API에서 로드)
const defaultHistory = [];

const initialMessages = {
  'ieum-talk': [
    {
      id: 'msg-1',
      text: '안녕하세요, 오늘 하루는 어떠셨어요?',
      sender: 'ai',
      timestamp: '09:12',
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
  const [chatListPagination, setChatListPagination] = useState({ page: 0, hasMore: false, isLoading: false }); // 채팅 목록 페이지네이션
  const [hasNewEumeMessage, setHasNewEumeMessage] = useState(false); // 이음이 톡 새 메시지 알림
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
  const loadUserChatList = async (page = 0, isLoadMore = false) => {
    // 추가 로드 시 로딩 상태 설정
    if (isLoadMore) {
      setChatListPagination((prev) => ({ ...prev, isLoading: true }));
    }

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_CHAT.LIST(page, 20));
      // API 응답 구조: { chatRooms: [...], currentPage, totalPages, hasNext, ... }
      const chatList = Array.isArray(response)
        ? response
        : response.chatRooms || response.chatLists || response.content || [];

      const hasMore = response.hasNext ?? false;

      if (chatList.length > 0) {
        // id desc 정렬 (최신 채팅방이 위로)
        const sortedList = [...chatList].sort((a, b) => {
          const idA = a.id || a.chatListId || 0;
          const idB = b.id || b.chatListId || 0;
          return idB - idA;
        });

        const formattedHistory = sortedList.map((chat) => ({
          id: chat.id || chat.chatListId,
          // roomTitle 또는 title이 없으면 생성일자로 표시
          title: chat.roomTitle || chat.title || formatDateTitle(chat.createdAt),
          updatedAt: chat.updatedAt
            ? formatRelativeTime(chat.updatedAt)
            : '이전',
        }));

        if (isLoadMore) {
          // 추가 로드: 기존 목록 뒤에 붙임
          setChatHistory((prev) => [...prev, ...formattedHistory]);
        } else {
          // 초기 로드
          setChatHistory(formattedHistory);
        }
      } else if (!isLoadMore) {
        setChatHistory([]);
      }

      // 페이지네이션 상태 업데이트
      setChatListPagination({ page, hasMore, isLoading: false });
    } catch (error) {
      // 404는 채팅 목록이 없는 경우 - 정상
      if (error.response?.status !== 404) {
        console.error('채팅 목록 로드 오류:', error);
      }
      if (!isLoadMore) {
        setChatHistory([]);
      }
      setChatListPagination((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 채팅 목록 더 불러오기
  const loadMoreChatList = () => {
    const { page, hasMore, isLoading } = chatListPagination;
    if (hasMore && !isLoading) {
      loadUserChatList(page + 1, true);
    }
  };

  // 날짜 포맷 함수들은 dateUtils에서 import
  const formatDateTitle = formatDateTitleUtil;
  const formatRelativeTime = formatRelativeTimeUtil;

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
        // 초기 로드 시 가장 최근 메시지 ID 저장 (서버에서 최신순으로 오므로 첫 번째가 가장 최근)
        if (!isLoadMore && contents[0]?.id) {
          localStorage.setItem(STORAGE_KEYS.EUME_LAST_MESSAGE_ID, String(contents[0].id));
        }

        const loadedMessages = contents.map((content, index) => ({
          id: `loaded-${content.id || index}-${page}`,
          text: content.messageContent || content.content || content.message,
          sender: content.messageType === 'USER' || content.sender === 'user' ? 'user' : 'ai',
          timestamp: formatKoreanTime(content.createdAt),
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

  // 이음이 톡 새 메시지 확인 함수
  const checkNewEumeMessage = async () => {
    try {
      // 저장된 마지막 메시지 ID 가져오기
      const savedLastId = localStorage.getItem(STORAGE_KEYS.EUME_LAST_MESSAGE_ID);

      // 캐시된 채팅방 ID 또는 기존 chatListId 사용
      let chatId = chatListId || localStorage.getItem(STORAGE_KEYS.EUME_CHAT_ID);

      if (!chatId) {
        // 채팅방 정보 조회
        try {
          const chatInfo = await axiosInstance.get(API_ENDPOINTS.EUME_CHAT.ME);
          if (chatInfo.id) {
            chatId = chatInfo.id;
          }
        } catch {
          // 채팅방이 없으면 새 메시지 없음
          return;
        }
      }

      if (!chatId) return;

      // 최신 메시지 조회 (첫 페이지만)
      const contentsResponse = await axiosInstance.get(
        API_ENDPOINTS.EUME_CHAT.CONTENTS(chatId, 0, 1)
      );

      const contents = Array.isArray(contentsResponse)
        ? contentsResponse
        : contentsResponse.contents || contentsResponse.messages || [];

      if (contents.length > 0 && contents[0]?.id) {
        const latestId = String(contents[0].id);
        // 저장된 ID와 다르면 새 메시지가 있음
        if (savedLastId && latestId !== savedLastId) {
          setHasNewEumeMessage(true);
        }
      }
    } catch (error) {
      console.error('이음이 톡 새 메시지 확인 오류:', error);
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
        } else if (!['new-chat', 'ieum-talk'].includes(selectedChatId)) {
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

    const roomIdStr = String(roomId);

    // 이음이 톡 선택 시 알림 제거
    if (roomIdStr === 'ieum-talk') {
      setHasNewEumeMessage(false);
    }

    // 새 채팅 화면 선택 시 이음이 톡 새 메시지 확인
    if (roomIdStr === 'new-chat') {
      checkNewEumeMessage();
    }

    // 이미 메시지가 로드된 경우 스킵
    if (messagesByRoom[roomId] && messagesByRoom[roomId].length > 0) {
      return;
    }

    // 고정 채팅방이 아닌 경우 (일반 채팅방) 과거 대화 로드
    const isPinnedRoom = ['new-chat', 'ieum-talk'].includes(roomIdStr);
    const isTempRoom = roomIdStr.startsWith('temp-');

    if (!isPinnedRoom && !isTempRoom) {
      // 로딩 상태 표시
      setIsLoadingChat(true);
      await loadUserChatContents(roomId);
      setIsLoadingChat(false);
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
          timestamp: formatKoreanTime(content.createdAt),
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

  const handleStartNewChat = () => {
    // API 호출 없이 임시 채팅방으로 전환
    // 실제 채팅방은 첫 메시지 전송 시 생성됨
    setSelectedChatId('new-chat');
    setMessagesByRoom((prev) => ({ ...prev, 'new-chat': [] }));
    setPrompt('');
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

    // 실제 메시지를 보낼 채팅방 ID (새 채팅의 경우 생성 후 변경됨)
    let actualRoomId = roomId;

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
      } else {
        // 새 채팅방인 경우 먼저 생성 API 호출
        const roomIdStr = String(roomId);
        const isNewChat = roomIdStr === 'new-chat' || roomIdStr.startsWith('temp-');

        if (isNewChat) {
          // 1. 채팅방 생성 API 호출
          const createResponse = await axiosInstance.post(API_ENDPOINTS.USER_CHAT.CREATE);
          const newChatId = createResponse.id || createResponse.chatListId;

          if (newChatId) {
            actualRoomId = newChatId;

            // 채팅 목록에 새 채팅방 추가 (제목은 첫 메시지 텍스트)
            const newEntry = {
              id: newChatId,
              title: messageText.length > 30 ? messageText.slice(0, 30) + '...' : messageText,
              updatedAt: '방금 전',
            };
            setChatHistory((prev) => [newEntry, ...prev]);

            // 기존 메시지를 새 채팅방으로 이동
            setMessagesByRoom((prev) => {
              const currentMessages = prev[roomId] || [];
              const newState = { ...prev, [newChatId]: currentMessages };
              // 임시 채팅방 메시지 삭제
              if (roomIdStr === 'new-chat') {
                newState['new-chat'] = [];
              }
              return newState;
            });

            // 선택된 채팅방 ID 변경
            setSelectedChatId(newChatId);

            // streaming 상태도 새 채팅방으로 이동
            setIsStreamingByRoom((prev) => ({
              ...prev,
              [newChatId]: true,
              [roomId]: false,
            }));
          }
        }

        // 2. 메시지 전송 API 호출
        const response = await axiosInstance.post(
          API_ENDPOINTS.USER_CHAT.CONTENTS(actualRoomId),
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
          [actualRoomId]: [...(prev[actualRoomId] || []), aiMessage],
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
      // 원래 roomId와 actualRoomId 둘 다 streaming 해제
      setIsStreamingByRoom((prev) => ({
        ...prev,
        [roomId]: false,
        [actualRoomId]: false,
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
        chatListPagination={chatListPagination}
        onLoadMoreChatList={loadMoreChatList}
        hasNewEumeMessage={hasNewEumeMessage}
      />

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 60 }} ref={messagesContainerRef}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

        <div className="chat-messages">
          {isLoadingChat ? (
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
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!prompt.trim()}
                    aria-label="전송"
                  >
                    ➤
                  </button>
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
