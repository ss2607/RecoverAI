import React, { useEffect, useState, useContext, useRef } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Chip, Card, CardContent, Stack, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext';
import { socketService } from '../../../services/socketService';
import { getConversationById, getMessages, sendMessage, updateMeetingDetails, type Conversation, type Message } from '../services/chatService';
import { confirmReturn } from '../services/claimService';
import { uploadImage } from '../../items/services/uploadService';
import { 
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  ImageOutlined as ImageIcon,
  History as HistoryIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMessageText, setChatMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newStatus, setNewStatus] = useState<'awaiting_meeting' | 'scheduled' | 'completed'>('awaiting_meeting');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  const handleConfirmExchange = async () => {
    if (!conversation?.claim?._id) return;
    try {
      setSubmittingConfirm(true);
      const res = await confirmReturn(conversation.claim._id);
      if (res.success) {
        await loadChatData(false);
      } else {
        alert(res.message || 'Failed to confirm exchange');
      }
    } catch (err: any) {
      console.error('Error confirming exchange:', err);
      alert(err.response?.data?.message || 'Error confirming exchange');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async (showSkeleton = false) => {
    if (!id) return;
    try {
      if (showSkeleton) setLoading(true);
      const conv = await getConversationById(id);
      setConversation(conv);
      setNewLocation(conv.meetingLocation || '');
      setNewTime(conv.meetingTime || '');
      setNewStatus(conv.meetingStatus || 'awaiting_meeting');
      
      const msgs = await getMessages(id);
      setMessages(msgs);

      // Join socket room
      const socket = socketService.getSocket();
      if (socket) {
        console.log(`[CLIENT] Socket is available. Connected ID: ${socket.id}. Emitting join_conversation...`);
        socket.emit('join_conversation', { conversationId: id });
      } else {
        console.warn('[CLIENT] Socket not initialized yet during loadChatData');
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData(true);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const socket = socketService.getSocket();
    const handleConnect = () => {
      console.log(`[CLIENT] Socket connected event fired. Socket ID: ${socket?.id}. Emitting join_conversation...`);
      socket?.emit('join_conversation', { conversationId: id });
    };

    if (socket) {
      if (socket.connected) {
        handleConnect();
      }
      socket.on('connect', handleConnect);
    }

    const handleReceiveMessage = (data: any) => {
      console.log("receive_message fired", data);
      const message = data.message || data;
      console.log(`[CLIENT] Comparing message.conversation (${message?.conversation}) with current id (${id})`);
      if (message && message.conversation === id) {
        console.log("Before messages length:", messages.length);
        setMessages(prev => {
          console.log("Inside setMessages callback. prev length:", prev.length);
          prev.forEach(m => {
            console.log(`Checking duplicate: existing _id=${m._id} vs incoming _id=${message._id}`);
          });
          if (prev.some(m => m._id === message._id)) {
            console.log("Duplicate detected. Skipping append.");
            return prev;
          }
          console.log('[CLIENT] Appending received message to messages list:', message);
          return [...prev, message];
        });
        console.log("After state update requested");
      } else {
        console.log("[CLIENT] Message ignored: conversation ID mismatch or message null");
      }
    };

    const handleMeetingUpdated = (data: any) => {
      console.log('[CLIENT] Received meeting_updated event payload:', data);
      if (data && data.conversationId === id) {
        // Re-load the conversation data to sync the new confirmation state and status in real time
        loadChatData(false);
      }
    };

    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('meeting_updated', handleMeetingUpdated);

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
      }
      socketService.off('receive_message', handleReceiveMessage);
      socketService.off('meeting_updated', handleMeetingUpdated);
    };
  }, [id]);

  useEffect(() => {
    console.log('Messages state updated hook:', messages);
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedMessage = chatMessageText.trim();
    if (!trimmedMessage || !id) return;
    try {
      console.log('1. Before calling sendMessage(), sending:', trimmedMessage);
      const msg = await sendMessage(id, trimmedMessage);
      console.log('2. The returned message from sendMessage():', msg);
      
      setMessages(prev => {
        console.log('3. The previous messages array length inside setMessages():', prev.length);
        const exists = prev.some(m => m._id === msg._id);
        const nextMsgs = exists ? prev : [...prev, msg];
        console.log('4. The new messages array length returned from setMessages():', nextMsgs.length);
        return nextMsgs;
      });
      setChatMessageText('');
      
      console.log(`[CLIENT] Emitting send_message to conversation room: ${id}. Payload:`, msg);
      socketService.getSocket()?.emit('send_message', {
        conversationId: id,
        message: msg
      });

      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploadingImage(true);
      const res = await uploadImage(file);
      if (res.data?.url) {
        const msg = await sendMessage(id, 'Sent a photo', res.data.url);
        setMessages(prev => [...prev, msg]);
        socketService.getSocket()?.emit('send_message', {
          conversationId: id,
          message: msg
        });
      }
    } catch (err) {
      console.error('Error uploading chat image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateMeeting = async () => {
    if (!id) return;
    try {
      const result = await updateMeetingDetails(id, newLocation, newTime, newStatus);
      setConversation(result.conversation);
      setMessages(prev => [...prev, result.systemMsg]);
      
      socketService.getSocket()?.emit('meeting_updated', {
        conversationId: id,
        meetingLocation: newLocation,
        meetingTime: newTime,
        meetingStatus: newStatus
      });
      socketService.getSocket()?.emit('send_message', {
        conversationId: id,
        message: result.systemMsg
      });

      setMeetingDialogOpen(false);
    } catch (err) {
      console.error('Error updating meeting:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Loading secure room...</Typography>
      </Container>
    );
  }

  if (!conversation) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography color="error">Conversation not found or not authorized.</Typography>
      </Container>
    );
  }

  const isOwner = conversation.owner?._id === user?.id;
  const otherUser = isOwner ? conversation.claimant : conversation.owner;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link} 
          to="/conversations" 
          startIcon={<ArrowBackIcon />}
          sx={{ fontWeight: 700 }}
        >
          Back to Conversations
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Meeting Coordinator Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #E7DDD1', borderRadius: '16px', bgcolor: '#FFFCF8' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsIcon color="primary" /> Meeting Details
              </Typography>

              <Stack spacing={2.5} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    📍 Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {conversation.meetingLocation || 'Not set yet'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    🕒 Proposed Time
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {conversation.meetingTime || 'Not set yet'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={(conversation.meetingStatus || 'awaiting_meeting').replace('_', ' ').toUpperCase()}
                      size="small"
                      color={conversation.meetingStatus === 'completed' ? 'success' : conversation.meetingStatus === 'scheduled' ? 'primary' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                disabled={conversation.claim?.status === 'completed'}
                onClick={() => setMeetingDialogOpen(true)}
                sx={{ borderRadius: '10px', fontWeight: 700, mb: 2 }}
              >
                Update Details
              </Button>

              {(() => {
                const claim = conversation.claim;
                const isMeOwner = conversation.owner?._id === user?.id;
                const myConfirmed = isMeOwner ? claim?.ownerConfirmedReturn : claim?.claimantConfirmedReturn;
                const otherConfirmed = isMeOwner ? claim?.claimantConfirmedReturn : claim?.ownerConfirmedReturn;

                return (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E7DDD1' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                      Exchange Status
                    </Typography>

                    {claim?.status === 'completed' ? (
                      <Stack spacing={1}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          ✓ Exchange completed successfully
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Owner ✓ | Claimant ✓
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1.5}>
                        {myConfirmed && !otherConfirmed && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                            ✓ You have confirmed the exchange. Waiting for the other participant...
                          </Typography>
                        )}
                        {!myConfirmed && otherConfirmed && (
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            The other participant has confirmed the exchange.
                          </Typography>
                        )}
                        {!myConfirmed && !otherConfirmed && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Waiting for exchange
                          </Typography>
                        )}

                        {!myConfirmed && (
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            onClick={handleConfirmExchange}
                            disabled={submittingConfirm}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
                          >
                            {submittingConfirm ? 'Confirming...' : 'Confirm Exchange'}
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Box */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #E7DDD1', borderRadius: '16px', bgcolor: '#FFF' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #E7DDD1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {conversation.item?.title || 'Secure Communication Room'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conversation with {otherUser?.name}
                </Typography>
              </Box>
            </Box>

            {/* Messages List */}
            <Box sx={{ height: '360px', overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#FAF9F6' }}>
              {(() => {
                console.log('6. Immediately before JSX render - messages array:', messages);
                return messages.length === 0 ? (
                  <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.6 }}>
                    <Typography variant="body2">No messages yet. Agree on a meeting place above!</Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    if (msg.isSystem) {
                      return (
                        <Box key={msg._id} sx={{ alignSelf: 'center', bgcolor: '#EFEBE9', py: 0.75, px: 2, borderRadius: '20px', maxWidth: '85%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#5D4037', textAlign: 'center', whiteSpace: 'pre-line' }}>
                            {msg.text}
                          </Typography>
                        </Box>
                      );
                    }

                    const isMe = msg.sender === user?.id;
                    return (
                      <Box key={msg._id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <Box sx={{ 
                          bgcolor: isMe ? '#4A3B32' : '#FFF', 
                          color: isMe ? '#FFF' : '#333', 
                          p: 2, 
                          borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                          border: isMe ? 'none' : '1px solid #E7DDD1',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {msg.imageUrl && (
                            <Box 
                              component="img" 
                              src={msg.imageUrl} 
                              onClick={() => setZoomImage(msg.imageUrl)}
                              sx={{ width: '100%', borderRadius: '8px', mb: 1, cursor: 'pointer', maxHeight: '180px', objectFit: 'cover' }} 
                            />
                          )}
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {msg.text}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: isMe ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    );
                  })
                );
              })()}
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Action Buttons */}
            <Box sx={{ p: 1.5, borderTop: '1px solid #E7DDD1', bgcolor: '#FFF', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<DirectionsIcon />} 
                disabled={conversation.claim?.status === 'completed'}
                onClick={() => {
                  setNewStatus('scheduled');
                  setMeetingDialogOpen(true);
                }}
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
              >
                Share Location
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<HistoryIcon />} 
                disabled={conversation.claim?.status === 'completed'}
                onClick={() => {
                  setNewStatus('scheduled');
                  setMeetingDialogOpen(true);
                }}
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
              >
                Propose Time
              </Button>
              <Button 
                component="label"
                size="small" 
                variant="outlined" 
                startIcon={<ImageIcon />} 
                disabled={conversation.claim?.status === 'completed' || uploadingImage}
                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
              >
                {uploadingImage ? 'Uploading...' : 'Send Photo'}
                <input type="file" accept="image/*" hidden onChange={handleUploadPhoto} disabled={conversation.claim?.status === 'completed'} />
              </Button>
            </Box>

            {/* Input box */}
            <Box sx={{ p: 2, borderTop: '1px solid #E7DDD1', display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: '#FFF', borderRadius: '0 0 16px 16px' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={conversation.claim?.status === 'completed' ? "Conversation archived" : "Type message..."}
                value={chatMessageText}
                disabled={conversation.claim?.status === 'completed'}
                onChange={(e) => setChatMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={conversation.claim?.status === 'completed'}
                sx={{ borderRadius: '12px', minWidth: '48px', p: 1.25 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Meeting Update Dialog */}
      <Dialog open={meetingDialogOpen} onClose={() => setMeetingDialogOpen(false)} sx={{ '& .MuiPaper-root': { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Meeting Information</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: '300px' }}>
            <TextField
              label="Meeting Location"
              placeholder="e.g. Library entrance"
              fullWidth
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <TextField
              label="Meeting Date & Time"
              placeholder="e.g. Tomorrow at 5 PM"
              fullWidth
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
            >
              <MenuItem value="awaiting_meeting">Awaiting Meeting</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed (Returned)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMeetingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateMeeting} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomImage} onClose={() => setZoomImage(null)} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { bgcolor: 'transparent', boxShadow: 'none' } }}>
        {zoomImage && (
          <Box 
            component="img" 
            src={zoomImage} 
            sx={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }} 
          />
        )}
      </Dialog>
    </Container>
  );
};
export default ChatPage;
