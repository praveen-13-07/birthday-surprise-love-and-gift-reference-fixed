import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
export default function MagneticButton({children,onClick,secondary=false,className=""}) {
 const ref=useRef(null), x=useMotionValue(0), y=useMotionValue(0), sx=useSpring(x,{stiffness:350,damping:18}), sy=useSpring(y,{stiffness:350,damping:18});
 const move=e=>{const r=ref.current?.getBoundingClientRect(); if(!r)return; x.set((e.clientX-r.left-r.width/2)*.16); y.set((e.clientY-r.top-r.height/2)*.16)};
 const leave=()=>{x.set(0);y.set(0)};
 return <motion.button ref={ref} className={`magnetic ${secondary?"magnetic--secondary":""} ${className}`} onMouseMove={move} onMouseLeave={leave} onClick={onClick} style={{x:sx,y:sy}} whileTap={{scale:.96}}>{children}<span className="button-shine"/></motion.button>
}