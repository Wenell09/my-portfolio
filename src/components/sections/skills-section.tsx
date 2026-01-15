import skillsData from '@/lib/skills-data.json';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { Code } from 'lucide-react';

export function SkillsSection() {
  const allSkills = skillsData.categories.flatMap((category) => category.skills);

  return (
    <section id="skills" className="scroll-mt-16 w-full">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3 leading-tight text-balance">
          <Code className="w-8 h-8 text-primary" />
          Keahlian Teknis
        </h2>
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden">
        <InfiniteMovingCards items={allSkills} direction="left" speed="slow" pauseOnHover={false} />
      </div>
    </section>
  );
}
