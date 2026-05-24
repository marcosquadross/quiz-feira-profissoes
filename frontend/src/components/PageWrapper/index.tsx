import { AnimatePresence, motion } from "framer-motion";

export function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="page" // importante para forçar re-render na troca
                initial={{ opacity: 0, scale: 0.4, rotate: -10, y: 200 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 5, y: -100 }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 12,
                    duration: 0.6,
                    bounce: 0.5
                }}
                style={{
                    boxShadow: "0px 0px 40px rgba(255, 255, 255, 0.2)",
                    borderRadius: "20px",
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
