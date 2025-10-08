import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchProducts, deleteProduct } from '../redux/productsSlice';
import type { Product } from '../types/models';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import {
  Box, Typography, Button, TextField, Stack, Snackbar, Alert
} from '@mui/material';

export default function ProductListView() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.products.items);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{open:boolean;msg:string;severity:'success'|'error'|'info'}>({open:false,msg:'',severity:'success'});

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);
  useEffect(() => { setFiltered(items); }, [items]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(items.filter(product => product.name.toLowerCase().includes(q)));
  }, [query, items]);

  const handleCreated = (product: Product) => {
    setFiltered(prev => [...prev, product]);
    setToast({ open: true, msg: 'Product added', severity: 'success' });
  };

  const handleEdit = (product: Product) => {
    setToast({ open:true, msg:'Edit not implemented', severity:'info' });
  };

  const handleDelete = async (id: number|string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      setToast({ open:true, msg:'Deleted', severity:'success' });
    } catch {
      setToast({ open:true, msg:'Delete failed', severity:'error' });
    }
  };

  return (
    <Box>
      <Stack direction={{xs:'column', sm:'row'}} spacing={2} alignItems="center" sx={{ mb:3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Products</Typography>
        <TextField size="small" placeholder="Search products" value={query} onChange={e=>setQuery(e.target.value)} />
        <Button variant="contained" onClick={()=>setIsModalOpen(true)}>Add Product</Button>
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

      <AddProductModal open={isModalOpen} onClose={()=>setIsModalOpen(false)} onCreated={handleCreated} />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=>setToast(t=>({...t,open:false}))} anchorOrigin={{vertical:'bottom', horizontal:'center'}}>
        <Alert severity={toast.severity} onClose={()=>setToast(t=>({...t,open:false}))} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
