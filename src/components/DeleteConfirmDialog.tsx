import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmDialog({ open, title = 'Confirm', message = 'Are you sure?', onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => { onConfirm(); }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
