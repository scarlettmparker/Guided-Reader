import { Audio, VTTEntry } from '~/utils/types';

interface AudioDisplayProps {
  audio: Audio;
  set_vtt_entries: (entries: VTTEntry[]) => void;
  set_current_time: (time: number) => void;
  set_playing: (playing: boolean) => void;
}

export default AudioDisplayProps;