// Message type
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

// Session storage for active sessions (in-memory simulation)
const activeSessions = new Map<string, { messages: Message[], participants: string[] }>();

// Generate random 4-digit numeric session code
export const generateSessionCode = (): string => {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

// Check if a session exists
export const sessionExists = (code: string): boolean => {
  return activeSessions.has(code);
};

// Generate anonymous name
const adjectives = [
  'Swift', 'Silent', 'Cosmic', 'Mystic', 'Shadow', 'Golden', 'Silver', 'Crystal',
  'Thunder', 'Crimson', 'Azure', 'Emerald', 'Phantom', 'Stellar', 'Neon', 'Velvet'
];

const nouns = [
  'Fox', 'Wolf', 'Hawk', 'Owl', 'Tiger', 'Dragon', 'Phoenix', 'Raven',
  'Panther', 'Falcon', 'Viper', 'Lion', 'Bear', 'Eagle', 'Shark', 'Cobra'
];

export const generateAnonymousName = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adjective}${noun}${number}`;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const createSession = (code: string, creatorName: string) => {
  activeSessions.set(code, { 
    messages: [], 
    participants: [creatorName] 
  });
};

export const joinSession = (code: string, userName: string): boolean => {
  const session = activeSessions.get(code);
  if (session) {
    if (!session.participants.includes(userName)) {
      session.participants.push(userName);
    }
    return true;
  }
  return false;
};

export const getSession = (code: string) => {
  return activeSessions.get(code);
};

export const addMessage = (code: string, message: Message) => {
  const session = activeSessions.get(code);
  if (session) {
    session.messages.push(message);
  }
};

export const getMessages = (code: string): Message[] => {
  return activeSessions.get(code)?.messages || [];
};
