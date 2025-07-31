import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ProfileGoal } from '../types/profile.types';
import { useContrastColors } from '../hooks/useContrastColors';

interface ProfileGoalsProps {
  goal: ProfileGoal;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

export default function ProfileGoals({ 
  goal, 
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null,
}: ProfileGoalsProps) {
  const theme = useTheme();
  
  // Get colors based on the background
  const { 
    subtleTextColor, 
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(backgroundColor, backgroundImageUrl);

  // Only render if goal exists and is active
  if (!goal || goal.status !== 'active') return null;

  const isGoalReached = goal.current_amount >= goal.goal_amount;
  const amountToGo = goal.goal_amount - goal.current_amount;
  const progressPercentage = Math.min((goal.current_amount / goal.goal_amount) * 100, 100);

  // Get emoji based on progress percentage
  const getProgressEmoji = (percentage: number) => {
    if (percentage >= 75) return '💎';
    if (percentage >= 50) return '⚡';
    if (percentage >= 25) return '🔥';
    return '🌱';
  };

  const progressEmoji = getProgressEmoji(progressPercentage);
  const brightGreen = '#22c55e'; // Nice bright green

  return (
    <Box sx={{ 
      backdropFilter: 'blur(50px)',
      WebkitBackdropFilter: 'blur(50px)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      borderRadius: '36px',
      border: `1px solid ${uiBorderColor}`,
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      {/* Circular Progress with Emoji */}
      <Box sx={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
        minHeight: 64
      }}>
        {/* Background circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={64}
          thickness={3}
          sx={{
            position: 'absolute',
            color: 'rgba(255, 255, 255, 0.2)',
            zIndex: 1
          }}
        />
        
        {/* Progress circle */}
        <CircularProgress
          variant="determinate"
          value={progressPercentage}
          size={64}
          thickness={3}
          sx={{
            position: 'absolute',
            color: brightGreen,
            zIndex: 2,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        
        {/* Emoji in center */}
        <Typography
          sx={{
            position: 'relative',
            zIndex: 3,
            fontSize: '30px',
            lineHeight: 1,
            transition: 'all 0.3s ease-in-out',
            transform: progressPercentage > 0 ? 'scale(1)' : 'scale(0.8)',
          }}
        >
          {progressEmoji}
        </Typography>
      </Box>

      {/* Goal Content */}
      <Box sx={{ flex: 1 }}>
        {/* Status Text */}
        <Typography 
          variant="body1" 
          fontWeight={600} 
          color={textColor}
          sx={{ mb: 0.5 }}
        >
          {isGoalReached ? (
            "🎉 Goal reached! Thank you!"
          ) : (
            `$${amountToGo.toFixed(0)} to go to reach goal!`
          )}
        </Typography>
        
        {/* Amount Progress */}
        <Typography 
          variant="body2" 
          color={textColor}
          sx={{ mb: 1 }}
        >
          ${goal.current_amount.toFixed(0)}/${goal.goal_amount.toFixed(0)} {goal.title}
        </Typography>
        
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: isGoalReached 
                ? `linear-gradient(90deg, ${brightGreen}, #16a34a)`
                : `linear-gradient(90deg, ${brightGreen}, #059669)`,
            },
          }}
        />
      </Box>
    </Box>
  );
}
