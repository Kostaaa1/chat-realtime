import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { User as FirebaseUser } from "firebase/auth";
import SearchUser from "./SearchUser";
import { MdAdd } from "react-icons/md";
import Chats from "./Chats";
import useChatStore from "../store/useChatStore";
import { BiDotsHorizontalRounded } from "react-icons/bi";

type TSidebarProps = {
  setShowCreateGroupChat: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ setShowCreateGroupChat }: TSidebarProps) => {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState<string>("");
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const { user, setUser } = useUserStore();
  const { dispatch, setChats, setMessages, chats } = useChatStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const signOutUser = async () => {
    try {
      dispatch();
      setMessages(null);
      setUser(null);
      setChats([]);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const updateFirebaseDoc = async (
    collName: string,
    collId: string,
    combinedId: string,
    data: { uid: string; displayName: string | null; photoURL: string | null }
  ) => {
    const timestamp = serverTimestamp();

    await updateDoc(doc(db, collName, collId), {
      [combinedId + ".userInfo"]: data,
      [combinedId + ".lastMessage"]: {},
      [combinedId + ".date"]: timestamp,
    });
  };

  const handleSelect = async (id: string) => {
    const selectedUser = users.find((user) => user.uid === id);
    const isUserAdded = chats.find(
      (chat) => chat[1].userInfo.displayName === selectedUser?.displayName
    );
    if (isUserAdded) return;

    if (user && selectedUser) {
      const { uid: userUid } = user;
      const { uid: selectedUserUid } = selectedUser;

      const combinedId =
        userUid > selectedUserUid
          ? userUid + selectedUserUid
          : selectedUserUid + userUid;

      setUsers([]);
      setSearchUser("");

      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
      }

      await updateFirebaseDoc("userChats", selectedUserUid, combinedId, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      await updateFirebaseDoc("userChats", user.uid, combinedId, {
        uid: selectedUser.uid,
        displayName: selectedUser.displayName,
        photoURL: selectedUser.photoURL,
      });
    }
  };

  return (
    <div className="relative h-full bg-emerald-700 w-[580px] flex flex-col p-2 pt-0 justify-between">
      <div className="flex items-center justify-between h-[100px] px-2">
        <div className="flex items-center justify-center">
          {user?.photoURL && (
            <img
              className="w-[54px] h-[54px] border-2 object-cover mr-2 rounded-[50%]"
              src={user.photoURL}
              alt=""
            />
          )}
          <h1 className="text-md font-md text-2xl"> {user?.displayName} </h1>
        </div>
        <div
          ref={dropdownRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isOpen ? "bg-emerald-800" : ""
          } select-none w-[42px] h-[42px] rounded-[50%] flex items-center justify-center cursor-pointer`}
        >
          <BiDotsHorizontalRounded className="text-3xl rotate-90" />
          {isOpen && (
            <ul className="absolute right-4 top-[68px] bg-emerald-700 border-2 border-[#26A984] w-[160px] h-[100px] z-[10] flex flex-col justify-center">
              <li
                onClick={() => setShowCreateGroupChat(true)}
                className="cursor-pointer hover:bg-emerald-600 w-full p-2"
              >
                New chat group
              </li>
              <li
                onClick={signOutUser}
                className="cursor-pointer hover:bg-emerald-600 w-full p-2"
              >
                Log out
              </li>
            </ul>
          )}
        </div>
      </div>
      <SearchUser
        users={users}
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        setUsers={setUsers}
      />
      <div className="relative h-full bg-[#209869] overflow-auto hide-scroll">
        {users.length > 0 || searchUser !== "" ? (
          users.map((data) => (
            <div
              onClick={() => handleSelect(data.uid)}
              key={data.uid}
              className="w-full h-[70px] px-2 text-white bg-[#209869] cursor-pointer text-base placeholder-white focus:outline-none hover:bg-emerald-700 flex justify-between items-center border-2 border-x-0 border-t-0 border-b-2 border-emerald-700"
            >
              <div className="flex items-center justify-center">
                {data.photoURL && (
                  <img
                    className="w-[42px] h-[42px] rounded-[50%] object-cover"
                    src={data.photoURL}
                    alt="ayo"
                  />
                )}
                <div className="flex flex-col ml-[12px]">
                  <h1 className="text-[18px]">{data.displayName}</h1>
                </div>
              </div>
              <MdAdd className="scale-[0.8] cursor-pointer flex items-center justify-center text-3xl bg-emerald-500 p-[4px] rounded-[50%]" />
            </div>
          ))
        ) : (
          <Chats />
        )}
      </div>
      {/* <button
        className="absolute ml-2 bottom-2 left-2 flex items-center justify-center bg-emerald-700 w-[58px] h-[28px] text-sm hover:bg-[#1e8f67]"
        onClick={signOutUser}
      >
        logout
      </button> */}
    </div>
  );
};

export default Sidebar;
