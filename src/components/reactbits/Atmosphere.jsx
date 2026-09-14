import { motion } from "framer-motion";
export default function Atmosphere({intensity=1}) {
  const particles = Array.from({length: 18}, (_,i)=>i);
  return <div className="atmosphere" aria-hidden="true">
    <div className="aurora aurora-a"/><div className="aurora aurora-b"/><div className="aurora aurora-c"/>
    <div className="grain"/>
    {particles.map(i=><motion.span key={i} className="spark"
      style={{left:`${(i*47)%101}%`,top:`${(i*71)%97}%`,animationDelay:`-${(i%7)*.8}s`,opacity:.25+((i%5)*.1)*intensity}}
      animate={{y:[0,-18,0],x:[0,(i%2?8:-8),0],scale:[1,1.35,1]}}
      transition={{duration:4+(i%4),repeat:Infinity,ease:"easeInOut"}}>✦</motion.span>)}
  </div>
}