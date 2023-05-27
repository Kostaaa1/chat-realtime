import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

type IUserStore = {
  user: FirebaseUser | null;
  setUser: (data: FirebaseUser | null) => void;
  isFetching: boolean;
  setIsFetching: (bool: boolean) => void;
};

const useUserStore = create<IUserStore>((set) => {
  return {
    user: null,
    setUser: (user) => set((state) => ({ ...state, user: user })),
    isFetching: false,
    setIsFetching: (bool) => set((state) => ({ ...state, isFetching: bool })),
  };
});

export default useUserStore;
