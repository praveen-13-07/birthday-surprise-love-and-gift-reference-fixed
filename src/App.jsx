import {useEffect,useMemo,useRef,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {gsap} from "./lib/gsap";
import Atmosphere from "./components/reactbits/Atmosphere";
import EmojiLanyard from "./components/reactbits/EmojiLanyard";
import MagneticButton from "./components/reactbits/MagneticButton";
import SmoothScroll from "./components/SmoothScroll/SmoothScroll";
import {JourneyProvider,useJourney} from "./context/JourneyContext";
import {CONTENT as C} from "./data/content";
import {GIRLFRIEND_PHOTOS} from "./data/photos";
import {MEMORY_IMAGES} from "./data/memoryImages";
import "./styles/global.css";

function Frame({children}){
  const {stepIndex,sections,goToStep,isFirst}=useJourney();
  return <main className="universe">
    <Atmosphere/>
    <div className="paper-grid" aria-hidden="true"/>
    <header className="topbar">
      <button className="brand" onClick={()=>goToStep(0)} aria-label="Back to the beginning">for you <b>♥</b></button>
      <span className="counter">{String(stepIndex+1).padStart(2,"0")} / {String(sections.length).padStart(2,"0")}</span>
    </header>
    <EmojiLanyard emoji="🧿"/>
    <div className="progress"><span style={{width:`${((stepIndex+1)/sections.length)*100}%`}}/></div>
    <nav className="side-nav" aria-label="Birthday chapters">
      {sections.map((section,i)=><button key={section.id} className={i===stepIndex?"active":""} onClick={()=>goToStep(i)} aria-label={`Go to chapter ${i+1}`}><span>{String(i+1).padStart(2,"0")}</span></button>)}
    </nav>
    {children}
    {!isFirst&&<button className="back-button neo-button neo-button--white" onClick={()=>goToStep(stepIndex-1)} aria-label="Go back to previous chapter">← Back</button>}
    <div className="corner-note">made with too much love <b>♥</b></div>
  </main>
}

function Stage({children,id,photo,position="center"}){
  return <section className={`stage stage--${id}`}>
    {photo&&<div className="stage-photo" aria-hidden="true"><img src={photo.src} alt="" style={{objectPosition:position}}/><span/></div>}
    {photo&&id!=="welcome"&&id!=="final"&&<div className="stage-mini-photo" aria-hidden="true"><img src={photo.src} alt="" style={{objectPosition:position}}/><b>MEMORY</b></div>}
    <div className="neo-corner neo-corner--tl" aria-hidden="true"/>
    <div className="neo-corner neo-corner--br" aria-hidden="true"/>
    <div className="stage-inner">{children}</div>
  </section>
}

function Welcome(){
  const {goNext}=useJourney(); const ref=useRef(null);
  useEffect(()=>{if(!ref.current)return;gsap.fromTo(ref.current.querySelectorAll(".hero-word"),{y:70,opacity:0,rotate:3},{y:0,opacity:1,rotate:0,duration:1.1,stagger:.08,ease:"power4.out"});},[]);
  return <Stage id="welcome" photo={C.photos[0]} position="center">
    <div className="hero-layout">
      <div className="hero-copy">
        <div className="hero-kicker"><span/> {C.welcome.eyebrow} <span/></div>
        <h1 ref={ref} className="hero-title"><span className="hero-word">Hey,</span><em className="hero-word">you.</em></h1>
        <p className="hero-sub">{C.welcome.subtitle}</p>
        <div className="hero-actions"><MagneticButton onClick={goNext}>{C.welcome.button}<span>↗</span></MagneticButton><span className="tiny-stamp">a special place<br/>for my special person ♡</span></div>
      </div>
      <div className="hero-collage" aria-hidden="true">
        <div className="blue-note">Better<br/>Together ♡</div>
        <div className="polaroid polaroid--hero"><img src={C.photos[0].src} alt=""/><b>YOU + ME</b></div>
        <div className="scribble">Same soul.<br/>Different bodies.<br/>Forever us… ♡</div>
      </div>
    </div>
    <div className="scroll-cue"><i/> keep going</div>
  </Stage>
}

function LoveGate(){
  const {goNext}=useJourney();
  const [noPos,setNoPos]=useState({x:0,y:0});
  const [yesScale,setYesScale]=useState(1);
  const [reaction,setReaction]=useState("normal");
  const [yesPressed,setYesPressed]=useState(false);
  const area=useRef(null);
  const dodge=()=>{
    setReaction("cry");
    const r=area.current?.getBoundingClientRect();
    if(!r)return;
    const maxX=Math.max(90,Math.min(260,r.width*.72));
    const maxY=Math.max(70,Math.min(180,r.height*.72));
    const x=(Math.random()-.5)*maxX,y=(Math.random()-.5)*maxY;
    setNoPos({x,y});
    setYesScale(s=>Math.min(1.45,s+.07));
  };
  const chooseYes=()=>{
    setReaction("happy");
    setYesPressed(true);
    setTimeout(goNext,450);
  };
  const reactionSrc={
    normal:"/assets/love-reactions/boy-normal.png",
    cry:"/assets/love-reactions/boy-cry.png",
    happy:"/assets/love-reactions/boy-happy.png"
  }[reaction];
  return <Stage id="love-gate" photo={C.photos[1]} position="center">
    <div className="section-label">01 <span>unlock the next chapter</span></div>
    <div className="question-card neo-card">
      <div className="card-tape" aria-hidden="true"/>
      <div className={`love-reaction love-reaction--${reaction}`} aria-hidden="true"><img src={reactionSrc} alt=""/></div>
      <p className="eyebrow">one tiny question</p><h2>{C.loveGate.question}</h2><p className="hint">{C.loveGate.hint}</p>
      <div ref={area} className="choice-zone">
        <motion.button className="choice choice--yes neo-button neo-button--blue" animate={{scale:yesScale}} onPointerEnter={()=>setReaction("happy")} onFocus={()=>setReaction("happy")} onClick={chooseYes}>{C.loveGate.yes}</motion.button>
        <motion.button className="choice choice--no neo-button neo-button--white" animate={{x:noPos.x,y:noPos.y}} transition={{duration:.06,ease:[.22,1,.36,1]}} onPointerEnter={dodge} onFocus={()=>setReaction("cry")} onClick={dodge}>{C.loveGate.no}</motion.button>
      </div>
      <motion.div className="tiny-note" animate={{opacity:yesScale>1.2||yesPressed?1:0}}>{C.loveGate.success}</motion.div>
    </div>
  </Stage>
}

function Balloons(){
  const {goNext}=useJourney();const [popped,setPopped]=useState([]);const [reveal,setReveal]=useState(null);const [revealPos,setRevealPos]=useState({x:50,y:50});const popTimer=useRef(null);const advanceTimer=useRef(null);
  const pop=(i,e)=>{
    if(popped.includes(i)||reveal!==null)return;
    const field=e.currentTarget.parentElement.getBoundingClientRect();
    const r=e.currentTarget.getBoundingClientRect();
    setRevealPos({x:((r.left+r.width/2-field.left)/field.width)*100,y:((r.top+r.height/2-field.top)/field.height)*100});
    const isLast=popped.length===C.balloons.messages.length-1;
    setPopped(p=>[...p,i]);setReveal(i);
    clearTimeout(popTimer.current);clearTimeout(advanceTimer.current);
    popTimer.current=setTimeout(()=>setReveal(null),1000);
    if(isLast){
      // Advance exactly once after the final quote finishes; this prevents the
      // balloon stage from skipping chapters (e.g. 03 → 06).
      advanceTimer.current=setTimeout(()=>goNext(),1250);
    }
  };
  useEffect(()=>()=>{clearTimeout(popTimer.current);clearTimeout(advanceTimer.current)},[]);
  return <Stage id="balloons" photo={C.photos[2]} position="center">
    <div className="section-label">02 <span>little confessions</span></div><h2 className="section-title">{C.balloons.title}</h2><p className="section-sub balloon-instruction">{C.balloons.subtitle}</p>
    <div className="balloon-field">{C.balloons.messages.map((m,i)=><motion.button key={i} className={`balloon b${i}`} onClick={e=>pop(i,e)} whileHover={reveal===null?{scale:1.08,y:-8}:undefined} animate={popped.includes(i)?{scale:0,opacity:0,rotate:35}:{y:[0,-12,0]}} transition={popped.includes(i)?{duration:.35}:{duration:3+i*.35,repeat:Infinity,ease:"easeInOut"}}><span>♥</span>{!popped.includes(i)&&<small>pop me</small>} {!popped.includes(i)&&<i/>}</motion.button>)}
      <div className="confession" style={{left:`${revealPos.x}%`,top:`${revealPos.y}%`}}><AnimatePresence mode="wait">{reveal!==null&&<motion.p key={reveal} initial={{opacity:0,scale:.55,y:18}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.72,y:-12}} transition={{duration:.32,ease:[.22,1,.36,1]}}>&ldquo;{C.balloons.messages[reveal]}&rdquo;</motion.p>}</AnimatePresence></div>
    </div>
    {popped.length<C.balloons.messages.length&&<span className="progress-text">{popped.length} / {C.balloons.messages.length} discovered</span>}
  </Stage>
}
function Flower(){
  const {goNext}=useJourney();const [bloom,setBloom]=useState(false);const ref=useRef(null);
  const start=()=>{if(bloom)return;setBloom(true);if(ref.current){const tl=gsap.timeline();tl.fromTo(ref.current.querySelector(".stem"),{scaleY:0},{scaleY:1,duration:.8,ease:"power2.out"}).fromTo(ref.current.querySelectorAll(".petal"),{scale:0,opacity:0},{scale:1,opacity:1,duration:.55,stagger:.08,ease:"back.out(2)"},"-=.35").fromTo(ref.current.querySelector(".flower-core"),{scale:0},{scale:1,duration:.4,ease:"back.out(3)"},"-=.2")}};
  return <Stage id="flower" photo={C.photos[3]} position="center">
    <div className="section-label">03 <span>press & bloom</span></div><h2 className="section-title">{C.flower.title}</h2><p className="section-sub">{C.flower.subtitle}</p>
    <div ref={ref} className={`flower ${bloom?"is-bloomed":""}`} onPointerDown={start}><div className="stem"/><div className="leaf leaf-a"/><div className="leaf leaf-b"/><div className="flower-head">{Array.from({length:8},(_,i)=><span className="petal" key={i} style={{transform:`rotate(${i*45}deg) translateY(-54px)`}}/>)}<div className="flower-core">♥</div></div></div>
    <AnimatePresence>{bloom&&<motion.div className="reveal-copy" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}}>{C.flower.reveal}<MagneticButton onClick={goNext}>Keep going →</MagneticButton></motion.div>}</AnimatePresence>
  </Stage>
}

