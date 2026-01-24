import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, X, User, Users, Building } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

const DemoModeToggle = ({ showBanner = true }) => {
  const { isDemoMode, demoAccountType, setDemoAccountType, toggleDemoMode, disableDemoMode } = useDemo();

  const accountTypes = [
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'business', label: 'Business', icon: Building }
  ];

  if (!showBanner && !isDemoMode) {
    return (
      <button
        onClick={toggleDemoMode}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        title="Enable Demo Mode"
      >
        <Beaker className="w-5 h-5" />
        <span className="text-sm font-medium">Demo</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isDemoMode && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                <span className="font-semibold">Demo Mode Active</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="text-sm opacity-80">View as:</span>
                <div className="flex bg-white/20 rounded-lg p-1">
                  {accountTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setDemoAccountType(type.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-all ${
                          demoAccountType === type.id
                            ? 'bg-white text-amber-600 font-medium'
                            : 'hover:bg-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm opacity-80 hidden md:inline">
                Using demo data - no real transactions
              </span>
              <button
                onClick={disableDemoMode}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Demo</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoModeToggle;
