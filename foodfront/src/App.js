import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import QueryPage from './components/QueryPage';
import ErrorBoundary from './components/ErrorBoundary';
import GraphVisualization from './components/GraphVisualization';
import './App.css';
const App = () => (
  <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/query"
          element={
            <ErrorBoundary>
              <QueryPage />
            </ErrorBoundary>
          }
          />
      </Routes>
    </BrowserRouter>
  </div>
);

export default App;
