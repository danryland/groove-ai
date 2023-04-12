<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          @click="alert('TODO')"
          flat
          round
          size="19px"
          icon="fa-sharp fa-light fa-shuffle"
        >
          <q-tooltip class="bg-dark"> Random select existing</q-tooltip></q-btn
        >
        <q-icon flat round size="32px" name="fa-sharp fa-light fa-waveform" />
        <q-btn
          @click="alert('TODO')"
          flat
          round
          size="19px"
          icon="fa-sharp fa-light fa-sparkles"
        >
          <q-tooltip class="bg-dark"> Generate new groove </q-tooltip></q-btn
        >
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  methods: {
    alert(text) {
      alert(text);
    },
  },
};
</script>

<style lang="scss">
.q-header {
  background: $dark;
  padding: $gutter * 4 $gutter * 4 $gutter * 2 $gutter * 4;
  .q-toolbar {
    justify-content: space-evenly;
  }
}
.fa-waveform {
  background: linear-gradient(302.62deg, #02e3f5 -0.44%, #ee08cd 99.56%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
</style>
