import { motion } from "framer-motion";
import childrenLeft from "@/assets/children-illustration-left.png";
import childrenRight from "@/assets/children-illustration-right.png";

interface IllustrationWrapperProps {
  children: React.ReactNode;
  showLeft?: boolean;
  showRight?: boolean;
}

export function IllustrationWrapper({
  children,
  showLeft = true,
  showRight = true,
}: IllustrationWrapperProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ilustração lateral esquerda */}
      {showLeft && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.35, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="fixed left-0 bottom-0 w-64 lg:w-80 xl:w-96 pointer-events-none z-0"
          style={{ transform: "scaleX(-1)" }}
        >
          <img
            src={childrenLeft}
            alt=""
            className="w-full h-auto object-contain"
            aria-hidden="true"
          />
        </motion.div>
      )}

      {/* Ilustração lateral direita */}
      {showRight && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.35, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed right-0 bottom-0 w-64 lg:w-80 xl:w-96 pointer-events-none z-0"
        >
          <img
            src={childrenRight}
            alt=""
            className="w-full h-auto object-contain"
            aria-hidden="true"
          />
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
