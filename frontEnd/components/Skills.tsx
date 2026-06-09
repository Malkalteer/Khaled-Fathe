import React from 'react';
import { PenTool, Layout, Palette, Home } from 'lucide-react';
import { Skill } from '../types';

const skills: Skill[] = [
  {
    title: "Wooden structures",
    description: "نحن لا نبيع أثاثًا، بل نوفر لك خط إنتاج متكامل للموديل الذي تختاره، جاهز للتقطيع والتجميع والتنفيذ بأعلى دقة وأقل وقت",
    icon: <Home size={40} />
  },
  
];

const Skills: React.FC = () => {
  return (
    <section id="skills" className="scroll-mt-28 py-20 bg-white dark:bg-dark-card transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            من نحن
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            متخصصون في الرسومات التنفيذية للآثاث CNC
          </p>
        </div>

        <div className="md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
            >
              
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;