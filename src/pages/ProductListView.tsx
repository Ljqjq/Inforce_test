import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchProducts, deleteProduct } from '../redux/productsSlice';
import type { Product } from '../types/models';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

type SortMode = 'nameAsc_countAsc' | 'nameAsc_countDesc' | 'nameDesc_countAsc' | 'nameDesc_countDesc';

function compareName(a: Product, b: Product) {
  const na = (a.name ?? '').toLowerCase();
  const nb = (b.name ?? '').toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

function sortProducts(items: Product[], mode: SortMode) {
  return [...items].sort((a, b) => {
    // Primary: name ascending or descending
    const nameCmp = compareName(a, b);
    const nameDir = mode.startsWith('nameAsc') ? 1 : -1;
    if (nameCmp !== 0) return nameCmp * nameDir;

    // Secondary: count ascending or descending
    const countDir = mode.endsWith('countAsc') ? 1 : -1;
    const ca = Number(a.count ?? 0);
    const cb = Number(b.count ?? 0);
    if (ca < cb) return -1 * countDir;
    if (ca > cb) return 1 * countDir;
    return 0;
  });
}

export default function ProductListView() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.products.items);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  // default sort: name ascending then count ascending
  const [sortMode, setSortMode] = useState<SortMode>('nameAsc_countAsc');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortMode(e.target.value as SortMode);
  };

  // apply search filter, then sorting (always alphabetical first by design)
  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((p) => p.name.toLowerCase().includes(q));
    return sortProducts(filtered, sortMode);
  }, [items, query, sortMode]);

  const handleCreated = async (_product: Product) => {
    await dispatch(fetchProducts());
    setToast({ open: true, msg: 'Product added', severity: 'success' });
  };

  const handleUpdated = async (_product: Product) => {
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

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="sort-mode-label">Sort (primary: name)</InputLabel>
          <Select labelId="sort-mode-label" value={sortMode} label="Sort (primary: name)" onChange={handleSortChange}>
            <MenuItem value="nameAsc_countAsc">Name ↑ then Count ↑</MenuItem>
            <MenuItem value="nameAsc_countDesc">Name ↑ then Count ↓</MenuItem>
            <MenuItem value="nameDesc_countAsc">Name ↓ then Count ↑</MenuItem>
            <MenuItem value="nameDesc_countDesc">Name ↓ then Count ↓</MenuItem>
          </Select>
        </FormControl>

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
        {filteredAndSorted.map((product) => (
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
