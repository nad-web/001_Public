#!/usr/bin/env python3
"""Build locally hosted H.264/AAC videos from the live lesson scenes.

Requires Pillow, Piper TTS 1.8, Node and FFmpeg. Voice weights are supplied
locally. See THIRD_PARTY_NOTICES.md for model and recording provenance.
"""
import argparse
import concurrent.futures
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFont
import onnxruntime
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
SIZE = (608, 416)
FONT_DIR = Path(os.environ.get('MOTION_FONT_DIR', '/usr/share/fonts/truetype/dejavu'))
COLORS = {'back': '#0d1830', 'surface': '#142240', 'ink': '#f5f6ff', 'muted': '#bec8e0',
          'violet': '#b3a4ff', 'mint': '#b9f590', 'grid': '#344461'}
FONT_PATH = FONT_DIR / 'DejaVuSans.ttf'
BOLD_PATH = FONT_DIR / 'DejaVuSans-Bold.ttf'


def font(size, bold=False):
    return ImageFont.truetype(BOLD_PATH if bold else FONT_PATH, size)


def wrap(draw, message, ft, max_width):
    lines, line = [], ''
    for word in message.split():
        next_line = f'{line} {word}'.strip()
        if line and draw.textlength(next_line, font=ft) > max_width:
            lines.append(line)
            line = word
        else:
            line = next_line
    if line:
        lines.append(line)
    return lines


def text_block(draw, x, y, message, size, fill, width, bold=False, max_lines=None):
    ft = font(size, bold)
    lines = wrap(draw, message, ft, width)
    if max_lines:
        while len(lines) > max_lines and size > 12:
            size -= 1
            ft = font(size, bold)
            lines = wrap(draw, message, ft, width)
    for i, line in enumerate(lines):
        draw.text((x, y + i * (size + 4)), line, font=ft, fill=fill)


def graphic(frame, marks, palette):
    draw = ImageDraw.Draw(frame, 'RGBA')
    scale = .775
    point = lambda x, y: (25 + x * scale, 90 + y * scale)
    for kind, *parts in marks:
        if kind == 'line':
            x, y, xx, yy, color, stroke, dash = parts
            a, b = point(x, y), point(xx, yy)
            if not dash:
                draw.line((a, b), fill=palette[color], width=max(1, round(stroke * scale)))
            else:
                for i in range(0, 20, 2):
                    xy = lambda p: tuple(a[j]+(b[j]-a[j])*p/20 for j in range(2))
                    draw.line((xy(i), xy(i+1)), fill=palette[color], width=max(1, round(stroke * scale)))
        elif kind == 'circle':
            x, y, r, color, border = parts
            draw.ellipse((point(x-r, y-r), point(x+r, y+r)), fill=palette[color],
                         outline=palette.get(border), width=2)
        elif kind == 'rect':
            x, y, w, h, color, opacity, border = parts
            draw.rectangle((point(x, y), point(x+w, y+h)), fill=rgba(palette[color], opacity),
                           outline=palette.get(border))
        elif kind == 'poly':
            points, color, stroke, fill, opacity = parts
            coords = [point(*p) for p in points]
            if fill and len(coords) > 2:
                draw.polygon(coords, fill=rgba(palette[fill], opacity))
            draw.line(coords, fill=palette[color], width=max(1, round(stroke * scale)), joint='curve')
        elif kind == 'text':
            x, y, string, color, size, align = parts
            anchor = {'start': 'ls', 'middle': 'ms', 'end': 'rs'}[align]
            draw.text(point(x, y), string, font=font(max(9, round(size*scale))),
                      fill=palette[color], anchor=anchor)


def rgba(color, alpha):
    return (*bytes.fromhex(color.lstrip('#')), round(alpha*255))


def card(lesson, lang, stage, index, caption, palette):
    local = lesson[lang]
    German = lang == 'de'
    img = Image.new('RGB', SIZE, COLORS['back'])
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, SIZE[0], 4), fill=COLORS['mint'])
    draw.text((25, 19), 'MATH IN MOTION', font=font(13, True), fill=COLORS['mint'])
    labels = ('IDEE', 'IN BEWEGUNG', 'BEISPIEL') if German else ('THE IDEA', 'IN MOTION', 'WORKED EXAMPLE')
    draw.text((583, 20), f'0{stage+1}  /  {labels[stage]}', anchor='ra',
              font=font(12, True), fill=COLORS['muted'])
    text_block(draw, 25, 43, local['title'], 24, COLORS['ink'], 555, True, 1)
    draw.rounded_rectangle((23, 81, 585, 319), radius=15, fill=COLORS['surface'])
    if stage == 0:
        draw.text((42, 108), 'FORMEL & KONZEPT' if German else 'FORMULA & CONCEPT',
                  font=font(12, True), fill=COLORS['violet'])
        text_block(draw, 42, 164, local['formula'], 26, COLORS['ink'], 520, True, 3)
    else:
        scene = lesson['modes'][lang][index]
        graphic(img, scene['marks'], palette)
        if stage == 1:
            summary = f"{scene['control']}  →  {scene['value']}"
            draw.text((38, 301), summary, font=font(12, True), fill=COLORS['mint'])
    text_block(draw, 27, 335, caption, 15, COLORS['ink'], 550, False, 3)
    draw.text((27, 397), 'NOORULLAH ADEL  /  2026', font=font(10, True), fill=COLORS['muted'])
    return img


