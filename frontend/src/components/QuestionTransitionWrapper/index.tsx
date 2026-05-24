import { motion, AnimatePresence } from "framer-motion";

interface Props {
  children: React.ReactNode;
  id: string | number;
}

export const QuestionTransitionWrapper = ({ children, id }: Props) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        style={{
        //   display: "flex",
        //   flexDirection: "row",
        //   justifyContent: "space-between",
          width: "100%",
        //   padding: "0 20px",
        //   boxSizing: "border-box",
        //   position: "relative",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
