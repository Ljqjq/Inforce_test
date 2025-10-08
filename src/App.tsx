import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListView from './pages/ProductListView';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductListView />} />
      </Routes>
    </Router>
  );
};

export default App;
