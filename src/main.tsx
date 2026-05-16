import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { AppContainer } from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
);
