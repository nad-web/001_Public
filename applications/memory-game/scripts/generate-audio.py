"""Optional asset regeneration. Not required to run, upload, or install the game.

python -m venv voice-env; voice-env/bin/pip install piper-tts==1.3.0
python generate-audio.py /path/to/fa_IR-amir-medium.onnx
Place its .onnx.json configuration beside the model. FFmpeg must be installed.
Model source/licensing: see docs/ASSET_ATTRIBUTION.md. Model and synthesis runtime
are development inputs only and must not be included in the deployment.
"""
import io
import json
import sys
import wave
import subprocess
import tempfile
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

root = Path(__file__).resolve().parents[1]
target = root / 'assets' / 'audio'
lines = json.loads((target / 'transcripts.json').read_text())['lines']
voice = PiperVoice.load(sys.argv[1])
rate = 22050
padding = b'\0\0' * int(rate * 0.35)
cues = {}
frames = 0
with tempfile.TemporaryDirectory() as tmp:
    wav_path = Path(tmp) / 'persian.wav'
    with wave.open(str(wav_path), 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        for i, (key, text) in enumerate(lines.items()):
            data = io.BytesIO()
            with wave.open(data, 'wb') as clip:
                voice.synthesize_wav(text, clip, syn_config=SynthesisConfig(length_scale=1.08))
            data.seek(0)
            with wave.open(data, 'rb') as clip:
                assert clip.getframerate() == rate and clip.getnchannels() == 1
                pcm = clip.readframes(clip.getnframes())
            out.writeframes(padding)
            frames += len(padding) // 2
            start = frames / rate
            out.writeframes(pcm)
            frames += len(pcm) // 2
            cues[key] = {'start': round(start, 4), 'end': round(frames / rate, 4)}
            if i % 20 == 0:
                print(f'{i+1}/{len(lines)} synthesized', flush=True)
        out.writeframes(padding)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav_path), '-codec:a',
                    'libmp3lame', '-b:a', '64k', '-write_xing', '1', str(target / 'persian.mp3')], check=True)
(target / 'cues.js').write_text('export const CUES = ' + json.dumps(cues, ensure_ascii=False, indent=2) + ';\n')
print(f'Generated {len(cues)} Persian clips; {frames/rate:.1f}s; {(target/"persian.mp3").stat().st_size} bytes', flush=True)
