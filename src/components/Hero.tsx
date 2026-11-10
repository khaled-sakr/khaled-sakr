import { motion } from 'framer-motion';
import profileImg from '../assets/khaled_sakr.webp';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-12 bg-black text-snow overflow-hidden"
    >
      {/* Big Wave at Top: height follows width so it keeps its shape at every size */}
      <div className="absolute top-0 left-0 right-0 w-full z-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-[clamp(6rem,18vw,22rem)]"
          fill="none"
        >
          <path
            d="M0,0 L0,160 C180,280 360,320 540,260 C720,200 900,80 1080,120 C1260,160 1380,240 1440,260 L1440,0 Z"
            className="fill-slate/5"
          />
          <path
            d="M0,0 L0,120 C200,220 400,260 600,200 C800,140 1000,60 1200,100 C1350,130 1420,180 1440,200 L1440,0 Z"
            className="fill-slate/10"
            opacity="0.5"
          />
        </svg>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-4xl sm:text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-black leading-tight tracking-tight max-w-5xl 2xl:max-w-7xl text-balance"
      >
        Khaled Sakr is{' '}
        <br className="hidden sm:block" />
        a Software Engineer{' '}
        <br className="hidden sm:block" />
        from Egypt
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 mt-6 text-lg md:text-xl 2xl:text-2xl text-slate max-w-xl 2xl:max-w-2xl"
      >
        Full Stack & Mobile Developer. Egyptian. Building impactful digital products.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        className="mt-16 short:mt-10 relative z-10"
        // Width is derived from height (photo is 433x577, ~0.75 aspect) so the
        // full photo shows without cropping and is never upscaled much past 1x.
        style={{ width: 'min(100%, 28rem, max(45vh, 15rem))' }}
      >
        <img
          src={profileImg}
          alt="Portrait of Khaled Sakr"
          width={433}
          height={577}
          decoding="async"
          fetchPriority="high"
          className="block w-full h-auto"
        />
        {/* Fade out at the bottom like the reference */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
