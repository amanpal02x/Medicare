import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime, Warning } from '@mui/icons-material';

const CountdownTimer = ({ remainingTime, isExpired, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (onExpire) onExpire();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    let str = '';
    if (days > 0) str += days + 'd ';
    if (days > 0 || hours > 0) str += hours.toString().padStart(2, '0') + 'h ';
    str += mins.toString().padStart(2, '0') + 'm ';
    str += secs.toString().padStart(2, '0') + 's';
    return str.trim();
  };

  const getColor = () => {
    if (isExpired || timeLeft <= 0) return 'error';
    if (timeLeft <= 5) return 'warning';
    if (timeLeft <= 10) return 'info';
    return 'success';
  };

  const getIcon = () => {
    if (isExpired || timeLeft <= 0) return <Warning />;
    return <AccessTime />;
  };

  if (isExpired || timeLeft <= 0) {
    return (
      <Chip
        icon={getIcon()}
        label="EXPIRED"
        color="error"
        size="small"
        variant="filled"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        icon={getIcon()}
        label={formatTime(timeLeft)}
        color={getColor()}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: timeLeft <= 10 ? 'bold' : 'normal',
          animation: timeLeft <= 5 ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.5 },
            '100%': { opacity: 1 }
          }
        }}
      />
    </Box>
  );
};

export default CountdownTimer; 