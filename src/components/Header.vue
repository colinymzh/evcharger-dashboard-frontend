<template>
    <header>
      <h1>Welcome to EV Charger Dashboard</h1>
    </header>
  </template>
  
  <script>
  export default {
    name: 'Header',
  };
  </script>
  
  <style scoped>
  header {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: #f8f9fa; /* Example background color */
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    z-index: 1000;
  }
  </style>
  