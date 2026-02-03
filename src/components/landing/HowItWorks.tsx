import { howItWorksSteps } from '@/data/mockData';
import { Package, Image, Building2, FileCheck, CreditCard, Mail, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  Package,
  Image,
  Building2,
  FileCheck,
  CreditCard,
  Mail,
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-bg-dark py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-text-light mb-4">
            How It Works
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Six simple steps to your professional H&S manual
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {howItWorksSteps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-bg-surface rounded-2xl border border-border-dark p-8 hover:border-border-dark/80 transition-all duration-300 group"
              >
                <span className="text-5xl font-heading text-text-muted/30 mb-4 block">
                  {String(step.step).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-xl bg-bg-surface-light flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl text-text-light mb-2">
                  {step.title}
                </h3>
                <p className="text-text-muted text-sm">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
