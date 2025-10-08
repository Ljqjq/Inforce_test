import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchProducts, deleteProduct } from '../redux/productsSlice';
import type { Product } from '../types/models';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import { Box, Typography, Button, TextField, Stack, Snackbar, Alert } from '@mui/material';

function sortByName(a: Product, b: Product) {
  const na = (a.name ?? '').toLowerCase();
  const nb = (b.name ?? '').toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export default function ProductListView() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.products.items);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Whenever the authoritative items change, produce a sorted copy
  useEffect(() => {
    const copy = [...items].sort(sortByName);
    setFiltered(copy);
  }, [items]);

  // Whenever the query or items change, apply search + alphabetical sort
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const results = items
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort(sortByName);
    setFiltered(results);
  }, [query, items]);

  const handleCreated = async (product: Product) => {
    await dispatch(fetchProducts());
    setToast({ open: true, msg: 'Product added', severity: 'success' });
  };

  const handleUpdated = async (product: Product) => {
    setEditingProduct(null);
    setIsModalOpen(false);
    await dispatch(fetchProducts());
    setToast({ open: true, msg: 'Product updated', severity: 'success' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      await dispatch(fetchProducts());
      setToast({ open: true, msg: 'Deleted', severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Products
        </Typography>
        <TextField size="small" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button
          variant="contained"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        >
          Add Product
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
        }}
      >
        {filtered.map((product) => (
          <Box key={product.id}>
            <ProductCard product={product} onEdit={handleEdit} onDelete={handleDelete} />
          </Box>
        ))}
      </Box>

      <AddProductModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onCreated={handleCreated}
        initialProduct={editingProduct ?? undefined}
        onUpdated={handleUpdated}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
