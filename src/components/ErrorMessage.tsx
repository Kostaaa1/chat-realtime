import { MdOutlineError } from "react-icons/md";

type ErrorMessageType = {
  message: string | null;
};

const ErrorMessage = ({ message }: ErrorMessageType) => {
  return (
    <div className="animate-fade-in-down text-[#1c1c1c] text-[12px] py-1 transition-all duration-500 w-full transform opacity-100">
      <div className="bg-white flex items-center">
        <MdOutlineError className="text-3xl text-red-500 mr-1" />
        <p className="tracking-normal text-red-500">
          {message + ". Try again!"}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
