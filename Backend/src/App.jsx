import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { motion } from 'framer-motion';

const features = [
  { icon: '⏰', title: 'Powerful Reminders', description: 'Set precise schedules for any elixir. Receive timely browser or email alerts so you never miss a dose.' },
  { icon: '📝', title: 'Simple Logging', description: 'Effortlessly track taken vs. missed doses with a single click, maintaining a perfect record.' },
  { icon: '📊', title: 'Wellness Dashboard', description: 'Visualize your progress with beautiful charts showing adherence rates, trends, and scores over time.' },
  { icon: '🔮', title: 'Mystic Predictions', description: 'Our advanced AI predicts when a dose might be forgotten and sends proactive nudges to keep you on track.' },
  { icon: '📅', title: 'Calendar Sync', description: 'Automatically sync your Grimoire to the Great Sky Calendar (Google Calendar) for a unified view.' },
  { icon: '✍️', title: 'Natural Language', description: 'Ask questions in plain English, like "When is my next dose?" and get instant answers from the Mystic.' },
];

function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 }
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
    whileHover: { 
      scale: 1.05, 
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="min-h-screen flex flex-col justify-center items-center text-center p-8 relative overflow-hidden"
      >
        <div className="starfield"></div>
        
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
          className="text-6xl md:text-8xl font-serif font-bold text-foreground z-10"
        >
          Alchemist's Grimoire
        </motion.h1>
        <motion.p 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-2xl z-10"
        >
          Never miss a vital dose. Automate your wellness schedule with a touch of magic.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="z-10 mt-12"
        >
          {/* --- THE FIX IS ON THIS LINE --- */}
          <Button size="lg" className="text-lg py-8 px-10 rounded-full shadow-lg shadow-pink-500/50">
            Enter the Grimoire
          </Button>
        </motion.div>
      </motion.header>

      {/* Features Section */}
      <section id="features" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-serif font-bold text-center text-foreground mb-20">
            Discover the Magic
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature) => (
              <motion.div 
                key={feature.title} 
                variants={itemVariants}
                whileHover="whileHover"
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/20 cursor-pointer">
                  <CardHeader>
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <CardTitle className="text-2xl font-serif text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-8 border-t">
        <p className="text-muted-foreground">&copy; 2025 Alchemist's Grimoire. All rights reserved.</p>
      </footer> 
    </div>
  );
}

export default App;