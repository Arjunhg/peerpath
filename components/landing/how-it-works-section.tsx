"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import SectionHeading from "./section-heading";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    title: "Join Your Tribe",
    description:
      "Browse and join communities that align with your learning goals and interests.",
    icon: "🌍",
  },
  {
    title: "Set Your Vision",
    description:
      "Define your learning goals, current skill level, and what success looks like for you.",
    icon: "🎯",
  },
  {
    title: "Meet Your Match",
    description:
      "Our AI finds your perfect accountability partner based on compatibility and goals.",
    icon: "✨",
  },
  {
    title: "Grow Together",
    description:
      "Chat, collaborate, track progress, and celebrate wins with your learning partner.",
    icon: "🚀",
  },
];

export default function HowItWorksSection() {
  const containerVariants: Variants= {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="section-padding relative">
      <div className="section-container">
        <SectionHeading
          title="Your Journey Starts Here"
          description="From solo learner to unstoppable duo in four simple steps"
        />
        
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
          
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={stepVariants} className="relative">
              <motion.div
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/50 h-full relative overflow-hidden group">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        className="step-number relative"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {idx + 1}
                        <motion.div
                          className="absolute -inset-2 border-2 border-primary rounded-full opacity-0 group-hover:opacity-100"
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </div>
                    
                    <div className="text-center mb-3">
                      <motion.span
                        className="text-4xl inline-block"
                        whileHover={{ scale: 1.3, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {step.icon}
                      </motion.span>
                    </div>

                    <CardTitle className="text-center">{step.title}</CardTitle>
                    <CardDescription className="text-center">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}