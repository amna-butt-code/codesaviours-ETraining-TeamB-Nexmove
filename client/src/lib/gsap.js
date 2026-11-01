import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
 
// Register once, browser only (Next.js renders on the server first).
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
 
export { gsap, ScrollTrigger };
 