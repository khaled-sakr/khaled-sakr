import { motion } from 'framer-motion';
import { FaReact, FaGooglePlay, FaAppStore, FaCode, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';
import { SiNextdotjs, SiTypescript } from 'react-icons/si';

interface Highlight {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** In-page anchor for "See more"; null renders a static card. */
  link: string | null;
}

const highlights: Highlight[] = [
  {
    icon: <FaGooglePlay className="text-4xl" />,
    title: '60,000+ Active Users',
    description: 'Tazakka App on Google Play — Islamic mobile app with massive user base',
    link: '#projects',
  },
  {
    icon: <FaAppStore className="text-4xl" />,
    title: 'Published on App Store & Google Play',
    description: 'Hawadeet App — Social platform for Arabic users on both platforms',
    link: '#projects',
  },
  {
    icon: <SiNextdotjs className="text-4xl" />,
    title: 'Full Stack at Almdrasa',
    description: 'Leading frontend team on DS-Mate, a high-scale dropshipping platform',
    link: '#projects',
  },
  {
    icon: <FaReact className="text-4xl" />,
    title: 'React Native Expert',
    description: 'Building production mobile apps with 60K+ users at TAZKIAH Foundation',
    link: '#projects',
  },
  {
    icon: <FaLaptopCode className="text-4xl" />,
    title: 'Frontend Team Lead',
    description: 'Overseeing architecture decisions, code reviews, and task distribution',
    link: '#projects',
  },
  {
    icon: <SiTypescript className="text-4xl" />,
    title: 'TypeScript & Modern Stack',
    description: 'React, Next.js, React Native, Node.js, Tailwind CSS, Firebase',
    link: '#projects',
  },
  {
    icon: <FaGraduationCap className="text-4xl" />,
    title: 'B.Sc. Electrical Engineering',
    description: 'Al Azhar University — Class of 2025',
    link: null,
  },
  {
    icon: <FaCode className="text-4xl" />,
    title: 'Software Engineer Intern',
    description: 'Kalbonyan Elmarsos — Intensive training in programming & modern frameworks',
    link: '#experience',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardClass = 'group flex flex-col h-full p-6 bg-panel border border-slate/20 rounded-xl hover:border-orchid/70 transition-colors duration-300';

function CardBody({ h }: { h: Highlight }) {
  return (
    <>
      <div className="mb-4 text-snow group-hover:text-orchid group-hover:scale-110 transition-[transform,color] duration-300 inline-block self-start" aria-hidden="true">
        {h.icon}
      </div>
      <h3 className="text-xl font-bold text-snow mb-2 leading-tight">{h.title}</h3>
      <p className="text-sm text-slate">{h.description}</p>
      {h.link && (
        <span className="mt-auto pt-4 inline-flex items-center text-sm text-slate group-hover:text-snow transition-colors">
          See more
          <svg className="ml-1 w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M1 1l10 10M11 1v10H1" />
          </svg>
        </span>
      )}
    </>
  );
}

export default function Highlights() {
  return (
    <section id="highlights" aria-labelledby="highlights-heading" className="py-24 px-6 md:px-16 lg:px-24 bg-black">
      <h2 id="highlights-heading" className="sr-only">Highlights</h2>
      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {highlights.map((h) => (
          <motion.li key={h.title} variants={item}>
            {h.link ? (
              <a href={h.link} className={cardClass}>
                <CardBody h={h} />
              </a>
            ) : (
              <div className={cardClass}>
                <CardBody h={h} />
              </div>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
