<template>
    <header>
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <h1>EV Charger Dashboard</h1>
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
    background-color: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    align-items: center;
  }
  
  .logo {
    height: 80px;
    margin-right: 1rem;
  }
  </style>