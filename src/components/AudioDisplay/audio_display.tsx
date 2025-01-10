import { Component, createEffect, createSignal, onMount } from 'solid-js';
import { VTTEntry } from '~/utils/types';
import AudioDisplayProps from './audio_displayprops';
import styles from './audio_display.module.css';

/**
 * Helper function to parse a time string in the format HH:MM:SS to seconds.
 * 
 * @param time Time string in the format HH:MM:SS.
 * @return Time in seconds.
 */
function parse_time(time: string): number {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parse a VTT file and return an array of VTT entries.
 * This works by reading the VTT file line by line and parsing the time ranges and text.
 * 
 * @param url URL of the VTT file.
 * @return Array of VTT entries.
 */
async function parse_vtt(url: string): Promise<VTTEntry[]> {
  const response = await fetch(url);
  const vtt_text = await response.text();
  const vtt_entries: VTTEntry[] = [];

  const vtt_lines = vtt_text.split('\n');
  let current_entry: Partial<VTTEntry> = {};
  let header_skipped = false;

  vtt_lines.forEach(line => {
    if (!header_skipped) {
      if (line.trim() === 'WEBVTT') {
        header_skipped = true;
      }
      return;
    }

    // ... get time ranges ...
    const time_match = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (time_match) {
      if (current_entry.start !== undefined && current_entry.end !== undefined && current_entry.text) {
        vtt_entries.push(current_entry as VTTEntry);
        current_entry = {};
      }
      // ... find start and end of vtt entry ...
      current_entry.start = parse_time(time_match[1]);
      current_entry.end = parse_time(time_match[2]);
    } else if (line.trim() === '') {
      if (current_entry.start !== undefined && current_entry.end !== undefined && current_entry.text) {
        vtt_entries.push(current_entry as VTTEntry);
        current_entry = {};
      }
    } else if (!isNaN(Number(line.trim()))) {
      // ... ignore sequence numbers ...
    } else {
      current_entry.text = (current_entry.text || '') + line + '\n';
    }
  });

  if (current_entry.start !== undefined && current_entry.end !== undefined && current_entry.text) {
    vtt_entries.push(current_entry as VTTEntry);
  }

  return vtt_entries;
}

/**
 * AudioDisplay component that displays an audio player to play the audio file.
 * Handles highlighting the text based on the current time of the audio, which
 * is calculated through the player ref with an event listener.
 * 
 * @param audio Audio object containing the audio file and VTT file, along with other metadata.
 * @param set_vtt_entries Function to set the VTT entries in the parent component.
 * @param set_current_time Function to set the current time in the parent component.
 * @param set_playing Function to set the playing state in the parent component.
 * @return JSX element of the AudioDisplay.
 */
const AudioDisplay: Component<AudioDisplayProps> = (props) => {
  const [hidden, set_hidden] = createSignal(false);
  const [show_alt_text, set_show_alt_text] = createSignal(false);

  const vtt_file = props.audio.vtt_file;
  const audio_file = props.audio.audio_file;
  let player_ref!: HTMLAudioElement;

  onMount(async () => {
    const entries = await parse_vtt(vtt_file);
    props.set_vtt_entries(entries);
  })

  createEffect(() => {
    // ... handle the time update event ...
    const handle_time_update = () => {
      if (player_ref) {
        const current_time = player_ref.currentTime;
        props.set_current_time(current_time);
        props.set_playing(!player_ref.paused);
      }
    }

    player_ref.addEventListener("timeupdate", handle_time_update);
    return () => {
      player_ref.removeEventListener("timeupdate", handle_time_update);
    }
  })

  return (
    <>
      <div class={`${styles.hide_button_container} ${hidden() ? styles.audio_hidden : ''} ${show_alt_text() ? styles.visible : ''}`}
        onclick={(e) => {
          e.stopPropagation();
          set_hidden(!hidden());
        }} onmouseenter={() => set_show_alt_text(true)} onmouseleave={() => set_show_alt_text(false)} >
        <div class={`${styles.alt_text} ${show_alt_text() ? styles.visible : ''}`}>
          {hidden() ? 'Show Audio' : 'Hide Audio'}
        </div>
        <div class={styles.hide_button} />
      </div>
      <div class={`${styles.audio_display} ${hidden() ? styles.hidden : ''}`}
        onclick={() => hidden() && set_hidden(!hidden())}>
        <audio controls ref={player_ref} src={audio_file} class={hidden() ? styles.hidden : undefined} />
      </div>
    </>
  );
}

export default AudioDisplay;