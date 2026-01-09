import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { IdeaWithCreator } from '@hackr/shared';

interface SwipeableStackProps {
  ideas: IdeaWithCreator[];
  onSwipe: (idea: IdeaWithCreator, interested: boolean) => void;
}

export function SwipeableStack({ ideas, onSwipe }: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (interested: boolean) => {
    if (currentIndex >= ideas.length) return;
    onSwipe(ideas[currentIndex], interested);
    setCurrentIndex((i) => i + 1);
  };

  if (currentIndex >= ideas.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">All done!</h3>
        <p className="text-gray-600">You've seen all the ideas. Check back later for more!</p>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full max-w-md mx-auto">
      {/* Stack of cards (show next 2 behind current) */}
      {ideas.slice(currentIndex, currentIndex + 3).map((idea, i) => (
        <SwipeCard
          key={idea.id}
          idea={idea}
          isTop={i === 0}
          stackIndex={i}
          onSwipe={handleSwipe}
        />
      ))}

      {/* Manual swipe buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 pb-4">
        <button
          onClick={() => handleSwipe(false)}
          className="w-16 h-16 rounded-full bg-danger-100 text-danger-600 hover:bg-danger-200 flex items-center justify-center text-3xl shadow-lg"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe(true)}
          className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 flex items-center justify-center text-3xl shadow-lg"
        >
          ♥
        </button>
      </div>
    </div>
  );
}

interface SwipeCardProps {
  idea: IdeaWithCreator;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (interested: boolean) => void;
}

function SwipeCard({ idea, isTop, stackIndex, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Color overlays based on swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0);
    }
  };

  const roleNeeds = [
    { label: 'Frontend', count: idea.needs_frontend },
    { label: 'Backend', count: idea.needs_backend },
    { label: 'Infra', count: idea.needs_infrastructure },
    { label: 'ML', count: idea.needs_ml },
  ].filter((r) => r.count > 0);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale: 1 - stackIndex * 0.05,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="card h-full flex flex-col cursor-grab active:cursor-grabbing">
        {/* Like/Nope overlays */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-6 right-6 px-4 py-2 border-4 border-primary-500 text-primary-500 font-bold text-2xl rounded-lg rotate-12"
              style={{ opacity: likeOpacity }}
            >
              LIKE
            </motion.div>
            <motion.div
              className="absolute top-6 left-6 px-4 py-2 border-4 border-danger-500 text-danger-500 font-bold text-2xl rounded-lg -rotate-12"
              style={{ opacity: nopeOpacity }}
            >
              NOPE
            </motion.div>
          </>
        )}

        <h2 className="text-2xl font-bold mb-4">{idea.title}</h2>

        <p className="text-gray-700 flex-grow">{idea.description}</p>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Looking for:</p>
          <div className="flex flex-wrap gap-2">
            {roleNeeds.map((role) => (
              <span
                key={role.label}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {role.count}× {role.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
