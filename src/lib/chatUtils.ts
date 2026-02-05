import { supabase } from "@/integrations/supabase/client";

// Message type
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

// Generate 4-digit numeric session code
export const generateSessionCode = (): string => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, byte => (byte % 10).toString()).join('');
};

// Check if a session exists in database
export const sessionExists = async (code: string): Promise<boolean> => {
  console.log('Checking if session exists:', code);
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('code')
      .eq('code', code.trim())
      .maybeSingle();
    
    console.log('Session check result:', { data, error, codeSearched: code.trim() });
    
    if (error) {
      console.error('Session check error:', error);
      return false;
    }
    
    return data !== null;
  } catch (err) {
    console.error('Session check exception:', err);
    return false;
  }
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
  isSystem: boolean = false,
  fileUrl?: string,
  fileType?: string,
  fileName?: string
): Promise<boolean> => {
  console.log('Adding message:', { sessionCode, sender, content, isSystem, fileUrl, fileType, fileName });
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_code: sessionCode,
        sender,
        content,
        is_system: isSystem,
        file_url: fileUrl || null,
        file_type: fileType || null,
        file_name: fileName || null
      })
      .select();
    
    console.log('Add message result:', { data, error });
    
    if (error) {
      console.error('Add message error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Add message exception:', err);
    return false;
  }
};

// Upload file to storage
export const uploadFile = async (
  sessionCode: string,
  file: File
): Promise<{ url: string; type: string; name: string } | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${sessionCode}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  console.log('Uploading file:', { fileName, fileType: file.type, fileSize: file.size });
  
  const { data, error } = await supabase.storage
    .from('chat-attachments')
    .upload(fileName, file);
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(data.path);
  
  return {
    url: urlData.publicUrl,
    type: file.type,
    name: file.name
  };
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
    isSystem: msg.is_system,
    fileUrl: msg.file_url || undefined,
    fileType: msg.file_type || undefined,
    fileName: msg.file_name || undefined
  }));
};

// Delete all room data (session, messages, reactions, reads, and files)
export const deleteRoomData = async (sessionCode: string): Promise<boolean> => {
  console.log('Deleting room data for session:', sessionCode);
  
  try {
    // First get all messages to find file URLs
    const { data: messages } = await supabase
      .from('messages')
      .select('file_url')
      .eq('session_code', sessionCode)
      .not('file_url', 'is', null);
    
    // Delete files from storage
    if (messages && messages.length > 0) {
      const filePaths = messages
        .filter(m => m.file_url)
        .map(m => {
          // Extract path from URL: ...chat-attachments/sessionCode/filename
          const url = m.file_url as string;
          const match = url.match(/chat-attachments\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
      
      if (filePaths.length > 0) {
        console.log('Deleting files:', filePaths);
        await supabase.storage.from('chat-attachments').remove(filePaths);
      }
    }
    
    // Delete message reactions
    const { data: messageIds } = await supabase
      .from('messages')
      .select('id')
      .eq('session_code', sessionCode);
    
    if (messageIds && messageIds.length > 0) {
      const ids = messageIds.map(m => m.id);
      await supabase
        .from('message_reactions')
        .delete()
        .in('message_id', ids);
    }
    
    // Delete message reads
    await supabase
      .from('message_reads')
      .delete()
      .eq('session_code', sessionCode);
    
    // Delete messages
    await supabase
      .from('messages')
      .delete()
      .eq('session_code', sessionCode);
    
    // Delete session
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('code', sessionCode);
    
    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }
    
    console.log('Room data deleted successfully');
    return true;
  } catch (err) {
    console.error('Error deleting room data:', err);
    return false;
  }
};
