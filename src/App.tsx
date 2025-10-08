// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductListView from './pages/ProductListView';
import ProductView from './pages/ProductView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<ProductListView />} />
      <Route path="/products/:id" element={<ProductView />} />
      {/* add other routes here */}
    </Routes>
  );
}
