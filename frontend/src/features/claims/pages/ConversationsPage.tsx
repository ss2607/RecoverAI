import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Stack, Avatar, Badge, Button, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import { getUserConversations, type Conversation } from '../services/chatService';
import { ChatBubbleOutline as ChatIcon } from '@mui/icons-material';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = localStorage.getItem('userId') || ''; // Fallback to extract userId

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await getUserConversations();
        setConversations(data || []);
      } catch (err) {
        setError('Error fetching active conversations.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 4 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map(idx => (
            <Skeleton key={idx} variant="rectangular" height={120} sx={{ borderRadius: '16px' }} />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Active Conversations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Secure communication rooms to arrange meetings for approved claims.
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>
      )}

      {conversations.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px dashed #E7DDD1', borderRadius: '16px', p: 5, textAlign: 'center', bgcolor: '#FFFCF8' }}>
          <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No conversations yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chats become available once a claim is approved.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {conversations.map((conv) => {
            const isOwner = conv.owner?._id === userId;
            const otherUser = isOwner ? conv.claimant : conv.owner;
            const unreadCount = isOwner ? conv.unreadCountOwner : conv.unreadCountClaimant;

            return (
              <Card 
                key={conv._id} 
                elevation={0} 
                sx={{ 
                  borderRadius: '16px', 
                  border: '1px solid #E7DDD1', 
                  bgcolor: '#FFFCF8',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge badgeContent={unreadCount} color="error" overlap="circular">
                        <Avatar sx={{ bgcolor: '#4A3B32', color: '#FFF', width: 48, height: 48 }}>
                          {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {conv.item?.title || 'Unknown Item'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Chat with: {otherUser?.name || 'Unknown User'}
                        </Typography>
                        {conv.lastMessage && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{conv.lastMessage}"
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack alignItems="flex-end" spacing={1.5}>
                      {conv.lastMessageAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                      <Button
                        component={Link}
                        to={`/conversations/${conv._id}`}
                        variant="contained"
                        size="small"
                        sx={{ borderRadius: '8px', fontWeight: 700 }}
                      >
                        Open Chat
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};
export default ConversationsPage;
