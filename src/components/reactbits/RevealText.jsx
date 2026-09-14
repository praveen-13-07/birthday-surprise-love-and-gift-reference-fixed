import { motion } from "framer-motion";
export default function RevealText({children,className=""}) {
 return <motion.span className={className} initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:.8,ease:[.22,1,.36,1]}}>{children}</motion.span>
}