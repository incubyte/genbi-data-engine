import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import PropTypes from 'prop-types';

/**
 * Confirmation dialog component for confirming user actions
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {Function} props.onConfirm - Function to call when the action is confirmed
 * @param {Function} props.onCancel - Function to call when the action is canceled
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {string} props.confirmColor - Color for the confirm button
 * @param {boolean} props.dangerous - Whether the action is dangerous
 */
const ConfirmationDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  dangerous = false
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {dangerous && (
            <WarningIcon color="error" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          color={dangerous ? 'error' : confirmColor}
          variant="contained"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.string,
  dangerous: PropTypes.bool
};

export default ConfirmationDialog;
