import React from 'react';
import './index.scss';
import { ChakraProvider } from '@chakra-ui/react';
import Editor from './components/Editor';
import './stylesheets/main.scss';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Editor />
    </ChakraProvider>
  </React.StrictMode>
);
