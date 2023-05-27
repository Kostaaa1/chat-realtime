import { useEffect } from "react";
import useUserStore from "../store/useUserStore";
import { db } from "../firebase";
import { BiTrash } from "react-icons/bi";
import useChatStore from "../store/useChatStore";
import { TChatUser } from "../store/useChatStore";
import { doc, onSnapshot } from "firebase/firestore";

const Chats = () => {
  const { user } = useUserStore();
  const {
    state,
    dispatch,
    chats,
    setChats,
    highlight,
    setShowDeleteChatModal,
    setHighlight,
  } = useChatStore();

  useEffect(() => {
    const getChats = () => {
      if (user) {
        const unsub = onSnapshot(doc(db, "userChats", user.uid), (doc) => {
          if (doc.exists()) {
            const chatsArr = Object.entries(doc.data());
            if (chatsArr.find((chat) => !chat[1].date)) return;
            setChats(
              chatsArr.sort((a, b) => b[1].date.seconds - a[1].date.seconds)
            );
          }
        });
        return () => {
          unsub();
        };
      }
    };
    user?.uid && getChats();
  }, [user]);

  const handleSelect = (selectedUser: TChatUser, id: string) => {
    if (state.user?.displayName === selectedUser.displayName) return;
    if (user) {
      dispatch({ type: "CHANGE_USER", payload: selectedUser }, user);
      setHighlight(id);
    }
  };

  return (
    <>
      {chats.map((chat) => (
        <div key={chat[0]} className="relative flex h-[80px]">
          <div
            onClick={() => handleSelect(chat[1].userInfo, chat[0])}
            className={`${
              highlight === chat[0] ? "bg-emerald-700" : ""
            } px-2 py-4 w-full flex items-center cursor-pointer hover:bg-emerald-700 border-2 border-x-0 border-t-0 border-b-emerald-700 overflow-hidden`}
          >
            <div className="flex w-full h-full">
              <img
                className="w-[42px] h-[42px] rounded-[50%] object-cover"
                src={chat[1].userInfo.photoURL}
                alt=""
              />
              <div className="flex flex-col items-start justify-between pl-[12px]">
                <h3 className="text-xl">{chat[1].userInfo.displayName}</h3>
                <p>
                  {chat[1].lastMessage.msg?.split("").length > 23
                    ? chat[1].lastMessage.msg.slice(0, 23) + "..."
                    : chat[1].lastMessage.msg}{" "}
                </p>
              </div>
            </div>
          </div>
          {highlight === chat[0] && (
            <button
              onClick={() => setShowDeleteChatModal(true)}
              className="absolute top-1/2 translate-y-[-50%] right-4 block bg-red-500 p-[6px] text-[18px] transform transition-all duration-300 hover:opacity-75 hover:-translate-y-3"
            >
              <BiTrash />
            </button>
          )}
        </div>
      ))}
    </>
  );
};

export default Chats;
