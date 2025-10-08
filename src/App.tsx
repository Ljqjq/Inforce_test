import { Container } from '@mui/material';
import MainLayout from './components/MainLayout';
import ProductListView from './pages/ProductListView';

export default function App() {
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProductListView />
      </Container>
    </MainLayout>
  );
}
