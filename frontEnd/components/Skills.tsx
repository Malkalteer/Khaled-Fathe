import React from 'react';
import { PenTool, Layout, Palette, Home } from 'lucide-react';
import { Skill } from '../types';

const skills: Skill[] = [
  {
    title: "تصميم الزخارف",
    description: "فن دمج التفاصيل الهندسية والجمالية لإضفاء قيمة فنية فريدة على قطع الأثاث، تجمع بين الأصالة والحداثة",
    icon: <Home size={40} />
  },
  {
    title:"تصميم الباروميتريك ",
    description: "نصمم لك أثاثاً يتجاوز المألوف، يعتمد على تكرار الشرائح الهندسية والمنحنيات العضوية ليعطيك قطعاً فريدة تجمع بين الفن والتكنولوجيا",
    icon: <Palette size={40} />
  },
  {
    title: "كل ما يخص الcnc",
    description: "نحول الخيال إلى واقع ملموس عبر برمجة مسارات حركة دقيقة لماكينات CNC، مما يضمن تحويل أعقد الرسوم الهندسية إلى قطع أثاث منفذة بدقة متناهية",
    icon: <Layout size={40} />
  },
  {
    title:"برمجة cnc 3x,4x ",
    description: "نحترف برمجة محاور CNC المتعددة (3X & 4X) لإنتاج قطع أثاث معقدة، من الزخارف المسطحة الدقيقة إلى النحت الدوراني للأجسام والمنحنيات الانسيابية",
    icon: <PenTool size={40} />
  }
];

const Skills: React.FC = () => {
  return (
    <section id="skills" className="scroll-mt-28 py-20 bg-white dark:bg-dark-card transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            مهاراتي المميزة
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            نقدم مجموعة متكاملة من الخدمات لضمان تحويل رؤيتك إلى واقع ملموس بأعلى معايير الجودة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div 
              key={index} 
              className="group bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                {skill.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {skill.title}
              </h3>
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