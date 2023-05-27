import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { MdClose } from "react-icons/md";
import { ChangeEvent, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import useUserStore from "../store/useUserStore";
import { AiOutlineSearch } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";

type TSearchUserProps = {
  searchUser: string;
  users: FirebaseUser[];
  setSearchUser: React.Dispatch<React.SetStateAction<string>>;
  setUsers: React.Dispatch<React.SetStateAction<FirebaseUser[]>>;
};

const SearchUser = ({
  searchUser,
  setSearchUser,
  setUsers,
  users,
}: TSearchUserProps) => {
  const { user } = useUserStore();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchUser(text);

    if (text.length === 0) {
      setUsers([]);
      return;
    }

    const q = query(
      collection(db, "users"),
      where("lowerCase_name", ">=", text.toLowerCase()),
      where("lowerCase_name", "<=", text.toLowerCase() + "\uf8ff"),
      where("lowerCase_name", "!=", user?.displayName?.toLowerCase()),
      limit(10)
    );

    onSnapshot(q, (snapshot) => {
      const usersArr: FirebaseUser[] = [];
      snapshot.docs.forEach((doc) => {
        usersArr.push(doc.data() as FirebaseUser);
      });
      setUsers(usersArr);
    });
  };

  return (
    <div className="relative w-full h-[60px] bg-[#209869] z-[5] outline outline-2 outline-emerald-700">
      <input
        className="w-full h-full px-10 text-white text-base bg-inherit placeholder-white focus:outline-none"
        type="text"
        onChange={(e) => handleSearch(e)}
        value={searchUser}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Find a user"
      />
      {isFocused && (
        <BiArrowBack
          className={`absolute top-1/2 left-2 text-xl mt-[-10px] icon`}
        />
      )}
      {!isFocused && (
        <AiOutlineSearch className="absolute top-1/2 left-2 mt-[-10px] -translate-y-1/2 text-xl icon-search" />
      )}
      {users && searchUser !== "" && (
        <MdClose
          onClick={() => {
            setSearchUser("");
            setUsers([]);
          }}
          className="absolute scale-[0.8] cursor-pointer flex items-center justify-center translate-y-[-50%] top-1/2 right-2 text-3xl bg-red-800 p-[4px] rounded-[50%]"
        />
      )}
    </div>
  );
};

export default SearchUser;
