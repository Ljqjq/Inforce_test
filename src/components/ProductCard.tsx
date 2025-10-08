import type { Product } from '../types/models';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number | string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  // Use fixed display size for the card image so real-life size doesn't affect layout
  const displayWidth = 300;
  const displayHeight = 160;

  return (
    <Card>
      <Box sx={{ width: displayWidth, height: displayHeight, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={product.imageUrl || '/placeholder.png'}
          alt={product.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      <CardContent>
        <Typography variant="h6" component="div">{product.name}</Typography>
        <Typography variant="body2" color="text.secondary" component="div">Count: {product.count}</Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          Size: {product.size?.width ?? '-'} × {product.size?.height ?? '-'} (real life) • Weight: {product.weight ?? '-'}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" component={RouterLink} to={`/products/${product.id}`}>View</Button>
        <Button size="small" onClick={() => onEdit(product)}>Edit</Button>
        <Button size="small" color="error" onClick={() => onDelete(product.id)}>Delete</Button>
      </CardActions>
    </Card>
  );
}
