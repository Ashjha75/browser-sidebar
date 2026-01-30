import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Design system styles (dark SaaS)
import '../public/styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
