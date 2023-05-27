import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

export type TMessages = {
  date: { seconds: number; nanoseconds: number };
  timestamp: string;
  id: string;
  senderId: string;
  text?: string;
  photoURL?: string;
};

export type TChatUser = {
  displayName: string;
  photoURL: string;
  uid: string;
};

type ChatAction = {
  type: string;
  payload: TChatUser;
};

type TInitialState = {
  chatId: string;
  user: TChatUser;
};

type TChat = [
  string,
  {
    date: { seconds: number; nanoseconds: number };
    lastMessage: { msg: string };
    userInfo: { uid: string; displayName: string; photoURL: string };
  }
];

export type TChatsProps = {
  chats: TChat[];
  setChats: React.Dispatch<React.SetStateAction<TChat[]>>;
};

const INITIAL_STATE: TInitialState = {
  chatId: "",
  user: { displayName: "", photoURL: "", uid: "" },
};

const chatReducer = (action?: ChatAction, user?: FirebaseUser) => {
  switch (action?.type) {
    case "CHANGE_USER":
      return {
        user: action.payload,
        chatId:
          user?.uid && user.uid > action.payload.uid
            ? user?.uid + action.payload.uid
            : action.payload.uid + user?.uid,
      };
    default:
      return INITIAL_STATE;
  }
};

type TUseChatStore = {
  state: TInitialState;
  dispatch: (action?: ChatAction, user?: FirebaseUser) => void;
  messages: TMessages[] | null;
  setMessages: (msgs: TMessages[] | null) => void;
  chats: TChat[];
  setChats: (chats: TChat[]) => void;
  highlight: string;
  setHighlight: (id: string) => void;
  showDeleteChatModal: boolean;
  setShowDeleteChatModal: (bool: boolean) => void;
};

const useChatStore = create<TUseChatStore>((set) => ({
  state: INITIAL_STATE,
  dispatch: (action, user) =>
    set((state) => ({
      ...state,
      state: chatReducer(action, user),
    })),
  messages: null,
  setMessages: (msgs) =>
    set((state) => ({
      ...state,
      messages: msgs,
    })),
  chats: [],
  setChats: (chats) =>
    set((state) => ({
      ...state,
      chats,
    })),
  highlight: "",
  setHighlight: (chatId) =>
    set((state) => ({
      ...state,
      highlight: chatId,
    })),
  showDeleteChatModal: false,
  setShowDeleteChatModal: (bool) =>
    set((state) => ({
      ...state,
      showDeleteChatModal: bool,
    })),
}));

export default useChatStore;
