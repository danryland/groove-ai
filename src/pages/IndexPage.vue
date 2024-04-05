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
        <button v-for="(high, index) in groove.beat_high" :key="'high-' + index"
          :class="{ active: high.active, current: index === currentBeat }" @click="toggleActive(high)"></button>
      </div>
      <div class="beat beat-mid">
        <button v-for="(mid, index) in groove.beat_mid" :key="'mid-' + index"
          :class="{ active: mid.active, current: index === currentBeat }" @click="toggleActive(mid)"></button>
      </div>
      <div class="beat beat-low">
        <button v-for="(low, index) in groove.beat_low" :key="'low-' + index"
          :class="{ active: low.active, current: index === currentBeat }" @click="toggleActive(low)"></button>
      </div>
    </div>

    <div class="bpm">
      <q-btn icon="fa-solid fa-minus" round flat :disable="bpm <= 20" @click="down(bpm)" />
      <q-input v-model.number="bpm" @change="updateBPM" min="20" max="300" step="2" type="number" borderless />
      <q-btn icon="fa-solid fa-plus" round flat :disable="bpm >= 300" @click="up(bpm)" />
    </div>
    <div class="action">
      <div class="box box-1"><a
          href="mailto:dan@ryland.consulting?subject=Interested in advertising on Groove AI">Advertise</a></div>
      <div class="box box-2">
        <q-btn @click="playSequence" :disabled="!hasActiveBeat" round size="lg">
          <q-icon size="1.5em" v-if="playbackState === 'playing'" name="fa-sharp fa-solid
        fa-pause" />
          <q-icon v-else size="1.5em" name="fa-sharp fa-solid
        fa-play" />
        </q-btn>
      </div>
      <div class="box box-3">
        <q-btn @click="downloadMIDI" rounded class="q-px-md" color="white" outline><q-icon size="1.2em"
            name="fa-sharp fa-light fa-arrow-down" class="q-mr-sm" />
          <span>MIDI</span></q-btn>
      </div>
    </div>
    <div class="full-width text-center">
      <p class="q-mb-none text-grey-5" style="line-height: 1.2em;"><small>Project by <a class="text-grey-5"
            target="_blank" href="https://twitter.com/realdanryland">Dan Ryland</a><br>co-founder of <a
            class="text-grey-5" target="_blank" href="https://insidrmusic.com">Insidr&nbsp;Music</a></small></p>
    </div>
  </q-page>
</template>

<script>
import * as Tone from "tone";
import MidiWriter from "midi-writer-js";

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
  mounted() {
    if (this.groove) {
      this.initToneSequence(this.groove);
    }
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
          "A#1":
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            groove.genre +
            "/high.wav",
        },
      }).toDestination();
      const medSynth = new Tone.Sampler({
        urls: {
          D2:
            process.env.SUPABASE_URL +
            "/storage/v1/object/public/audio/" +
            groove.genre +
            "/mid.wav",
        },
      }).toDestination();
      const lowSynth = new Tone.Sampler({
        urls: {
          B1:
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
            highSynth.triggerAttackRelease("A#1", "8n", time);
          }
          if (groove.beat_mid[beatIndex].active) {
            medSynth.triggerAttackRelease("D2", "8n", time);
          }
          if (groove.beat_low[beatIndex].active) {
            lowSynth.triggerAttackRelease("B1", "8n", time);
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
    downloadMIDI() {
      const track = new MidiWriter.Track();

      const drumKitProgramChange = new MidiWriter.ProgramChangeEvent({
        channel: 9,
        instrument: 0,
      });
      track.addEvent(drumKitProgramChange);

      track.setTempo(this.groove.bpm);

      const highNote = 42;
      const midNote = 38;
      const lowNote = 36;

      this.groove.beat_high.forEach((beat, beatIndex) => {
        if (beat.active) {
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [highNote],
              duration: "8",
              startTick: beatIndex * 128,
              channel: 9,
            })
          );
        }

        if (this.groove.beat_mid[beatIndex].active) {
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [midNote],
              duration: "8",
              startTick: beatIndex * 128,
              channel: 9,
            })
          );
        }

        if (this.groove.beat_low[beatIndex].active) {
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: [lowNote],
              duration: "8",
              startTick: beatIndex * 128,
              channel: 9,
            })
          );
        }
      });

      const write = new MidiWriter.Writer([track]);

      const midiDataURL = write.dataUri();

      const link = document.createElement("a");
      link.href = midiDataURL;
      link.download = this.groove.title + " - Groove AI.mid";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      immediate: true,
    },
  },
};
</script>
