"use client";

import { motion } from "framer-motion";

type BlurTextProps = {
  text: string;
  className?: string; // Tailwind class for colors
};

const BlurText = ({ text, className = "text-white" }: BlurTextProps) => {
  const words = text.split(" ");

  return (
    <div className="overflow-hidden">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`inline-block text-4xl md:text-6xl font-bold mx-2 ${className}`}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: index * 0.3,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default BlurText;
