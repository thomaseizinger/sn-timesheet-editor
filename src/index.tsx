import React from 'react';
import './index.scss';
import { ChakraProvider } from '@chakra-ui/react';
import './stylesheets/main.scss';
import { createRoot } from 'react-dom/client';
import App from './components/App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
