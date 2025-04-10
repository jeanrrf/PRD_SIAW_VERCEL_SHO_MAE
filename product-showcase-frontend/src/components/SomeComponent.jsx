import React from 'react';
// Old import
// import { useHistory } from 'react-router-dom';
// New import
import { useNavigate } from 'react-router-dom';

const SomeComponent = () => {
  // Old usage
  // const history = useHistory();
  // history.push('/some-route');
  
  // New usage
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/some-route');
  };
  
  // ...existing code...
};