import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product, Comment } from '../types/models';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddProductModal from '../components/AddProductModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const API_URL = 'http://localhost:3001/products';

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!id) return;
    void fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Product>(`${API_URL}/${id}`);
      setProduct(res.data);
    } catch (err) {
      setToast({ open: true, msg: 'Failed to load product', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = async (updated: Product) => {
    
    setProduct(updated);
    setEditing(false);
    setToast({ open: true, msg: 'Product updated', severity: 'success' });
  };

  const handleAddComment = async () => {
    if (!product) return;
    const text = commentText.trim();
    if (!text) return setToast({ open: true, msg: 'Comment cannot be empty', severity: 'error' });

   
    const newComment: Comment = {
      id: Date.now(),
      productId: product.id,
      description: text,
      date: new Date().toLocaleString(),
    };

    const updatedProduct: Product = { ...product, comments: [...(product.comments || []), newComment] };

    try {
      setLoading(true);
      const res = await axios.put<Product>(`${API_URL}/${product.id}`, {
        
        ...updatedProduct,
      });
      setProduct(res.data);
      setCommentText('');
      setToast({ open: true, msg: 'Comment added', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Failed to add comment', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteCommentDialog = (commentId: number) => {
    setDeletingCommentId(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!product || deletingCommentId == null) return;
    const remaining = (product.comments || []).filter((c) => c.id !== deletingCommentId);
    const updatedProduct: Product = { ...product, comments: remaining };

    try {
      setLoading(true);
      const res = await axios.put<Product>(`${API_URL}/${product.id}`, { ...updatedProduct });
      setProduct(res.data);
      setToast({ open: true, msg: 'Comment deleted', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Failed to delete comment', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeletingCommentId(null);
    }
  };

  if (!id) {
    return <Typography>Product id missing</Typography>;
  }

  if (loading && !product) {
    return <CircularProgress />;
  }

  if (!product) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No product found</Typography>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box component="img" src={product.imageUrl || '/placeholder.png'} alt={product.name} sx={{ width: 320, height: 240, objectFit: 'cover' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">{product.name}</Typography>
          <Typography>Count: {product.count}</Typography>
          <Typography>Size: {product.size?.width} × {product.size?.height}</Typography>
          <Typography>Weight: {product.weight}</Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          </Stack>
        </Box>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Comments</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
          <TextField label="Add comment" value={commentText} onChange={(e) => setCommentText(e.target.value)} fullWidth />
          <Button variant="contained" onClick={handleAddComment}>Add</Button>
        </Stack>

        <List sx={{ mt: 2 }}>
          {(product.comments || []).length === 0 && <Typography sx={{ mt: 1 }}>No comments yet</Typography>}
          {(product.comments || []).map((c) => (
            <React.Fragment key={c.id}>
              <ListItem
                secondaryAction={
                  <Button color="error" onClick={() => openDeleteCommentDialog(c.id)}>
                    Delete
                  </Button>
                }
              >
                <ListItemText primary={c.description} secondary={c.date} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <AddProductModal
        open={editing}
        onClose={() => setEditing(false)}
        initialProduct={product}
        onUpdated={handleUpdated}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete comment"
        message="Are you sure you want to delete this comment?"
        onConfirm={confirmDeleteComment}
        onClose={() => { setDeleteDialogOpen(false); setDeletingCommentId(null); }}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
