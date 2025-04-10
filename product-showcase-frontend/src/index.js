import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

<<<<<<< HEAD
// Importar apenas as fontes Google (remover referências ao Tailwind)
=======
// Importar apenas as fontes Google
>>>>>>> 6d09f1de02ba6398e97d475745f8a67cb3264db1
import './styles/fonts.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

<<<<<<< HEAD
=======
// Optional: you can pass a function to log results or just call it without arguments
>>>>>>> 6d09f1de02ba6398e97d475745f8a67cb3264db1
reportWebVitals();
