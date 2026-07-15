import React, { useEffect, useState, useRef } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { socketService } from '../../services/socketService';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export const NotificationToast: React.FC = () => {
  const [queue, setQueue] = useState<ToastMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<any>(null);
  const isHovered = useRef(false);

  // Helper to add toast to queue
  const addToast = (title: string, message: string, severity: ToastMessage['severity'], id?: string) => {
    const toastId = id || `${Date.now()}-${Math.random()}`;
    
    // Prevent duplicate toasts
    if (seenIds.current.has(toastId)) {
      return;
    }
    seenIds.current.add(toastId);
    // Keep set size reasonable
    if (seenIds.current.size > 100) {
      const firstKey = seenIds.current.values().next().value;
      if (firstKey) seenIds.current.delete(firstKey);
    }

    setQueue((prev) => [...prev, { id: toastId, title, message, severity }]);
  };

  // Process queue
  useEffect(() => {
    if (queue.length > 0 && !activeToast) {
      const nextToast = queue[0];
      setActiveToast(nextToast);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [queue, activeToast]);

  // Handle auto-hide timer
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isHovered.current) {
        handleClose();
      }
    }, 5000);
  };

  useEffect(() => {
    if (open && activeToast) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, activeToast]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleExited = () => {
    setActiveToast(null);
  };

  const handleMouseEnter = () => {
    isHovered.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    if (open) {
      startTimer();
    }
  };

  // Bind Socket Listeners
  useEffect(() => {
    const handleNewMatch = (data: any) => {
      addToast(
        'New AI Match Found',
        `A similar report has been analyzed with a score of ${data.score}%.`,
        'success',
        `match-${data.item?._id || Date.now()}`
      );
    };

    const handleNewClaim = (data: any) => {
      addToast(
        'New Claim Submitted',
        `A claim has been filed for item: ${data.item?.title || 'your report'}.`,
        'info',
        `claim-submit-${data._id}`
      );
    };

    const handleClaimApproved = (data: any) => {
      addToast(
        'Claim Approved',
        `Your claim for item: ${data.item?.title || 'item'} was approved!`,
        'success',
        `claim-approve-${data._id}`
      );
    };

    const handleClaimRejected = (data: any) => {
      addToast(
        'Claim Rejected',
        `Your claim for item: ${data.item?.title || 'item'} was rejected.`,
        'error',
        `claim-reject-${data._id}`
      );
    };

    const handleNeedsInfo = (data: any) => {
      addToast(
        'Needs Information Requested',
        `More information is requested for claim: ${data.item?.title || 'item'}.`,
        'warning',
        `claim-info-${data._id}`
      );
    };

    const handleItemReturned = (data: any) => {
      addToast(
        'Item Returned',
        `Exchange confirmation received: item ${data.item?.title || 'item'} successfully returned.`,
        'success',
        `claim-return-${data._id}`
      );
    };

    const handleNotificationCreated = (data: any) => {
      // General fall-through notification toast
      addToast(
        data.title || 'Notification Received',
        data.message,
        'info',
        `notify-${data._id}`
      );
    };

    socketService.on('new_match', handleNewMatch);
    socketService.on('new_claim', handleNewClaim);
    socketService.on('claim_approved', handleClaimApproved);
    socketService.on('claim_rejected', handleClaimRejected);
    socketService.on('claim_needs_info', handleNeedsInfo);
    socketService.on('item_returned', handleItemReturned);
    socketService.on('notification_created', handleNotificationCreated);

    return () => {
      socketService.off('new_match', handleNewMatch);
      socketService.off('new_claim', handleNewClaim);
      socketService.off('claim_approved', handleClaimApproved);
      socketService.off('claim_rejected', handleClaimRejected);
      socketService.off('claim_needs_info', handleNeedsInfo);
      socketService.off('item_returned', handleItemReturned);
      socketService.off('notification_created', handleNotificationCreated);
    };
  }, []);

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ zIndex: 9999 }}
    >
      {activeToast ? (
        <Alert
          onClose={handleClose}
          severity={activeToast.severity}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ width: '100%', minWidth: 300, borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        >
          <AlertTitle sx={{ fontWeight: 800 }}>{activeToast.title}</AlertTitle>
          {activeToast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};
