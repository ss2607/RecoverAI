import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5010'}/api/conversations`;

export interface Conversation {
  _id: string;
  claim: any;
  item: any;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  claimant: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCountOwner: number;
  unreadCountClaimant: number;
  meetingLocation: string;
  meetingTime: string;
  meetingStatus: 'awaiting_meeting' | 'scheduled' | 'completed';
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  isSystem: boolean;
  imageUrl: string;
  read: boolean;
  createdAt: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getOrCreateConversation = async (claimId: string): Promise<Conversation> => {
  const response = await axios.post(BASE_URL, { claimId }, getHeaders());
  return response.data.data;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await axios.get(`${BASE_URL}/${conversationId}/messages`, getHeaders());
  return response.data.data;
};

export const sendMessage = async (conversationId: string, text: string, imageUrl: string = ''): Promise<Message> => {
  const response = await axios.post(`${BASE_URL}/${conversationId}/messages`, { text, imageUrl }, getHeaders());
  return response.data.data;
};

export const updateMeetingDetails = async (
  conversationId: string,
  location?: string,
  time?: string,
  status?: 'awaiting_meeting' | 'scheduled' | 'completed'
): Promise<{ conversation: Conversation; systemMsg: Message }> => {
  const response = await axios.put(`${BASE_URL}/${conversationId}/meeting`, { location, time, status }, getHeaders());
  return response.data.data;
};

export const getUserConversations = async (): Promise<Conversation[]> => {
  const response = await axios.get(BASE_URL, getHeaders());
  return response.data.data;
};

export const getConversationById = async (conversationId: string): Promise<Conversation> => {
  const response = await axios.get(`${BASE_URL}/${conversationId}`, getHeaders());
  return response.data.data;
};
