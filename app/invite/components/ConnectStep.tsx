import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import ConnectGif from "@/assets/figma/invite/connect.gif";
import TiktokIcon from "@/assets/figma/invite/tiktok-icon.svg";

type ConnectStepProps = {
  redirectUrl: string | null;
  onConnect: () => void;
  showQrModal: boolean;
  setShowQrModal: (show: boolean) => void;
  showGeoModal: boolean;
  setShowGeoModal: (show: boolean) => void;
};

export const ConnectStep: React.FC<ConnectStepProps> = ({
  redirectUrl,
  onConnect,
  showQrModal,
  setShowQrModal,
  showGeoModal,
  setShowGeoModal,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full h-full flex flex-col items-center flex-grow "
    >
      {/* Background Image (Shared between Preparing and Connect) */}
      <div className="pointer-events-none flex-1 w-full flex items-center justify-center absolute top-[45%] translate-y-[-50%] z-[0] px-[3.2rem]">
        <Image
          src={ConnectGif}
          alt="Connecting"
          className="object-contain w-[33.5rem] h-[33.5rem]"
        />
      </div>

      {!redirectUrl ? (
        /* PREPARING STATE UI */
        // <div className="w-full h-full flex flex-col items-center justify-center relative z-[1]">
        //   <p className="text-[1.8rem] font-bold text-white mt-[20rem] animate-pulse">
        //     Preparing your experience...
        //   </p>
        // </div>
        <></>
      ) : (
        /* CONNECT STATE UI */
        <div className="w-full h-full flex flex-col items-center justify-between flex-grow px-[3.2rem]">
          <h2 className="w-full text-[2.8rem] text-center leading-[1.2] pt-[5rem] relative z-[1] font-invite-title">
            Your data goes in.
            <br />
            <span className="text-[#FF5678]">Only insights </span>
            come out.
          </h2>

          <div className="relative z-[1]">
            <div className="w-full flex flex-col gap-8 pb-[2.4rem]">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <div className="w-[12px] h-[12px] rounded-full bg-[#FF5678] shrink-0" />
                <p className="text-[16px] leading-[1.2]">
                  We can&apos;t post, DM, or touch your account
                </p>
              </div>
              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <div className="w-[12px] h-[12px] rounded-full bg-[#651AE9] shrink-0" />
                <p className="text-[16px] leading-[1.2]">
                  AI processes your history data, then deletes it — no trace
                </p>
              </div>
              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <div className="w-[12px] h-[12px] rounded-full bg-[#22C083] shrink-0" />
                <p className="text-[16px] leading-[1.2]">
                  No human can see your data. Not even us
                </p>
              </div>
            </div>
            <button
              onClick={onConnect}
              className={`w-[33.4rem] h-[5.6rem] bg-white rounded-full flex items-center justify-center gap-[0.8rem] text-black font-bold text-[1.6rem] transition-colors mt-auto hover:bg-gray-100`}
            >
              <Image src={TiktokIcon} width={18} height={21} alt="TikTok" />
              Connect TikTok
            </button>
          </div>
        </div>
      )}

      {/* PC QR Code Modal */}
      <AnimatePresence>
        {showQrModal && redirectUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-black/50 hover:text-black transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-[2.4rem] font-bold text-black text-center leading-tight">
                Scan to Connect
              </h3>

              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={redirectUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-[1.6rem] text-center text-gray-600">
                Open your camera app to scan this code and connect your TikTok
                account.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Geo Warning Modal */}
      <AnimatePresence>
        {showGeoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => {}}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center gap-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>

              <h3 className="text-[2.4rem] font-bold text-black text-center leading-tight">
                Region Not Supported
              </h3>

              <p className="text-[1.6rem] text-center text-gray-600">
                Sorry, this experience is currently available only for users in
                the United States.
              </p>

              <button
                onClick={() => setShowGeoModal(false)}
                className="w-full h-[4.8rem] bg-black text-white rounded-full font-bold text-[1.6rem] mt-2"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
