import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useShareCard, ShareCardData } from "../hooks/useShareCard";

interface ShareCardPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: ShareCardData;
}

export function ShareCardPreview({ 
  isOpen, onClose, cardData 
}: ShareCardPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateCard } = useShareCard();

  useEffect(() => {
    if (isOpen && !imageUrl) {
      setIsGenerating(true);
      generateCard(cardData).then(url => {
        setImageUrl(url);
        setIsGenerating(false);
      });
    }
  }, [isOpen, imageUrl, cardData, generateCard]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `captains-call-over${cardData.over}.png`;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;
    try {
      const blob = await (await fetch(imageUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: just download
      handleDownload();
    }
  };

  const handleShareNative = async () => {
    if (!imageUrl || !navigator.share) return;
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], "captains-call.png", { type: "image/png" });
    await navigator.share({
      title: "Captain's Call — AI Cricket Tactics",
      text: `${cardData.headline} | Win Probability: ${cardData.winProbAfter}% #CaptainsCall #IPL`,
      files: [file]
    });
  };

  const tweetText = encodeURIComponent(
    `🏏 ${cardData.headline}\n\nWin Probability: ${cardData.winProbBefore}% → ${cardData.winProbAfter}%\n\n"${cardData.micDropQuote}"\n\n#CaptainsCall #IPL #GeminiAI`
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-lg w-full mx-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white text-4xl 
                         hover:text-gray-300 transition-colors"
            >×</button>

            {/* Card preview */}
            <div className="rounded-2xl overflow-hidden shadow-2xl"
                 style={{ boxShadow: "0 0 60px rgba(66,133,244,0.3)" }}>
              {isGenerating || !imageUrl ? (
                <div className="w-full aspect-square bg-gray-900 
                                flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 
                                  border-blue-500 border-t-transparent 
                                  animate-spin" />
                  <p className="text-white text-lg">Generating your card...</p>
                  <p className="text-gray-400 text-sm">Powered by HTML Canvas</p>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt="Captain's Call Share Card"
                  className="w-full aspect-square object-cover"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={!imageUrl}
                className="flex items-center justify-center gap-2 
                           py-3 px-4 rounded-xl font-bold text-white
                           transition-all active:scale-95 disabled:opacity-40 text-sm md:text-base"
                style={{ backgroundColor: "#4285F4" }}
              >
                ⬇️ Download PNG
              </button>

              {/* Copy Image */}
              <button
                onClick={handleCopyImage}
                disabled={!imageUrl}
                className="flex items-center justify-center gap-2 
                           py-3 px-4 rounded-xl font-bold text-white
                           transition-all active:scale-95 disabled:opacity-40 text-sm md:text-base"
                style={{ backgroundColor: copied ? "#00FF88" : "#1A1A2E",
                         border: "1px solid #333", color: copied ? "#000" : "#FFF" }}
              >
                {copied ? "✅ Copied!" : "📋 Copy Image"}
              </button>

              {/* Tweet */}
              <a
                href={`https://twitter.com/intent/tweet?text=${tweetText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 
                           py-3 px-4 rounded-xl font-bold text-white
                           transition-all active:scale-95 text-sm md:text-base"
                style={{ backgroundColor: "#000000",
                         border: "1px solid #333" }}
              >
                𝕏 Share on X
              </a>

              {/* Native Share (mobile) */}
              {navigator.share ? (
                <button
                  onClick={handleShareNative}
                  disabled={!imageUrl}
                  className="flex items-center justify-center gap-2 
                             py-3 px-4 rounded-xl font-bold text-white
                             transition-all active:scale-95 disabled:opacity-40 text-sm md:text-base"
                  style={{ backgroundColor: "#FF6B00" }}
                >
                  📤 Share
                </button>
              ) : (
                <a
                  href={`https://wa.me/?text=${tweetText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2
                             py-3 px-4 rounded-xl font-bold text-white
                             transition-all active:scale-95 text-sm md:text-base"
                  style={{ backgroundColor: "#25D366" }}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* WhatsApp (huge in India) - If native share exists, add WA to bottom row */}
            {navigator.share && (
              <a
                href={`https://wa.me/?text=${tweetText}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2
                           py-3 px-4 rounded-xl font-bold text-white
                           transition-all active:scale-95 text-sm md:text-base"
                style={{ backgroundColor: "#25D366" }}
              >
                💬 Share on WhatsApp
              </a>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ShareCardPreview;
