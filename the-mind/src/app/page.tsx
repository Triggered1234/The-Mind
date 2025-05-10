// app/page.tsx
'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Home from './components/home'; // Adjust if App.tsx is elsewhere

export default function Page() {
  return (
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
}
