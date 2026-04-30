import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface SimpleSplashScreenProps {
    onFinish: () => void;
}

export default function SimpleSplashScreen({ onFinish }: SimpleSplashScreenProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3000); // 3 seconds total display time
        return () => clearTimeout(timer);
    }, [onFinish]);

    const text = "Zaban Fly";

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center z-50">
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8 relative"
            >
                <img src="/icon.svg" alt="Logo" className="w-32 h-32 relative z-10" />
            </motion.div>

            {/* Text Animation: Clean Staggered Reveal */}
            <div className="flex relative h-12 items-center justify-center" dir="ltr">
                {text.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{
                            y: 20,
                            opacity: 0,
                        }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 100,
                            delay: 0.3 + (index * 0.1)
                        }}
                        className="text-4xl font-extrabold text-amber-500 font-sans mx-[1px]"
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-10 text-xs text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase"
            >
                Powered by Zaban Fly Team
            </motion.div>
        </div>
    );
}