function Memory(){
  const {goNext}=useJourney();const [found,setFound]=useState(false);
  return <Stage id="memory" photo={C.photos[4]} position="center">
    <div className="section-label">04 <span>memory hunt</span></div><h2 className="section-title">{C.memory.title}</h2><p className="section-sub">{C.memory.subtitle}</p>
    <div className="memory-grid">{MEMORY_IMAGES.map((src,i)=><motion.button key={src} className={`memory-tile neo-tile ${found&&i===C.memory.correct?"found":""}`} onClick={()=>i===C.memory.correct?setFound(true):null} whileHover={{y:-8,rotate:i%2?2:-2}}>
      <span className="memory-image"><img src={src} alt={`Memory ${String(i+1).padStart(2,"0")}`} /></span>
      <small>{found&&i===C.memory.correct?"you found it":"open"}</small>
    </motion.button>)}</div>
    {found&&<motion.div className="memory-reveal neo-card" initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}><b>✨</b><p>{C.memory.reveal}</p><MagneticButton onClick={goNext}>Show me our moments</MagneticButton></motion.div>}
  </Stage>
}

function Photos(){
  const {goNext}=useJourney();const [active,setActive]=useState(0);const touchStart=useRef(0);const photo=GIRLFRIEND_PHOTOS[active%GIRLFRIEND_PHOTOS.length];const caption=C.photos[active%C.photos.length]?.caption||"A little memory of us.";const next=dir=>setActive(i=>(i+dir+GIRLFRIEND_PHOTOS.length)%GIRLFRIEND_PHOTOS.length);
  return <Stage id="photos" photo={C.photos[5]} position="center">
    <div className="section-label">05 <span>our little archive</span></div><h2 className="section-title">Swipe through us.</h2><p className="section-sub">Drag the photo. Every card is a tiny memory.</p>
    <div className="photo-stack" onPointerDown={e=>touchStart.current=e.clientX} onPointerUp={e=>{const d=e.clientX-touchStart.current;if(Math.abs(d)>45)next(d<0?1:-1)}}>
      <AnimatePresence mode="popLayout"><motion.div key={active} className="photo-card" initial={{opacity:0,x:active%2?80:-80,rotate:active%2?8:-8}} animate={{opacity:1,x:0,rotate:active%2?2:-2}} exit={{opacity:0,x:-90,rotate:-10}} transition={{duration:.55,ease:[.22,1,.36,1]}} whileHover={{rotate:0,scale:1.025}}><div className="photo-placeholder" aria-label="Your girlfriend photo goes here"><img src={photo.src} alt=""/><span className="photo-fallback">MEMORY {String(active+1).padStart(2,"0")}</span></div><div className="photo-caption"><span>{String(active+1).padStart(2,"0")}</span><p>{caption}</p></div></motion.div></AnimatePresence><div className="stack-back one"/><div className="stack-back two"/></div>
    <div className="photo-controls"><button onClick={()=>next(-1)}>←</button><div>{GIRLFRIEND_PHOTOS.map((_,i)=><i key={i} className={i===active?"on":""}/>)}</div><button onClick={()=>next(1)}>→</button></div><MagneticButton onClick={goNext}>There's more →</MagneticButton>
  </Stage>
}

