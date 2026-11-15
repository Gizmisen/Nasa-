"""Reproducible 30 s edit: actual gameplay, natural-speed HeyGen speech, RU subtitles."""
from pathlib import Path
import json, wave, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent.parent
FFMPEG=ROOT/'.tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v9.0.2.exe'
OUT=ROOT/'deliverables';OUT.mkdir(exist_ok=True)
W,H,FPS=1280,720,24
captions=[
 (3.23,4.18,'Построй ракету.'),(4.23,5.20,'Возглавь экипаж.'),(5.25,6.63,'Исследуй другой мир.'),
 (6.82,9.87,'В COSMOLAB каждая миссия\nначинается с исследований.'),
 (10.22,11.38,'Выбери системы,'),(11.46,12.42,'распредели бюджет'),(12.53,14.12,'и подготовь четырёх специалистов.'),
 (14.42,15.55,'Когда возникает опасность,'),(15.65,17.35,'твои решения влияют на бросок кубика.'),
 (17.55,19.14,'Высадись на далёких планетах,'),(19.27,20.45,'пройди по поверхности'),(20.72,22.30,'и исследуй новые находки.'),
 (22.68,23.95,'Доставь научные данные домой —'),(24.05,25.65,'и подготовь следующую миссию.')]
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(OUT/'COSMOLAB_Russian_subtitles.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{s}' for i,(a,b,s) in enumerate(captions)),encoding='utf8')
with wave.open(str(ROOT/'media/narration.wav'),'rb') as f:
 sr=f.getframerate();channels=f.getnchannels();width=f.getsampwidth();raw=f.readframes(f.getnframes())
assert width==2,'Unexpected narration format'
voice=np.frombuffer(raw,dtype='<i2').astype(np.float64)/32768
if channels>1:voice=voice.reshape(-1,channels).mean(1)
rate=48000
speech=np.interp(np.arange(round(len(voice)/sr*rate))/rate,np.arange(len(voice))/sr,voice)
mix=np.zeros(rate*30,dtype=np.float64);start=3*rate
assert start+len(speech)<len(mix),'Narration exceeds the approved edit'
mix[start:start+len(speech)]+=speech*.85/max(.01,np.max(np.abs(speech)))
rng=np.random.default_rng(22)
for a,b in [(0,3),(17.6,19.3),(22.7,25.8)]:
 n=int((b-a)*rate);t=np.arange(n)/rate;env=np.sin(np.linspace(0,math.pi,n))**1.4
 tone=(np.sin(t*2*math.pi*49)*.5+np.sin(t*2*math.pi*78)*.25+rng.normal(0,.1,n))*.055*env
 mix[int(a*rate):int(a*rate)+n]+=tone
for a in np.arange(25.8,29.8,.42):
 n=int(.08*rate);noise=rng.normal(0,.015,n)*np.exp(-np.arange(n)/(rate*.018));mix[int(a*rate):int(a*rate)+n]+=noise
mix=np.clip(mix,-.95,.95)
with wave.open(str(ROOT/'media/mix.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((mix*32767).astype('<i2').tobytes())
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',27)
title=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',58)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
cmd=[str(FFMPEG),'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(ROOT/'media/mix.wav'),'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(OUT/'COSMOLAB_30s_EN_RU.mp4')]
with open(ROOT/'media/encode.log','w',encoding='utf8') as log:
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
 for i in range(720):
  t=i/FPS;im=Image.open(ROOT/f'media/frames/{i:04d}.jpg').convert('RGB');d=ImageDraw.Draw(im)
  cue=next((s for a,b,s in captions if a<=t<b),None)
  if cue:
   # Captions sit above the controls, never on the game action buttons.
   bb=d.multiline_textbbox((0,0),cue,font=font,spacing=5,align='center');tw,th=bb[2]-bb[0],bb[3]-bb[1];x=(W-tw)/2;y=H-195-th
   d.rounded_rectangle((x-19,y-10,x+tw+19,y+th+16),radius=10,fill='#071723')
   d.multiline_text((W/2,y-bb[1]),cue,font=font,fill='#FFFFFF',align='center',anchor='mt',spacing=5)
  if t>=25.8:
   d.rounded_rectangle((360,73,920,211),radius=15,fill='#071723');d.text((640,85),'COSMOLAB',font=title,anchor='mt',fill='#9EE8D3');d.text((640,161),'Research. Build. Explore.',font=small,anchor='mt',fill='#E2F4F7')
  if i in [0,84,192,324,432,552,672]:im.save(ROOT/f'media/review-{i}.png')
  p.stdin.write(im.tobytes())
 p.stdin.close();code=p.wait()
 if code:raise RuntimeError(f'FFmpeg failed: {code}; see media/encode.log')
(ROOT/'media/production-ledger.json').write_text(json.dumps({'duration_seconds':30,'frames':720,'fps':24,'voice_id':'330290724a1b470fb63153f34d4c0183','voice':'Annie - Lifelike','narration_source_seconds':len(voice)/sr,'narration_offset_seconds':3,'playback_speed':1,'captions':'phrase-level Russian translation aligned to HeyGen word timestamps','footage':'actual locally captured COSMOLAB gameplay; staged demo state','audio_review':'Duration, levels and provider transcript checked; no independent listening tool was available.','sources':['media/scene-driver.js','media/capture.cjs','media/narration.json','media/edit_video.py']},ensure_ascii=False,indent=2),encoding='utf8')
print('Exported 30.000 s / 1280x720 / English voice / Russian subtitles')