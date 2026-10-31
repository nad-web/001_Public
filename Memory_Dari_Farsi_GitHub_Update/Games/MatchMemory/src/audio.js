// One local audio sprite, generated from Persian text. No device TTS or network voice.
export class PersianAudio {
 constructor(cues,onError=()=>{}){
  this.cues=cues;this.enabled=false;this.token=0;this.timer=null;this.end=0;this.onError=onError;
  this.element=new Audio(new URL('../assets/audio/persian.mp3',import.meta.url).href);
  this.element.preload='none';this.element.setAttribute('playsinline','');
  this.element.hidden=true;this.element.setAttribute('aria-hidden','true');document.body.append(this.element);
  this.element.addEventListener('timeupdate',()=>{if(this.end&&this.element.currentTime>=this.end)this.stop();});
 }
 setEnabled(enabled){this.enabled=enabled;if(!enabled)this.stop();else {this.element.preload='auto';this.element.load();}}
 stop(){this.token++;clearTimeout(this.timer);this.timer=null;this.end=0;this.element.pause();}
 play(id){
  if(!this.enabled||!this.cues[id])return;
  this.stop();const token=this.token;const cue=this.cues[id];this.end=cue.end;this.element.dataset.clip=id;
  // Calling play directly from the user's action preserves iOS audio permission.
  let started=false;
  const start=()=>{if(started||token!==this.token)return;try{this.element.currentTime=cue.start;}catch{return;}started=true;
   this.element.play().then(()=>{if(token!==this.token)return;clearTimeout(this.timer);this.timer=setTimeout(()=>{if(token===this.token)this.stop();},Math.max(0,1000*(cue.end-this.element.currentTime)));}).catch(()=>{if(token===this.token){this.stop();this.onError();}});
  };
  if(this.element.readyState>=1)start();
  else {
   this.element.addEventListener('loadedmetadata',start,{once:true});
   this.element.play().then(()=>{if(token===this.token&&this.element.readyState>=1)start();}).catch(()=>{ /* Metadata handler retries following a sound-button tap. */ });
  }
 }
}
