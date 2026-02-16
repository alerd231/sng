import { partners } from '../../data'
import { Section } from '../layout/Section'
import { Reveal } from '../motion/Reveal'

export const PartnersSection = () => (
  <Section
    index="03"
    title="Партнеры"
    className="border-t border-line/70"
    desktopSplit={false}
  >
    <div className="border-y border-ink/10 py-8 sm:py-10">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((partner, index) => (
          <Reveal key={partner.id} delay={index * 0.04}>
            <div className="group flex items-center justify-center py-2">
              <img
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                decoding="async"
                className="h-16 w-auto opacity-65 grayscale transition-all duration-300 ease-smooth group-hover:opacity-100 group-hover:grayscale-0 sm:h-18"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </Section>
)
