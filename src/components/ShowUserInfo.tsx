import { MdClose } from "react-icons/md";
import useChatStore from "../store/useChatStore";
import { motion } from "framer-motion";
import React, { useEffect } from "react";

type ChatProp = {
  onClick: () => void;
};

const ShowUserInfo: React.FC<ChatProp> = ({ onClick }) => {
  const { state } = useChatStore();

  useEffect(() => {
    const closeModal = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClick();
      }
    };
    document.addEventListener("keydown", closeModal);

    return () => {
      document.removeEventListener("keydown", closeModal);
    };
  });

  return (
    <div className="fixed h-screen w-full bg-[rgba(0,0,0,0.5)] z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        className="absolute top-1/2 right-1/2 translate-x-[50%] -translate-y-1/2 h-[300px] w-[360px] bg-white text-[#1c1c1c] flex items-center justify-evenly flex-col"
      >
        <>
          <h1 className=" text-3xl font-bold">{state.user.displayName}😁</h1>
          <img
            className="w-[110px] h-[110px] rounded-[50%]"
            src={state.user.photoURL}
            alt=""
          />
          <h3>
            {" "}
            <span className="font-semibold pr-1">User ID:</span>{" "}
            {state.user.uid}{" "}
          </h3>
        </>
        <MdClose
          onClick={onClick}
          className="absolute top-1 right-1 text-white scale-[0.8] cursor-pointer flex items-center justify-center text-3xl bg-red-800 p-[4px] rounded-[50%]"
        />
      </motion.div>
    </div>
  );
};

export default ShowUserInfo;
