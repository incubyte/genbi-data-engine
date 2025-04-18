import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Feedback message component for displaying success, error, info, and warning messages
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the message is visible
 * @param {string} props.message - Message to display
 * @param {string} props.severity - Message severity (success, error, info, warning)
 * @param {Function} props.onClose - Function to call when the message is closed
 * @param {number} props.autoHideDuration - Duration in milliseconds before the message auto-hides
 * @param {string} props.position - Position of the message (top, bottom, left, right)
 */
const FeedbackMessage = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Determine position based on the position prop
  const getPosition = () => {
    switch (position) {
      case 'top':
        return { vertical: 'top', horizontal: 'center' };
      case 'top-left':
        return { vertical: 'top', horizontal: 'left' };
      case 'top-right':
        return { vertical: 'top', horizontal: 'right' };
      case 'bottom':
        return { vertical: 'bottom', horizontal: 'center' };
      case 'bottom-left':
        return { vertical: 'bottom', horizontal: 'left' };
      case 'bottom-right':
        return { vertical: 'bottom', horizontal: 'right' };
      default:
        return { vertical: 'bottom', horizontal: 'center' };
    }
  };

  const { vertical, horizontal } = getPosition();

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical, horizontal }}
      TransitionComponent={Slide}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

FeedbackMessage.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  onClose: PropTypes.func,
  autoHideDuration: PropTypes.number,
  position: PropTypes.oneOf([
    'top',
    'top-left',
    'top-right',
    'bottom',
    'bottom-left',
    'bottom-right'
  ])
};

export default FeedbackMessage;
