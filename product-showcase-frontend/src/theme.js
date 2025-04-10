<<<<<<< HEAD
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
=======
import { defineStyleConfig, extendTheme } from '@chakra-ui/react';

// Define custom theme colors and other properties
const theme = {
  colors: {
    primary: {
      50: '#e6eaff',
      100: '#b3c0ff',
      200: '#8096ff',
      300: '#4d6cff',
      400: '#2A3990', // Primary color from Tailwind config
      500: '#192873',
      600: '#132057',
      700: '#0d183b',
      800: '#060c1f',
      900: '#030613',
    },
    accent: {
      50: '#ffe6e6',
      100: '#ffb3b3',
      200: '#ff8080',
      300: '#ff4d4d',
      400: '#FF5757', // Accent color from Tailwind config
      500: '#ff2424',
      600: '#f10000',
      700: '#be0000',
      800: '#8b0000',
      900: '#580000',
    },
    dark: '#1E293B',
    light: '#F8FAFC',
  },
  fonts: {
    heading: `'Raleway', sans-serif`,
    body: `'Montserrat', sans-serif`,
    logo: `'Bruno Ace SC', cursive`,
  },
  components: {
    Button: defineStyleConfig({
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        transition: 'all 0.3s ease',
      },
      variants: {
        solid: {
          bg: 'accent.400',
          color: 'white',
          _hover: {
            bg: 'accent.300',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'primary.400',
          color: 'primary.400',
          _hover: {
            bg: 'primary.400',
            color: 'white',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    }),
    Card: defineStyleConfig({
      baseStyle: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        },
      },
    }),
    Heading: defineStyleConfig({
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'bold',
      },
    }),
    Link: defineStyleConfig({
      baseStyle: {
        color: 'primary.400',
        _hover: {
          textDecoration: 'none',
          color: 'accent.400',
        },
      },
    }),
  },
  shadows: {
    soft: '0 4px 20px rgba(0, 0, 0, 0.08)',
    hover: '0 10px 25px rgba(0, 0, 0, 0.12)',
  },
  styles: {
    global: {
      body: {
        bg: '#f8fafc',
        color: 'gray.800',
        fontFamily: 'body',
      },
      '.logo-text': {
        fontFamily: 'logo',
      },
    },
  },
};

export default extendTheme(theme);
>>>>>>> 6d09f1de02ba6398e97d475745f8a67cb3264db1
