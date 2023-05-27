import useUserStore from "../store/useUserStore";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { useState } from "react";
import ShowUserInfo from "../components/ShowUserInfo";
import DeleteChatModal from "../components/DeleteChatModal";
import useChatStore from "../store/useChatStore";
import FullsizeImageModal from "../components/FullsizeImageModal";

const Home = () => {
  const { user } = useUserStore();
  const { showDeleteChatModal } = useChatStore();
  const [showUserInfoModal, setShowUserInfoModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>("");
  const [showCreateGroupChat, setShowCreateGroupChat] =
    useState<boolean>(false);

  return (
    <>
      {user && (
        <div className="relative text-white m-auto w-[1250px] h-[760px] max-w-full flex tracking-normal">
          <Sidebar setShowCreateGroupChat={setShowCreateGroupChat} />
          <Chat
            setShowImageModal={setShowImageModal}
            setImageUrl={setImageUrl}
            onClick={() => setShowUserInfoModal(true)}
          />
        </div>
      )}
      {imageUrl && (
        <FullsizeImageModal
          showImageModal={showImageModal}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          setShowImageModal={setShowImageModal}
        />
      )}
      {showDeleteChatModal && <DeleteChatModal />}
      {showUserInfoModal && (
        <ShowUserInfo onClick={() => setShowUserInfoModal(false)} />
      )}
    </>
  );
};

export default Home;
