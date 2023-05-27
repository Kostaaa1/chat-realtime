import { motion } from "framer-motion";
import React, { useRef, useEffect } from "react";
import { MdClose } from "react-icons/md";

type TModal = {
  imageUrl: string;
  showImageModal: boolean;
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  setShowImageModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const FullsizeImageModal: React.FC<TModal> = ({
  imageUrl,
  setShowImageModal,
  setImageUrl,
}) => {
  const modalRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const closeModal = (e: MouseEvent | KeyboardEvent) => {
      console.log(e.target);
      if (
        e instanceof MouseEvent &&
        e.target instanceof Node &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setImageUrl("");
      } else if (e instanceof KeyboardEvent && e.key === "Escape") {
        setImageUrl("");
      }
    };

    document.addEventListener("keydown", closeModal);
    document.addEventListener("mousedown", closeModal);
    return () => {
      document.removeEventListener("keydown", closeModal);
      document.removeEventListener("mousedown", closeModal);
    };
  }, []);

  return (
    <div className="fixed flex h-screen w-full bg-[rgba(0,0,0,0.5)] z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        className="absolute top-1/2 right-1/2 translate-x-[50%] -translate-y-1/2 bg-white text-[#1c1c1c]"
      >
        <img
          ref={modalRef}
          className="relative w-full h-[740px]"
          src={imageUrl}
          alt="image-modal"
        />
        <MdClose
          onClick={() => {
            setImageUrl(""), setShowImageModal(false);
          }}
          className="absolute cursor-pointer text-gray-200 top-1 right-1 text-4xl"
        />
      </motion.div>
    </div>
  );
};

export default FullsizeImageModal;
