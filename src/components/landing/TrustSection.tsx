import { trustBadges } from '@/data/mockData';
import { MapPin, FileEdit, Shield, CheckCircle, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  FileEdit,
  Shield,
  CheckCircle,
};

export const TrustSection = () => {
  return (
    <section id="trust" className="bg-bg-dark py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="split-panel">
          {/* Left - Light side with trust badges */}
          <div className="split-panel-light order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustBadges.map((badge, index) => {
                const Icon = iconMap[badge.icon];
                return (
                  <motion.div
                    key={badge.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-md"
                  >
                    <div className="w-10 h-10 rounded-lg bg-bg-light flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-text-dark" />
                    </div>
                    <h4 className="font-heading text-lg text-text-dark mb-1">
                      {badge.title}
                    </h4>
                    <p className="text-text-dark-muted text-sm">
                      {badge.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right - Dark side with quote */}
          <div className="split-panel-dark flex flex-col justify-center order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Trust & Compliance</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-text-light mb-6">
                Built for Ontario Businesses
              </h2>
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                Our templates are structured to meet Ontario's Occupational Health and Safety Act requirements, ensuring your documentation is audit-ready from day one.
              </p>
              <div className="bg-bg-surface-light rounded-xl p-6 border border-border-dark">
                <p className="text-text-muted text-sm italic">
                  "Legal disclaimer applies. Templates provided as guidance only. The company takes full responsibility for ensuring the final adopted H&S Manual meets all specific operational and legislative requirements."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
