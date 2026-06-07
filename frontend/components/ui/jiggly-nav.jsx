"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function JigglyNav() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const rings = [
    { label: "play", size: 640, fill: "#e5e5e5", textColor: "#000000", href: "/play" },
    { label: "replays", size: 540, fill: "#171717", textColor: "#ffffff", href: "/replays" },
    { label: "features", size: 440, fill: "#e5e5e5", textColor: "#000000", href: "#features" },
    { label: "about", size: 340, fill: "#171717", textColor: "#ffffff", href: "#about" },
    { label: "home", size: 240, fill: "#e5e5e5", textColor: "#000000", href: "/" },
  ]

  const handleClick = (ring) => {
    setIsOpen(false)
    if (ring.href.startsWith("#")) {
      const el = document.querySelector(ring.href)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    } else {
      router.push(ring.href)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="open-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl overflow-hidden z-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border-[5px] border-black" />
              <div className="absolute w-3/4 h-3/4 rounded-full border-[5px] border-black" />
              <div className="absolute w-1/2 h-1/2 rounded-full border-[4px] border-black" />
              <div className="absolute w-1/4 h-1/4 rounded-full bg-black" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <div className="relative pointer-events-auto">
                {rings.map((ring, index) => (
                  <motion.button
                    key={ring.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200 + index * 20,
                      damping: 12 + index,
                      delay: 0.05 + index * 0.06,
                    }}
                    whileHover={{
                      scale: 1.03,
                      transition: { type: "spring", stiffness: 400, damping: 10 },
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleClick(ring)}
                    className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-start justify-center cursor-pointer"
                    style={{
                      width: `${ring.size}px`,
                      height: `${ring.size}px`,
                      backgroundColor: ring.fill,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15 + index * 0.06,
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                      className="font-bold text-xl absolute"
                      style={{ top: "12px", color: ring.textColor }}
                    >
                      {ring.label}
                    </motion.span>
                  </motion.button>
                ))}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 14,
                    delay: 0.35,
                  }}
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full bg-neutral-900"
                />

                <motion.button
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                    delay: 0.45,
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 90,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsOpen(false)}
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full flex items-center justify-center text-white z-10"
                >
                  <X size={56} strokeWidth={3} />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
