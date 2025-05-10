import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Page from './page';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  );
};

export default App;
