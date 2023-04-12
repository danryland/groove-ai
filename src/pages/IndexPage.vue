<template>
  <q-dialog v-model="loading" persistent full-width full-height>
    <div class="flex flex-center column items-center justify-center">
      <q-icon name="fa-sharp fa-solid fa-spinner fa-spin" size="32px" />
      <div class="text-h6 q-mt-md">Loading groove...</div>
    </div>
  </q-dialog>
  <q-page class="player" v-if="!loading && groove">
    <div class="title">
      <h1>{{ groove.title }}</h1>
      <p>
        {{ groove.description }}
      </p>
    </div>

    <div class="beats">
      <div class="beat beat-high">
        <button
          v-for="(high, index) in groove.beat_high"
          :key="'high-' + index"
          :class="{ active: high.active, current: index === currentBeat }"
          @click="toggleActive(high)"
        ></button>
      </div>
      <div class="beat beat-med">
        <button
          v-for="(med, index) in groove.beat_med"
          :key="'med-' + index"
          :class="{ active: med.active, current: index === currentBeat }"
          @click="toggleActive(med)"
        ></button>
      </div>
      <div class="beat beat-low">
        <button
          v-for="(low, index) in groove.beat_low"
          :key="'low-' + index"
          :class="{ active: low.active, current: index === currentBeat }"
          @click="toggleActive(low)"
        ></button>
      </div>
    </div>

    <div class="bpm">
      <q-input
        v-model.number="groove.bpm"
        @change="updateBPM"
        min="20"
        max="300"
        step="2"
        type="number"
        borderless
      />
    </div>
    <div class="action">
      <q-btn @click="playSequence" :disabled="!hasActiveBeat" round size="lg">
        <q-icon
          size="1.5em"
          v-if="playbackState === 'playing'"
          name="fa-sharp fa-solid
        fa-pause"
        />
        <q-icon
          v-else
          size="1.5em"
          name="fa-sharp fa-solid
        fa-play"
        />
      </q-btn>
    </div>
  </q-page>
</template>

<script>
import supabase from "../supabase";
import * as Tone from "tone";

export default {
  name: "IndexPage",
  emits: ["loading"],
  data() {
    return {
      loading: true,
      groove: null,
      currentBeat: -1,
      playbackState: "stopped",
    };
  },
  async mounted() {
    await this.getRandomGroove();
    this.initToneSequence();
  },
  computed: {
    hasActiveBeat() {
      return (
        this.groove.beat_high.some((beat) => beat.active) ||
        this.groove.beat_med.some((beat) => beat.active) ||
        this.groove.beat_low.some((beat) => beat.active)
      );
    },
  },
  methods: {
    async getRandomGroove() {
      const { data, error } = await supabase.rpc("get_random_groove");

      if (error) {
        console.error("Error fetching random groove:", error);
      } else {
        this.groove = data[0];
        setTimeout(() => {
          this.loading = false;
          this.$emit("loading", false);
        }, 600);
      }
    },
    toggleActive(beat) {
      beat.active = !beat.active;
    },
    updateCurrentBeat(beatIndex) {
      this.currentBeat = beatIndex;
    },
    initToneSequence() {
      const highSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            this.groove.genre +
            "/high.wav",
        },
      }).toDestination();
      const medSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            this.groove.genre +
            "/med.wav",
        },
      }).toDestination();
      const lowSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            this.groove.genre +
            "/low.wav",
        },
      }).toDestination();

      const sequence = new Tone.Sequence(
        (time, beatIndex) => {
          Tone.Draw.schedule(() => {
            this.updateCurrentBeat(beatIndex);
          }, time);
          if (this.groove.beat_high[beatIndex].active) {
            highSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (this.groove.beat_med[beatIndex].active) {
            medSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (this.groove.beat_low[beatIndex].active) {
            lowSynth.triggerAttackRelease("C4", "8n", time);
          }
        },
        Array.from({ length: this.groove.beat_high.length }, (_, i) => i),
        "8n"
      );

      Tone.Transport.bpm.value = this.groove.bpm / 2;

      sequence.start();
    },
    playSequence() {
      if (Tone.context.state !== "running") {
        Tone.start();
      }
      if (this.playbackState === "stopped" || this.playbackState === "paused") {
        Tone.Transport.start();
        this.playbackState = "playing";
      } else if (this.playbackState === "playing") {
        Tone.Transport.pause();
        this.playbackState = "paused";
      }
    },
    updateBPM() {
      Tone.Transport.bpm.value = this.groove.bpm / 2;
    },
  },
};
</script>
