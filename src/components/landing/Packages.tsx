import { Link } from 'react-router-dom';
import { plans, industryAddOn } from '@/data/mockData';
import { Check, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const Packages = () => {
  return (
    <section id="pricing" className="bg-bg-dark py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="split-panel">
          {/* Left - Dark side with text */}
          <div className="split-panel-dark flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-text-muted text-sm uppercase tracking-wide mb-4">Pricing</p>
              <h2 className="font-heading text-3xl sm:text-4xl text-text-light mb-6">
                Choose Your Package
              </h2>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                Select the program that best fits your business needs. All packages include professionally structured content aligned with Ontario legislation.
              </p>
              <p className="text-text-muted text-sm leading-relaxed">
                Need industry-specific content? Add it to any package for enhanced compliance documentation.
              </p>
            </motion.div>
          </div>

          {/* Right - Light side with cards */}
          <div className="split-panel-light">
            <div className="space-y-4">
              {/* Base Plan Cards */}
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-heading text-2xl text-text-dark">
                        {plan.name}
                      </h3>
                      <p className="text-text-dark-muted text-sm mt-1">
                        Most suitable for: {plan.suitable}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-heading text-3xl text-text-dark">
                        ${plan.price}
                      </span>
                      <span className="text-text-dark-muted text-sm ml-1">CAD</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-text-dark-muted">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="outline" className="w-full bg-text-dark text-white border-text-dark hover:bg-text-dark/90 hover:text-white">
                    <Link to={`/app/step-1?plan=${plan.id}`}>
                      Select {plan.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}

              {/* Industry Add-On Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border-2 border-dashed border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-heading text-xl text-text-dark">
                        {industryAddOn.name}
                      </h3>
                      <div className="text-right">
                        <span className="font-heading text-2xl text-text-dark">
                          +${industryAddOn.price}
                        </span>
                        <span className="text-text-dark-muted text-sm ml-1">CAD</span>
                      </div>
                    </div>
                    <p className="text-text-dark-muted text-sm mb-4">
                      {industryAddOn.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {industryAddOn.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-text-dark-muted">
                          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
