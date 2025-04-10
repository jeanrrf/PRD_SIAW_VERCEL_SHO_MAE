import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Definindo as cores e valores reutilizáveis baseados no projeto existente
const colors = {
  primary: {
    50: '#e7eaf4',
    100: '#c3c9e3',
    200: '#9ea7d2',
    300: '#7985c0',
    400: '#5f6cb4',
    500: '#2A3990', // cor primária original
    600: '#2a3480',
    700: '#242b6b',
    800: '#1e2357',
    900: '#151942',
  },
  secondary: {
    500: '#6777c7',
  },
  accent: {
    500: '#FF5757',
  },
  dark: {
    500: '#1E293B',
  },
  light: {
    500: '#F8FAFC',
  }
};

// Estilos de componentes personalizados
const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: 'md',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      },
      transition: 'all 0.3s ease',
    },
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }
      },
      accent: {
        bg: 'accent.500',
        color: 'white',
        _hover: {
          opacity: 0.9,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }
      },
      outline: {
        border: '1px solid',
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.500',
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }
      },
    }
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        _hover: {
          boxShadow: 'md',
          transform: 'translateY(-4px)',
        }
      }
    }
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      textTransform: 'normal',
      fontWeight: '600',
    },
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
      },
      accent: {
        bg: 'accent.500',
        color: 'white',
      },
    }
  },
};

// Fontes personalizadas
const fonts = {
  body: "'Montserrat', sans-serif",
  heading: "'Raleway', sans-serif",
  logo: "'Bruno Ace SC', cursive",
};

// Estilos globais
const styles = {
  global: (props) => ({
    body: {
      bg: mode('linear-gradient(to right, #f8fafc, #f1f5f9, #f8fafc)', 'gray.900')(props),
      backgroundAttachment: 'fixed',
    }
  })
};

const theme = extendTheme({
  colors,
  components,
  fonts,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  }
});

export default theme;
