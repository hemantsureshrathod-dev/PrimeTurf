import React from 'react';
import { Megaphone } from 'lucide-react';

const BroadcastBanner = ({ text }) => {
  if (!text) return null;

  return (
    <div className="bg-[#FFFDEB] text-[#5C4D1C] border-b border-[#F5E8C4] py-2.5 px-4 text-xs font-outfit transition-all duration-300 dark:bg-[#1C1A12] dark:text-[#E6D69E] dark:border-[#383321]">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Megaphone className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
        <span className="font-medium tracking-wide uppercase text-[10px] bg-[#EBE0C2] dark:bg-[#2C2719] px-1.5 py-0.5 mr-1 flex-shrink-0">
          Broadcast
        </span>
        <span className="font-normal">{text}</span>
      </div>
    </div>
  );
};

export default BroadcastBanner;
