import React from 'react';
import ReactDOM from 'react-dom/client';
import { VotingApp } from './components/VotingApp';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <VotingApp />
  </React.StrictMode>
);
