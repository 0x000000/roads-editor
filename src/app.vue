<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
  $mdi-font-path: '~@mdi/font/fonts/';
  @import '~@mdi/font/scss/materialdesignicons';

  #app {
    font-family: 'PT Sans';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    float: right;
  }

  h1, h2, h3, h4 {
    margin-top: 0;
    padding-top: 0;
  }
</style>