function Story(){
  const {goNext}=useJourney();const ref=useRef(null);useEffect(()=>{const ctx=gsap.context(()=>gsap.from(".story-item",{scrollTrigger:{trigger:".story-track",start:"top 75%"},opacity:0,x:-35,stagger:.18,duration:.8,ease:"power3.out"}),ref);return()=>ctx.revert()},[]);
  return <Stage id="story" photo={C.photos[6]} position="center"><div className="section-label">06 <span>the timeline</span></div><h2 className="section-title">A few chapters of us.</h2><div className="story-track" ref={ref}>{C.story.map((s,i)=><div className="story-item" key={s.year}><div className="story-year">{s.year}</div><div className="story-line"><span/></div><div className="story-content"><h3>{s.title}</h3><p>{s.text}</p></div><div className="story-index">0{i+1}</div></div>)}</div><MagneticButton onClick={goNext}>Read my letter →</MagneticButton></Stage>
}

function Letter(){
  const {goNext}=useJourney();const [open,setOpen]=useState(false);
  return <Stage id="letter" photo={C.photos[7]} position="center"><div className="section-label">07 <span>something from me</span></div><h2 className="section-title">{C.letter.title}</h2>{!open?<motion.button className="envelope neo-card" onClick={()=>setOpen(true)} whileHover={{y:-8,rotate:-1}}><div className="envelope-flap"/><div className="envelope-seal">♥</div><span>open this</span></motion.button>:<motion.article className="letter neo-card" initial={{opacity:0,y:40,scale:.96}} animate={{opacity:1,y:0,scale:1}}><div className="letter-date">for you, always</div>{C.letter.body.map((p,i)=><motion.p key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.22}}>{p}</motion.p>)}<MagneticButton onClick={goNext}>I have one more surprise →</MagneticButton></motion.article>}</Stage>
}

