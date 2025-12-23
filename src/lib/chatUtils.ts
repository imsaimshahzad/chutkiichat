import { supabase } from "@/integrations/supabase/client";

// Message type
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
}

// Generate random 4-digit numeric session code
export const generateSessionCode = (): string => {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

// Check if a session exists in database
export const sessionExists = async (code: string): Promise<boolean> => {
  console.log('Checking if session exists:', code);
  const { data, error } = await supabase
    .from('sessions')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  
  console.log('Session check result:', { data, error });
  return !error && data !== null;
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

// Format time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Create a new session in database
export const createSession = async (code: string): Promise<boolean> => {
  console.log('Creating session:', code);
  const { data, error } = await supabase
    .from('sessions')
    .insert({ code })
    .select();
  
  console.log('Create session result:', { data, error });
  return !error;
};

// Add a message to the database
export const addMessage = async (
  sessionCode: string, 
  sender: string, 
  content: string, 
  isSystem: boolean = false
): Promise<boolean> => {
  const { error } = await supabase
    .from('messages')
    .insert({
      session_code: sessionCode,
      sender,
      content,
      is_system: isSystem
    });
  
  return !error;
};

// Get messages for a session
export const getMessages = async (sessionCode: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_code', sessionCode)
    .order('created_at', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(msg => ({
    id: msg.id,
    sender: msg.sender,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    isOwn: false, // Will be set by component
    isSystem: msg.is_system
  }));
};