def synthesize(voice, sentence, config):
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav:
        voice.synthesize_wav(sentence, wav, syn_config=config)
    buffer.seek(0)
    with wave.open(buffer, 'rb') as wav:
        return wav.readframes(wav.getnframes()), wav.getframerate()


def script(lesson, lang):
    local = lesson[lang]
    name = lesson['modes'][lang][0]['control']
    if lang == 'de':
        motion = f'Beobachte, wie sich die Grafik ändert, wenn sich der Regler für {name} bewegt.'
    else:
        motion = f'Watch how the diagram changes as we move the slider for {name}.'
    return [local['explanation'], motion, local['example']]


def encode(lesson, tag, voice, config, palette, output):
    lang = tag[:2]
    level = lesson['level']
    group = f'{level}-{lang}' if level in {'university', 'advanced'} else level
    destination = output / group / tag / f"{lesson['id']}.mp4"
    if destination.exists() and destination.stat().st_size > 8000:
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='motion-video-') as folder:
        tmp = Path(folder)
        script_lines = script(lesson, lang)
        frames, audio_parts = [], []
        for stage, narration in enumerate(script_lines):
            speech = narration.replace('€','Euro').replace('%',' Prozent' if lang=='de' else ' percent')
            speech = re.sub(r'[αβμσωλ∣₁₂ᵤ²Δ∇]+', '', speech)
            pcm, rate = synthesize(voice, speech, config)
            audio_parts.append(pcm + bytes(round(rate*.35)*2))
            duration = len(audio_parts[-1])/(2*rate)
            indices = [0] if stage != 1 else list(range(9))
            for index in indices:
                frame = tmp / f'frame-{stage}-{index}.png'
                card(lesson, lang, stage, index, narration, palette).save(frame, compress_level=2)
                frames.append((frame.name, duration/len(indices)))
        with wave.open(str(tmp/'voice.wav'), 'wb') as wav:
            wav.setparams((1,2,rate,0,'NONE','not compressed'))
            wav.writeframes(b''.join(audio_parts))
        (tmp/'frames.txt').write_text(''.join(f"file '{f}'\nduration {d:.6f}\n" for f,d in frames)
                                     + f"file '{frames[-1][0]}'\n")
        generated = tmp / 'finished.mp4'
        subprocess.run([
            'ffmpeg','-nostdin','-loglevel','error','-y','-threads','1','-f','concat','-safe','0','-i',
            'frames.txt','-i','voice.wav','-vf','fps=8,format=yuv420p','-c:v','libx264','-threads','1',
            '-profile:v','baseline','-preset','veryfast','-crf','31','-tune','stillimage','-c:a','aac',
            '-b:a','24k','-ar','22050','-movflags','+faststart','-shortest',str(generated)
        ], cwd=tmp, check=True)
        shutil.move(str(generated), destination)


def worker(payload):
    tag, model, speaker, lessons, palette, output = payload
    options = onnxruntime.SessionOptions()
    options.intra_op_num_threads = 1
    options.inter_op_num_threads = 1
    # Instantiate with a bounded inference session to leave room for the encoders.
    from piper.config import PiperConfig
    config = PiperConfig.from_dict(json.loads(model.with_suffix('.onnx.json').read_text()))
    voice = PiperVoice(onnxruntime.InferenceSession(str(model), sess_options=options,
                      providers=['CPUExecutionProvider']), config)
    settings = SynthesisConfig(speaker_id=speaker, length_scale=1.02, volume=.92)
    for i, lesson in enumerate(lessons, 1):
        encode(lesson, tag, voice, settings, palette, output)
        if i % 10 == 0 or i == len(lessons):
            print(f'{tag}: {i}/{len(lessons)}', flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('voice_dir', type=Path, help='Directory with en-male.onnx, en-female.onnx and de-mls.onnx plus JSON configs')
    parser.add_argument('--german-female', type=int, required=True)
    parser.add_argument('--german-male', type=int, required=True)
    parser.add_argument('--target', action='append', default=[])
    parser.add_argument('--output', type=Path, default=ROOT/'media')
    args = parser.parse_args()
    data = json.loads(subprocess.check_output(['node', ROOT/'tools/video-scenes.mjs', *args.target]))
    tasks = [
        (tag, args.voice_dir / f'{model}.onnx', speaker, data['lessons'], data['colors'], args.output.resolve())
        for tag,model,speaker in [('en-female','en-female',None),('en-male','en-male',None),
                                   ('de-female','de-mls',args.german_female),('de-male','de-mls',args.german_male)]
    ]
    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
        list(pool.map(worker, tasks))


if __name__ == '__main__':
    main()
