<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="!loading">
      <q-toolbar>
        <q-btn
          @click="reload()"
          flat
          round
          size="19px"
          icon="fa-sharp fa-light fa-shuffle"
        >
          <q-tooltip class="bg-dark"> Random select existing</q-tooltip></q-btn
        >
        <q-icon flat round size="32px" name="fa-sharp fa-light fa-waveform" />
        <q-btn
          @click="generateNewGroove()"
          flat
          round
          size="19px"
          icon="fa-sharp fa-light fa-sparkles"
          :disable="loadingGroove"
          :loading="loadingGroove"
        >
          <q-tooltip class="bg-dark"> Generate new groove </q-tooltip></q-btn
        >
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view :loading="loading" :groove="groove" />
    </q-page-container>

    <q-dialog v-model="loading" persistent full-width full-height>
      <div class="flex flex-center column items-center justify-center">
        <q-icon name="fa-sharp fa-solid fa-spinner fa-spin" size="32px" />
        <div class="text-h6 q-mt-md">Loading groove...</div>
      </div>
    </q-dialog>
  </q-layout>
</template>

<script>
import axios from "axios";
import supabase from "../supabase";
import { Notify } from "quasar";

export default {
  name: "MainLayout",
  data() {
    return {
      loading: true,
      groove: null,
      loadingGroove: false,
    };
  },
  async mounted() {
    await this.getRandomGroove();
  },
  methods: {
    reload() {
      window.location.reload();
    },
    handleUpdate(newValue) {
      this.loading = newValue;
    },
    async getRandomGroove() {
      const { data, error } = await supabase.rpc("get_random_groove");

      if (error) {
        console.error("Error fetching random groove:", error);
      } else {
        this.groove = data[0];
        setTimeout(() => {
          this.loading = false;
        }, 600);
      }
    },
    generateNewGroove() {
      this.loadingGroove = true;

      const dismiss = Notify.create({
        message: "Generating new groove...",
        position: "top",
        spinner: true,
        timeout: 10000,
      });

      let config = {
        method: "post",
        url: process.env.SUPABASE_FUNCTION + "/groove",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.SUPABASE_KEY,
        },
      };

      axios
        .request(config)
        .then((response) => {
          if (response.data) {
            dismiss();
            Notify.create({
              message: "New groove loaded",
              position: "top",
              icon: "fa fa-check-circle",
              type: "positive",
            });
            this.groove = response.data;
            this.loadingGroove = false;
            this.saveGroove(this.groove);
          }
        })
        .catch((error) => {
          console.log(error);
          this.loadingGroove = false;
        });
    },
    async saveGroove(groove) {
      const { data, error } = await supabase.from("grooves").insert([groove]);

      if (error) {
        console.error("Error saving groove:", error);
      } else {
        console.log("Groove saved successfully:", data);
      }
    },
  },
};
</script>

<style lang="scss">
.q-header {
  background: $dark;
  padding: $gutter * 4 $gutter * 4 $gutter * 2 $gutter * 4;
  .q-toolbar {
    justify-content: space-between;
    padding: 0px;
  }
}
.fa-waveform {
  background: linear-gradient(302.62deg, #02e3f5 -0.44%, #ee08cd 99.56%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
.q-notification.bg-positive {
  background: linear-gradient(
    302.62deg,
    #02e3f5 -0.44%,
    #ee08cd 99.56%
  ) !important;
}
</style>
