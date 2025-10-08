import type { Product } from '../types/models';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material';

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number | string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  const width = product.size?.width ?? 300;
  const height = product.size?.height ?? 160;

  return (
    <Card>
      <Box sx={{ width, height, overflow: 'hidden' }}>
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
          Size: {width} × {height} • Weight: {product.weight}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={() => onEdit(product)}>Edit</Button>
        <Button size="small" color="error" onClick={() => onDelete(product.id)}>Delete</Button>
      </CardActions>
    </Card>
  );
}
