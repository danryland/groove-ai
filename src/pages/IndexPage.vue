<template>
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
      <div class="beat beat-mid">
        <button
          v-for="(mid, index) in groove.beat_mid"
          :key="'mid-' + index"
          :class="{ active: mid.active, current: index === currentBeat }"
          @click="toggleActive(mid)"
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
      <q-btn
        icon="fa-solid fa-minus"
        round
        flat
        :disable="bpm <= 20"
        @click="down(bpm)"
      />
      <q-input
        v-model.number="bpm"
        @change="updateBPM"
        min="20"
        max="300"
        step="2"
        type="number"
        borderless
      />
      <q-btn
        icon="fa-solid fa-plus"
        round
        flat
        :disable="bpm >= 300"
        @click="up(bpm)"
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
import * as Tone from "tone";

export default {
  name: "IndexPage",
  props: {
    groove: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
    },
  },
  data() {
    return {
      bpm: 100,
      currentBeat: -1,
      playbackState: "stopped",
    };
  },
  computed: {
    hasActiveBeat() {
      return (
        this.groove.beat_high.some((beat) => beat.active) ||
        this.groove.beat_mid.some((beat) => beat.active) ||
        this.groove.beat_low.some((beat) => beat.active)
      );
    },
  },
  methods: {
    down(bpm) {
      this.bpm = bpm - 10;
      Tone.Transport.bpm.value = this.bpm / 2;
    },
    up(bpm) {
      this.bpm = bpm + 10;
      Tone.Transport.bpm.value = this.bpm / 2;
    },
    toggleActive(beat) {
      beat.active = !beat.active;
    },
    updateCurrentBeat(beatIndex) {
      this.currentBeat = beatIndex;
    },
    initToneSequence(groove) {
      const highSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            groove.genre +
            "/high.wav",
        },
      }).toDestination();
      const medSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            groove.genre +
            "/med.wav",
        },
      }).toDestination();
      const lowSynth = new Tone.Sampler({
        urls: {
          C4:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            groove.genre +
            "/low.wav",
        },
      }).toDestination();

      const sequence = new Tone.Sequence(
        (time, beatIndex) => {
          Tone.Draw.schedule(() => {
            this.updateCurrentBeat(beatIndex);
          }, time);
          if (groove.beat_high[beatIndex].active) {
            highSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (groove.beat_mid[beatIndex].active) {
            medSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (groove.beat_low[beatIndex].active) {
            lowSynth.triggerAttackRelease("C4", "8n", time);
          }
        },
        Array.from({ length: groove.beat_high.length }, (_, i) => i),
        "8n"
      );

      Tone.Transport.bpm.value = this.bpm / 2;

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
      Tone.Transport.bpm.value = this.bpm / 2;
    },
    clearTone() {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    },
  },
  watch: {
    groove: {
      handler(newGroove, oldGroove) {
        if (oldGroove !== null) {
          this.clearTone();
          this.playbackState = "stopped";
        }
        if (newGroove) {
          this.bpm = newGroove.bpm;
          this.initToneSequence(newGroove);
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
