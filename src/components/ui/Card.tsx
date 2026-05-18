"use client";

import { motion } from "framer-motion";

export default function Card({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className="nx-card"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 20, mass: 0.7 }}
    >
      <header className="nx-card-hd">
        <div>
          <h2 className="nx-card-title">{title}</h2>
          {subtitle ? <p className="nx-card-sub">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}
