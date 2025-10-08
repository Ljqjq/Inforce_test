import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert
} from '@mui/material';
import type { Product } from '../types/models';

const API_URL = 'http://localhost:3001/products';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (p: Product) => void;
  onUpdated?: (p: Product) => void;
  initialProduct?: Product;
}

export default function AddProductModal({ open, onClose, onCreated, onUpdated, initialProduct }: Props) {
  const [name, setName] = useState('');
  const [count, setCount] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [sizeWidth, setSizeWidth] = useState<number | ''>('');
  const [sizeHeight, setSizeHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && initialProduct) {
      setName(initialProduct.name ?? '');
      setCount(initialProduct.count ?? 0);
      setImageUrl(initialProduct.imageUrl ?? '');
      setSizeWidth(initialProduct.size?.width ?? '');
      setSizeHeight(initialProduct.size?.height ?? '');
      setWeight(initialProduct.weight ?? '');
      setError(null);
    } else if (open) {
      setName('');
      setCount('');
      setImageUrl('');
      setSizeWidth('');
      setSizeHeight('');
      setWeight('');
      setError(null);
    }
  }, [open, initialProduct]);

  const reset = () => {
    setName('');
    setCount('');
    setImageUrl('');
    setSizeWidth('');
    setSizeHeight('');
    setWeight('');
    setError(null);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const payload = {
      imageUrl: imageUrl ?? '',
      name: name.trim(),
      count: Number(count) || 0,
      size: { width: Number(sizeWidth) || 0, height: Number(sizeHeight) || 0 },
      weight: weight ?? '',
      comments: initialProduct?.comments ?? []
    };

    setSaving(true);
    try {
      if (initialProduct && typeof initialProduct.id !== 'undefined') {
        const res = await axios.put<Product>(`${API_URL}/${initialProduct.id}`, payload);
        onUpdated?.(res.data);
      } else {
        const res = await axios.post<Product>(API_URL, payload);
        onCreated?.(res.data);
      }
      reset();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data ? JSON.stringify(err.response.data) : err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setSaving(false);
    }
  };

  const title = initialProduct ? 'Edit Product' : 'Add New Product';

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

          <TextField
            label="Count"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          />

          <TextField label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} fullWidth />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Size width"
              type="number"
              value={sizeWidth}
              onChange={(e) => setSizeWidth(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Size height"
              type="number"
              value={sizeHeight}
              onChange={(e) => setSizeHeight(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
            />
          </Stack>

          <TextField label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : initialProduct ? 'Save changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
