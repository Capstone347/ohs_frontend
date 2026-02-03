import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="min-h-[calc(100vh-72px)] bg-bg-dark flex items-center justify-center relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-dark via-bg-surface to-bg-dark opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-text-muted text-lg mb-6 italic"
        >
          Health & Safety Compliance
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-light font-light tracking-tight leading-tight mb-8"
        >
          Generate a Professional Health & Safety Manual in Minutes
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-body"
        >
          Choose your package, brand it with your logo, tailor the Table of Contents by industry, and receive a fully editable manual by email.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="text-base px-8 py-6">
            <Link to="/app/step-1">
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 bg-transparent border-text-light/30 text-text-light hover:bg-text-light/10 hover:text-text-light">
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-dark to-transparent" />
    </section>
  );
};