function Gift(){
  const {goNext}=useJourney();
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const reveal=()=>{
    if(open)return;
    setOpen(true);
    gsap.timeline()
      .to(ref.current,{rotate:-3,duration:.1,yoyo:true,repeat:5})
      .to(ref.current.querySelector(".gift-lid"),{x:105,y:115,rotate:22,duration:.7,ease:"power3.in"})
      .to(ref.current.querySelector(".gift-ribbon"),{x:105,y:115,rotate:22,duration:.7,ease:"power3.in"},"<")
      .to(ref.current.querySelector(".gift-boy-image"),{y:0,scale:1,opacity:1,duration:.7,ease:"back.out(1.7)"},"-=.35")
      .to(ref.current.querySelector(".gift-glow"),{opacity:1,scale:1.4,duration:.5},"-=.45");
  };
  return <Stage id="gift" photo={C.photos[8]} position="center"><div className="section-label">08 <span>the box</span></div><h2 className="section-title">{C.gift.title}</h2><p className="section-sub">{C.gift.subtitle}</p><div ref={ref} className={`gift ${open?"open":""}`} onClick={reveal}>
    <div className="gift-glow"/>
    <img className="gift-boy-image" src="/assets/love-reactions/boy-normal.png" alt="" aria-hidden="true"/>
    <div className="gift-lid"><i/></div><div className="gift-box"><i/></div><div className="gift-ribbon"/>
  </div>{open&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="gift-reveal neo-card"><span>✦</span><p className="gift-me">Gift was me. ♥</p><p>Surprise. The real gift is all the moments we haven't made yet.</p><MagneticButton onClick={goNext}>Next surprise →</MagneticButton></motion.div>}</Stage>
}

function Cake(){
  const {goNext}=useJourney();const [lit,setLit]=useState([0,1,2]);const extinguish=i=>setLit(a=>a.filter(x=>x!==i));useEffect(()=>{if(!lit.length){const t=setTimeout(goNext,1400);return()=>clearTimeout(t)}},[lit.length,goNext]);
  return <Stage id="cake" photo={C.photos[9]} position="center"><div className="section-label">09 <span>make a wish</span></div><h2 className="section-title">{C.cake.title}</h2><p className="section-sub">{C.cake.subtitle}</p><div className="chicken-rice-scene"><div className="flames">{[0,1,2].map(i=><button key={i} className={`flame ${lit.includes(i)?"lit":""}`} onClick={()=>extinguish(i)} aria-label={`Blow candle ${i+1}`}><span/></button>)}</div><div className="chicken-rice-art"><img src="/assets/chicken-rice-neo.png" alt="Neo-brutalist chicken rice"/><span className="art-sticker">FAVOURITE<br/>FOOD ♥</span></div></div><div className="food-note neo-card"><b>CHICKEN RICE ♥</b><p>{C.cake.foodNote}</p></div><AnimatePresence>{!lit.length&&<motion.div className="wish neo-card" initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}}><b>✨ wish granted ✨</b><p>May her year be as happy as her favourite meal.</p></motion.div>}</AnimatePresence></Stage>
}
function Final(){
  const ref=useRef(null);useEffect(()=>{const tl=gsap.timeline();tl.fromTo(ref.current.querySelector(".final-orb"),{scale:0,opacity:0},{scale:1,opacity:1,duration:1.2,ease:"power3.out"}).fromTo(ref.current.querySelectorAll(".final-line"),{opacity:0,y:35},{opacity:1,y:0,stagger:.2,duration:.9,ease:"power3.out"},"-=.4");return()=>tl.kill()},[]);
  return <Stage id="final" photo={C.photos[10]} position="center"><div ref={ref} className="finale"><div className="final-orb"/><div className="final-polaroid"><img src={C.photos[10].src} alt=""/><span>one more memory ♡</span></div><p className="eyebrow final-line">{C.final.eyebrow}</p><h2 className="final-title final-line">{C.final.title}</h2><p className="final-sub final-line">{C.final.subtitle}</p><div className="final-divider final-line"><span>♥</span></div><p className="final-end final-line">{C.final.end}</p><div className="heart-rain" aria-hidden>{Array.from({length:14},(_,i)=><span key={i} style={{left:`${5+(i*17)%90}%`,animationDelay:`${(i%6)*.45}s`}}>♥</span>)}</div></div></Stage>
}

function Inner(){
  const {currentSection}=useJourney();
  const map={welcome:Welcome,"love-gate":LoveGate,balloons:Balloons,flower:Flower,memory:Memory,photos:Photos,story:Story,letter:Letter,gift:Gift,cake:Cake,final:Final};
  const Comp=map[currentSection.id];
  return <Frame><AnimatePresence mode="wait"><motion.div key={currentSection.id} initial={{opacity:0,scale:.985,y:15}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:1.015,y:-15}} transition={{duration:.55,ease:[.22,1,.36,1]}}><Comp/></motion.div></AnimatePresence></Frame>
}
export default function App(){return <JourneyProvider><SmoothScroll><Inner/></SmoothScroll></JourneyProvider>}
