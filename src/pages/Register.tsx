import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import img from "../assets/addAvatar.png";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z
    .string()
    .min(8, { message: "Passwords must contain at least 8 letters" })
    .max(26, { message: "Passwords can not be more then 26 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        "Passwords must contain:\n At least one lowercase letter,\n At least one digit,\n At least one uppercase letter.",
    }),
});
type TForm = z.infer<typeof RegisterSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState<string>("");
  const [creatingUser, setCreatingUser] = useState<boolean>(false);
  const [fileLoading, setFileloading] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<TForm>({
    name: "",
    email: "",
    password: "",
  });

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const fileData = e.target.files?.[0];
    if (fileData) setFile(fileData);

    setFileloading(true);
    setTimeout(() => {
      setFileloading(false);
    }, Math.random() * 1500);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const date = new Date().getTime();
      const storageRef = ref(storage, `${formData.name + date}`);

      if (file) {
        uploadBytes(storageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then(async (url) => {
            try {
              await updateProfile(res.user, {
                displayName: formData.name,
                photoURL: url,
              });

              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName: formData.name,
                lowerCase_name: formData.name.toLowerCase(),
                email: formData.email,
                photoURL: url,
              });

              await setDoc(doc(db, "userChats", res.user.uid), {});
              setCreatingUser(true);
              navigate("/");
            } catch (err) {
              setError("error");
            }
          });
        });
      }
    } catch (error) {
      console.log("Type error", error);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="text-[#1c1c1c] flex flex-col justify-evenly m-auto rounded-md w-[400px] min-h-[450px] bg-gray-50 bottom-2 py-3 p-7"
    >
      <h1 className="text-3xl font-bold tracking-tight pb-3">Register</h1>
      <div className="relative flex flex-col">
        <label
          className={`${
            isFocused === "input1"
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          } font-bold  absolute left-[14px] top-[-12px] bg-gray-50 px-1 transition-all duration-200 ease-in-out`}
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          required
          onFocus={() => setIsFocused("input1")}
          onBlur={() => setIsFocused("")}
          value={formData.name}
          onChange={handleChange}
          className={`bg-white px-[12px] ${
            isFocused === "input1" ? "border-2" : "border"
          } border-[#1c1c1c] focus: outline-none h-[46px]`}
          placeholder="Name"
        />
      </div>
      <div className="relative flex flex-col">
        <label
          className={`${
            isFocused === "input2"
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          } font-bold  absolute left-[14px] top-[-12px] bg-gray-50 px-1 transition-all duration-200 ease-in-out`}
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          onFocus={() => setIsFocused("input2")}
          onBlur={() => setIsFocused("")}
          value={formData.email}
          onChange={handleChange}
          className={` bg-white px-[12px] ${
            isFocused === "input2" ? "border-2" : "border"
          } border-[#1c1c1c] focus: outline-none h-[46px]`}
          placeholder="Email"
        />
      </div>
      <div className="relative flex flex-col">
        <label
          className={`${
            isFocused === "input3"
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          } font-bold  absolute left-[14px] top-[-12px] bg-gray-50 px-1 transition-all duration-200 ease-in-out`}
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          onFocus={() => {
            setIsFocused("input3");
            setError("");
          }}
          onBlur={() => setIsFocused("")}
          value={formData.password}
          onChange={handleChange}
          className={` bg-white px-[12px] ${
            isFocused === "input3" ? "border-2" : "border"
          } border-[#1c1c1c] focus: outline-none h-[46px]`}
          placeholder="Password"
        />
        {error !== "" && <ErrorMessage message={error} />}
      </div>
      <div className="relative h-[40px] flex justify-start">
        {fileLoading && (
          <div className="loading-wrapper">
            <div className="loading"></div>
          </div>
        )}
        {fileLoading === null && (
          <div>
            <input
              required
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
              <img src={img} className="w-[40px] h-[40px]" alt="avatar" />
              <span className="text-sm ml-2 text-gray-400 font-bold">
                Add an avatar
              </span>
            </label>
          </div>
        )}
        {!fileLoading && file && (
          <p className="text-sm text-gray-400 font-bold">Avatar is ready</p>
        )}
      </div>
      {creatingUser ? (
        <button className="w-full bg-emerald-200 text-white flex justify-center items-center font-bold rounded-sm h-[46px] cursor-pointer">
          <div className="loading-wrapper scale-[0.7]">
            <div className="loading"></div>
          </div>
        </button>
      ) : (
        <input
          type="submit"
          className="w-full bg-emerald-500 hover:bg-[#209869] cursor-pointer active:bg-emerald-700 rounded-lg h-[46px] text-white font-medium transition-colors duration-200 ease-in-out"
        />
      )}
      <div className="flex justify-between w-full">
        <span className="text-gray-600">Already have an account?</span>
        <Link
          className="text-[#209869] cursor-pointer hover:underline underline-offset-4"
          to={"/login"}
        >
          Log in
        </Link>
      </div>
    </form>
  );
};

export default Register;
