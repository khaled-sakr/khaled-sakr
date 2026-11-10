import { motion } from 'framer-motion';

interface SkillCard {
  category: string;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  /** Solid (non-opacity) color for the eyebrow + description; >= 4.5:1 on the card. */
  mutedColor: string;
  chipClass: string;
  items: string[];
}

const skillCards: SkillCard[] = [
  {
    category: 'Languages',
    title: 'Core Programming Languages',
    description: 'Building robust applications with modern languages',
    bgColor: 'bg-gradient-to-br from-rose-deep to-card-rose border border-rose/40',
    textColor: 'text-snow',
    mutedColor: 'text-slate',
    chipClass: 'bg-rose text-snow',
    items: ['JavaScript', 'TypeScript', 'C++', 'Matlab'],
  },
  {
    category: 'Frontend',
    title: 'Frontend & Mobile',
    description: 'Creating beautiful, performant user interfaces',
    bgColor: 'bg-card-slate border border-slate/25',
    textColor: 'text-snow',
    mutedColor: 'text-slate',
    chipClass: 'bg-black/50 border border-slate/30 text-snow',
    items: ['React.js', 'React Native', 'Next.js', 'Expo', 'Redux Toolkit', 'Tailwind CSS', 'Bootstrap'],
  },
  {
    category: 'Backend',
    title: 'Backend & Services',
    description: 'Server-side development and cloud services',
    bgColor: 'bg-gradient-to-br from-orchid-deep to-card-orchid border border-orchid/40',
    textColor: 'text-snow',
    mutedColor: 'text-slate',
    chipClass: 'bg-orchid text-black',
    items: ['Node.js', 'Firebase', 'REST APIs', 'Supabase'],
  },
  {
    category: 'Tools',
    title: 'Dev Tools & Workflow',
    description: 'Professional development environment and practices',
    bgColor: 'bg-black border border-slate/30',
    textColor: 'text-snow',
    mutedColor: 'text-slate',
    chipClass: 'bg-snow/10 text-snow',
    items: ['Git', 'GitLab', 'Jira', 'Slack', 'Agile/Scrum', 'CI/CD'],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative z-[11] -mt-14 bg-black rounded-t-[60px] pt-28 md:pt-32 pb-24 px-6 md:px-16 lg:px-24">
      <h2 id="skills-heading" className="hero-heading font-black uppercase tracking-tight leading-none text-center text-[clamp(3rem,12vw,160px)] mb-16 md:mb-24">Skills</h2>
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {skillCards.map((card) => (
            <motion.div
              key={card.category}
              variants={item}
              className={`${card.bgColor} ${card.textColor} rounded-3xl p-8 md:p-10 hover:shadow-xl hover:shadow-rose/20 transition-shadow duration-300`}
            >
              <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${card.mutedColor}`}>
                {card.category}
              </p>
              <h3 className="text-2xl md:text-3xl font-black mb-3">{card.title}</h3>
              <p className={`mb-6 text-sm ${card.mutedColor}`}>{card.description}</p>
              <ul className="flex flex-wrap gap-2" aria-label={`${card.category} skills`}>
                {card.items.map((skill) => (
                  <li key={skill} className={`px-4 py-2 rounded-full text-sm font-medium ${card.chipClass}`}>
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
