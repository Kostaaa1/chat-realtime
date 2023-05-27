import { AiOutlineSend } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import useUserStore from "../store/useUserStore";
import useChatStore from "../store/useChatStore";
import { TMessages } from "../store/useChatStore";
import { MdAttachFile } from "react-icons/md";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Timestamp,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

type ChatProp = {
  onClick: () => void;
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  setShowImageModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const Chat: React.FC<ChatProp> = ({
  setImageUrl,
  onClick,
  setShowImageModal,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { state, messages, setMessages } = useChatStore();
  const [text, setText] = useState("");
  const { user } = useUserStore();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (state.chatId) {
      const unsub = onSnapshot(doc(db, "chats", state.chatId), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as { messages: TMessages[] };

          setMessages(
            data.messages.sort((a, b) => b.date.seconds - a.date.seconds)
          );
        }
      });

      return () => {
        unsub();
      };
    }
  }, [state]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const fileData = e.target.files?.[0];
    if (fileData) setFile(fileData);
  };

  const sendMessage = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (user) {
        if (text === "" && !file) return;
        const msg = text;
        setText("");

        const date = new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const format = (n: number) => n.toString().padStart(2, "0");

        const timestamp = `${format(hours)}:${format(minutes)}`;

        if (file) {
          const storageRef = ref(storage, state.chatId + date.getTime());

          uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then(async (url) => {
              try {
                await updateDoc(doc(db, "chats", state.chatId), {
                  messages: arrayUnion({
                    id: uuid(),
                    photoURL: url,
                    senderId: user.uid,
                    date: Timestamp.now(),
                    timestamp,
                  }),
                });
                setFile(null);
              } catch (err) {
                console.log(err);
              }
            });
          });
        }

        if (msg !== "") {
          await updateDoc(doc(db, "chats", state.chatId), {
            messages: arrayUnion({
              id: uuid(),
              text: msg,
              senderId: user.uid,
              date: Timestamp.now(),
              timestamp,
            }),
          });

          await updateDoc(doc(db, "userChats", state.user.uid), {
            [state.chatId + ".lastMessage"]: {
              msg,
            },
            [state.chatId + ".date"]: serverTimestamp(),
          });

          await updateDoc(doc(db, "userChats", user.uid), {
            [state.chatId + ".lastMessage"]: {
              msg,
            },
            [state.chatId + ".date"]: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="relative w-full flex flex-col bg-[#cbcbcc]">
        {state.chatId !== "" ? (
          <>
            <div className="flex items-center justify-between px-4 h-[100px] bg-[#209869]">
              <>
                <div className="flex justify-center items-center">
                  <img
                    className="w-[42px] h-[42px] rounded-[50%] object-cover"
                    src={state.user.photoURL}
                    alt=""
                  />
                  <h1 className="text-2xl font-md pl-3">
                    {state.user?.displayName}
                  </h1>
                </div>
                <BiDotsHorizontalRounded
                  onClick={onClick}
                  className="text-3xl cursor-pointer"
                />
              </>
            </div>
            <div
              ref={scrollRef}
              className="h-full flex px-4 flex-col-reverse text-[#1c1c1c] overflow-y-auto"
            >
              {messages && (
                <>
                  {messages?.map((message) =>
                    message?.senderId === user?.uid ? (
                      <div
                        key={message.id}
                        className="flex mt-2 w-full h-max justify-end"
                      >
                        {message.text && (
                          <span className="relative w-max max-w-[250px] break-words text-[20px] py-1 px-4 pr-12 bg-[#1e8d63] text-white rounded-l-[10px] rounded-br-[10px]">
                            {message.text}
                            <span className="absolute bottom-1 right-2 text-xs text-slate-200">
                              {message.timestamp}
                            </span>
                          </span>
                        )}
                        {message.photoURL && (
                          <img
                            onClick={() => {
                              setImageUrl(message.photoURL),
                                setShowImageModal(true);
                            }}
                            className="block w-[280px] h-[240px] cursor-pointer bg-none"
                            src={message.photoURL}
                            alt="img-message"
                          />
                        )}
                      </div>
                    ) : (
                      <div
                        key={message.id}
                        className="flex mt-2 w-full h-max justify-start"
                      >
                        {message.text && (
                          <span className="relative w-max max-w-[250px] break-words text-[20px] py-1 px-4 pl-12 bg-[#9fa6b5] text-white rounded-bl-[10px] rounded-r-[10px]">
                            <span className="absolute bottom-1 left-2 text-xs text-slate-200">
                              {message.timestamp}
                            </span>
                            {message.text}
                          </span>
                        )}
                        {message.photoURL && (
                          <img
                            onClick={() => {
                              setImageUrl(message.photoURL),
                                setShowImageModal(true);
                            }}
                            className="block w-[280px] h-[240px] cursor-pointer bg-none"
                            src={message.photoURL}
                            alt="img-message"
                          />
                        )}
                      </div>
                    )
                  )}
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-2xl font-medium">
                      <h1>No messages. Say Hi to {state.user.displayName}! </h1>
                    </div>
                  )}
                </>
              )}
            </div>
            <form onSubmit={sendMessage} className="relative mt-2">
              <input
                className="h-[50px] w-full px-2 text-[#1c1c1c] bg-white text-lg focus:outline-none"
                type="text"
                disabled={state.user.displayName === ""}
                placeholder="Type Something..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex items-center justify-center absolute right-[10px] top-1/2 translate-y-[-50%]">
                <div>
                  <input
                    name="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFile}
                    className="hidden"
                    type="file"
                    id="file"
                  />
                  <label
                    className="flex items-center cursor-pointer w-max"
                    htmlFor="file"
                  >
                    <MdAttachFile className="text-[#73767e] text-[26px]" />
                  </label>
                </div>
                <button className="h-[40px] w-[40px] flex items-center justify-center bg-[#209869] ">
                  <AiOutlineSend />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full w-full bg-[#d9dadb] flex items-center justify-center text-center">
            <h1 className="text-3xl tracking-wide text-[#b9babe]">
              Find a Chat to start a conversation!
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
