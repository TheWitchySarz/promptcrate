"use client";

import { motion } from "framer-motion";
// import { Briefcase, Users, Star, TrendingUp } from 'lucide-react'; // Icons temporarily removed

const trustedItems = [
  {
    name: "Innovatech Solutions",
    // icon: <Briefcase size={40} className="text-purple-600" />,
    description: "Pioneering AI-driven solutions for enterprise."
  },
  {
    name: "Creative Spark Inc.",
    // icon: <Star size={40} className="text-yellow-500" />,
    description: "Rated 5 Stars by top creative agencies."
  },
  {
    name: "GlobalConnect Corp.",
    // icon: <Users size={40} className="text-blue-500" />,
    description: "Trusted by 10,000+ users worldwide."
  },
  {
    name: "FutureGrowth Capital", 
    // icon: <TrendingUp size={40} className="text-green-500" />,
    description: "Driving growth with cutting-edge prompt engineering."
  }
];

const TrustedBySection = () => {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 lg:px-8"
      >
        <div className="text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-600 uppercase tracking-wide">
            Trusted by the Best
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join the innovators who rely on PromptCrate
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Our platform empowers teams and individuals to achieve more with AI, 
            backed by a community of forward-thinking professionals.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 text-center">
          {trustedItems.map((item, index) => (
            <motion.div 
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
            >
              {/* Icon placeholder - to be re-added */}
              <div className="mb-5 p-4 rounded-full bg-purple-100 flex items-center justify-center shadow w-16 h-16">
                {/* item.icon would go here */}
                <svg className="w-8 h-8 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v11.494m0 0A8.997 8.997 0 0012 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.335 0 .662-.02.985-.057m0 0a8.997 8.997 0 01-8.015-5.943"></path></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TrustedBySection; 