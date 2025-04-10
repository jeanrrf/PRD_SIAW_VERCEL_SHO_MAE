import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  Badge,
  useColorModeValue,
  Container,
  SimpleGrid,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Componente Box com movimento (substitui a classe .float)
const MotionBox = motion(Box);

// Exemplo de Card (substitui a classe .card)
export const ProductCard = ({ product }) => {
  return (
    <Card variant="elevated" _hover={{ transform: 'translateY(-8px)', transition: 'all 0.3s ease' }}>
      <CardHeader p={0} position="relative">
        <Image 
          src={product.image} 
          alt={product.name} 
          borderTopRadius="lg"
          objectFit="cover"
          height="200px"
          width="100%"
        />
        {product.discount && (
          <Badge 
            position="absolute" 
            top="2" 
            right="2" 
            variant="accent"
          >
            {product.discount}% OFF
          </Badge>
        )}
      </CardHeader>
      
      <CardBody>
        <Heading as="h3" size="md" mb={2}>{product.name}</Heading>
        <Text color="gray.600" noOfLines={2} mb={3}>{product.description}</Text>
        <HStack>
          <Text fontWeight="bold" fontSize="xl" color="primary.500">
            R$ {product.price.toFixed(2)}
          </Text>
          {product.oldPrice && (
            <Text as="s" color="gray.500">
              R$ {product.oldPrice.toFixed(2)}
            </Text>
          )}
        </HStack>
      </CardBody>
      
      <CardFooter pt={0}>
        <Button variant="primary" width="full">Ver Detalhes</Button>
      </CardFooter>
    </Card>
  );
};

// Exemplo de Carrossel (substitui os estilos .carousel-*)
export const ProductCarousel = ({ products }) => {
  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <Heading mb={6} textAlign="center">Produtos em Destaque</Heading>
        
        <Flex overflowX="auto" pb={4} css={{
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
        }}>
          <HStack spacing={6} p={2}>
            {products.map((product) => (
              <Box key={product.id} minW="280px" maxW="280px">
                <ProductCard product={product} />
              </Box>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

// Exemplo de background pattern (substitui .bg-pattern)
export const PatternBackground = ({ children }) => {
  const bgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%232A3990' fill-opacity='0.05'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 20v-1.41l2.83-2.83 1.41 1.41L1.41 20H0zm20 0v-1.41l2.83-2.83 1.41 1.41L21.41 20H20zm0 18.59l2.83-2.83 1.41 1.41L21.41 40H20v-1.41zM10 20v-1.41l2.83-2.83 1.41 1.41L11.41 20H10zm0 18.59l2.83-2.83 1.41 1.41L11.41 40H10v-1.41zM30 20v-1.41l2.83-2.83 1.41 1.41L31.41 20H30zm0 18.59l2.83-2.83 1.41 1.41L31.41 40H30v-1.41zM10 10V8.59l2.83-2.83 1.41 1.41L11.41 10H10zm10 0V8.59l2.83-2.83 1.41 1.41L21.41 10H20zm10 0V8.59l2.83-2.83 1.41 1.41L31.41 10H30zM0 0v1.41l2.83 2.83-1.41 1.41L0 3.41V0h1.41l2.83 2.83-1.41 1.41L0 1.41V0zm20 10V1.41l2.83 2.83-1.41 1.41L20 3.41V0h1.41l2.83 2.83-1.41 1.41L20 1.41V10zm-10 0V1.41l2.83 2.83-1.41 1.41L10 3.41V0h1.41l2.83 2.83-1.41 1.41L10 1.41V10zM0 10V1.41l2.83 2.83-1.41 1.41L0 3.41V10h1.41l2.83-2.83 1.41 1.41L0 11.41V10zm30-10h1.41l2.83 2.83-1.41 1.41L30 1.41V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
  
  return (
    <Box 
      bg="white" 
      bgImage={bgPattern}
      py={12}
    >
      {children}
    </Box>
  );
};

// Exemplo de conteúdo com texto gradiente (substitui .gradient-text)
export const HeroSection = () => {
  return (
    <Box py={16} textAlign="center">
      <Container maxW="container.xl">
        <MotionBox
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          mb={6}
        >
          <Heading 
            as="h1" 
            size="3xl" 
            mb={4}
            className="gradient-text" // usando a classe CSS importada
          >
            SALES MARTINS
          </Heading>
        </MotionBox>
        
        <Text fontSize="xl" maxW="2xl" mx="auto" mb={8} color="gray.600">
          Conheça nossa incrível vitrine de produtos com design moderno e experiência de usuário excepcional.
        </Text>
        
        <HStack spacing={4} justify="center">
          <Button variant="primary" size="lg">Explorar Produtos</Button>
          <Button variant="outline" size="lg">Saiba Mais</Button>
        </HStack>
      </Container>
    </Box>
  );
};

// Exemplo de loading skeleton (substitui .skeleton-card)
export const ProductCardSkeleton = () => {
  return (
    <Card>
      <Box height="200px" bg="gray.200" animation="pulse 1.5s infinite" />
      <CardBody>
        <Box height="24px" width="70%" bg="gray.200" mb={2} animation="pulse 1.5s infinite" />
        <Box height="16px" width="90%" bg="gray.100" mb={2} animation="pulse 1.5s infinite" />
        <Box height="16px" width="60%" bg="gray.100" mb={4} animation="pulse 1.5s infinite" />
        <Box height="24px" width="40%" bg="gray.200" mb={4} animation="pulse 1.5s infinite" />
        <Box height="40px" width="100%" bg="gray.200" animation="pulse 1.5s infinite" />
      </CardBody>
    </Card>
  );
};
