<template>
  <div id="app">
    <Header />
    <RouterView class="router-view-container"></RouterView>
    <Footer />
  </div>
</template>

<script>
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    RouterView
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 60px;
}

header, footer {
  position: fixed;
  left: 0;
  right: 0;
}

header {
  top: 0;
}

footer {
  bottom: 0;
  background-color: white;
}

.router-view-container {
  margin-top: 60px;
  margin-bottom: 50px;
}
</style>