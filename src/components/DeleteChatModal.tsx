import { motion } from "framer-motion"
import { MdClose } from "react-icons/md"
import useChatStore from "../store/useChatStore"
import { deleteObject, ref } from "firebase/storage"
import { db, storage } from "../firebase"
import { deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore"
import useUserStore from "../store/useUserStore"

const DeleteChatModal = () => {
  const { user } = useUserStore()
  const { state, setMessages, messages, setShowDeleteChatModal, dispatch } =
    useChatStore()

  const removeUserFromChat = async () => {
    try {
      dispatch()
      const filteredUrl = messages?.filter(data => data.photoURL)

      if (filteredUrl && filteredUrl.length > 0) {
        filteredUrl
          ?.map(data => data.photoURL)
          ?.forEach(fileRef => {
            const storageRef = ref(storage, fileRef)
            deleteObject(storageRef)
              .then(() => {
                console.log(`${fileRef} Deleted!`)
              })
              .catch(err => console.log(err))
          })
      }

      setMessages(null)
      setShowDeleteChatModal(false)

      if (user) {
        await updateDoc(doc(db, "userChats", user.uid), {
          [state.chatId as string]: deleteField()
        })

        await updateDoc(doc(db, "userChats", state.user.uid), {
          [state.chatId as string]: deleteField()
        })

        await deleteDoc(doc(db, "chats", state.chatId as string))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="fixed flex h-screen w-full bg-[rgba(0,0,0,0.5)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        className="absolute top-1/2 right-1/2 translate-x-[50%] -translate-y-1/2 h-[200px] w-[320px] bg-white text-[#1c1c1c]"
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <span className="text-center font-bold tracking-wide">
            Are you sure you want to delete the conversation with this person?
          </span>
          <div className="flex w-full justify-around px-8 pt-6">
            <button
              onClick={removeUserFromChat}
              className="w-[86px] h-[44px] font-bold border-2 bg-[#209869] text-white border-[#209869] active:"
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteChatModal(false)}
              className="w-[86px] h-[44px] font-bold border-2 text-[#209869] border-[#209869] hover:bg-[#209869] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
        <MdClose
          onClick={() => setShowDeleteChatModal(false)}
          className="absolute top-1 right-1 text-white scale-[0.8] cursor-pointer flex items-center justify-center text-3xl bg-red-800 p-[4px] rounded-[50%]"
        />
      </motion.div>
    </div>
  )
}

export default DeleteChatModal
