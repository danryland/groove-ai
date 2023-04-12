<template>
  <q-page class="player">
    <div class="title">
      <h1>Pulsating Groove Expedition</h1>
      <p>
        Rhythmic voyage, drums collide, In sync, we sway, on beats we glide.
      </p>
    </div>

    <div class="beats">
      <div class="beat beat-high">
        <button
          v-for="(h, index) in high"
          :key="'high-' + index"
          :class="{ active: h.active, current: index === currentBeat }"
          @click="toggleActive(h)"
        ></button>
      </div>
      <div class="beat beat-med">
        <button
          v-for="(m, index) in med"
          :key="'med-' + index"
          :class="{ active: m.active, current: index === currentBeat }"
          @click="toggleActive(m)"
        ></button>
      </div>
      <div class="beat beat-low">
        <button
          v-for="(l, index) in low"
          :key="'low-' + index"
          :class="{ active: l.active, current: index === currentBeat }"
          @click="toggleActive(l)"
        ></button>
      </div>
    </div>

    <div class="bpm">
      <q-input
        v-model.number="bpm"
        @change="updateBPM"
        min="20"
        max="300"
        step="2"
        type="number"
        filled
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
  data() {
    return {
      bpm: 120,
      currentBeat: -1,
      playbackState: "stopped",
      high: [
        { active: true },
        { active: false },
        { active: true },
        { active: false },
        { active: true },
        { active: false },
        { active: true },
        { active: false },
      ],
      med: [
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
      ],
      low: [
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: true },
        { active: false },
        { active: false },
        { active: false },
      ],
    };
  },
  mounted() {
    this.initToneSequence();
  },
  computed: {
    hasActiveBeat() {
      return (
        this.high.some((beat) => beat.active) ||
        this.med.some((beat) => beat.active) ||
        this.low.some((beat) => beat.active)
      );
    },
  },
  methods: {
    toggleActive(beat) {
      beat.active = !beat.active;
    },
    updateCurrentBeat(beatIndex) {
      this.currentBeat = beatIndex;
    },
    initToneSequence() {
      const highSynth = new Tone.Sampler({
        urls: { C4: "/assets/audio/funk/high/1.wav" },
      }).toDestination();
      const medSynth = new Tone.Sampler({
        urls: { C4: "/assets/audio/funk/med/1.wav" },
      }).toDestination();
      const lowSynth = new Tone.Sampler({
        urls: { C4: "/assets/audio/funk/low/1.wav" },
      }).toDestination();

      const sequence = new Tone.Sequence(
        (time, beatIndex) => {
          Tone.Draw.schedule(() => {
            this.updateCurrentBeat(beatIndex);
          }, time);
          if (this.high[beatIndex].active) {
            highSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (this.med[beatIndex].active) {
            medSynth.triggerAttackRelease("C4", "8n", time);
          }
          if (this.low[beatIndex].active) {
            lowSynth.triggerAttackRelease("C4", "8n", time);
          }
        },
        Array.from({ length: this.high.length }, (_, i) => i),
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
  },
};
</script>
