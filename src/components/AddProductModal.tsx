import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import type { Product } from '../types/models';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (product: Product) => void;
}

export default function AddProductModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [count, setCount] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [size, setSize] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setCount('');
    setImageUrl('');
    setSize('');
    setWeight('');
    setError(null);
  };

  const handleClose = () => {
    if (!saving) {
      reset();
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name || count === '' || !imageUrl || !size || !weight) {
      setError('Please fill all fields');
      return;
    }

    const newProduct = {
      name,
      count: Number(count),
      imageUrl,
      size,
      weight
    };

    try {
      setSaving(true);
      const res = await axios.post<Product>('http://localhost:3001/products', newProduct);
      onCreated?.(res.data);
      reset();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        setError(
          (axiosErr.response?.data as { message?: string } | undefined )?.message ??
          axiosErr.message ??
          'Failed to save'
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField
            label="Count"
            type="number"
            value={count}
            onChange={e => setCount(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          />
          <TextField label="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} fullWidth />
          <TextField label="Size" value={size} onChange={e => setSize(e.target.value)} fullWidth />
          <TextField label="Weight" value={weight} onChange={e => setWeight(e.target.value)} fullWidth />
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
