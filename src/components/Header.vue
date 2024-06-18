<template>
    <header>
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <h1>EV Charger Dashboard</h1>
      <nav>
        <router-link to="/home">Home</router-link>
        <router-link to="/statistics">Statistics</router-link>
        <router-link to="/prediction">Prediction</router-link>
      </nav>
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
    gap: 5rem;
  }
  
  .logo {
    height: 80px;
    margin-right: 1rem;
  }
  nav {
  display: flex;
  gap: 1rem;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

nav a.router-link-active {
  color: #42b983;
}
  </style>