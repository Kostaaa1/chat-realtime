import { signInWithEmailAndPassword } from "firebase/auth";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import useUserStore from "../store/useUserStore";
import ErrorMessage from "../components/ErrorMessage";
import { z } from "zod";

const loginSchema = z.object({
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

type TLogin = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const { user, setUser } = useUserStore();
  const [focusedInput, setFocusedInput] = useState<string>("");
  const [formData, setFormData] = useState<TLogin>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      loginSchema.parse(formData);
      const res = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (res.user) {
        setUser(res.user);
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("The user with these credentials does not exist");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-[#1c1c1c] flex flex-col justify-evenly m-auto rounded-md w-[400px] min-h-[380px] bg-white bottom-2 py-3 p-7"
    >
      <h1 className="text-3xl font-bold tracking-tight pb-3">Login</h1>
      <div className="relative flex flex-col">
        <label
          className={`${
            focusedInput === "input2"
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          } font-bold left-[14px] top-[-12px] bg-gray-50 px-1 absolute transition-all duration-200 ease-in-out`}
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          onFocus={() => setFocusedInput("input2")}
          onBlur={() => setFocusedInput("")}
          value={formData?.email}
          onChange={handleChange}
          className={` bg-white px-[12px] ${
            focusedInput === "input2" ? "border-2" : "border"
          } border-[#1c1c1c] focus: outline-none h-[46px]`}
          placeholder="Email"
        />
      </div>
      <div className="relative flex flex-col">
        <label
          className={`${
            focusedInput === "input3"
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          } font-bold  absolute left-[14px] top-[-12px] bg-gray-50 px-1 transition-all duration-200 ease-in-out`}
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          onFocus={() => {
            setFocusedInput("input3"), setError("");
          }}
          onBlur={() => setFocusedInput("")}
          value={formData.password}
          onChange={handleChange}
          className={` bg-white px-[12px] ${
            focusedInput === "input3" ? "border-2" : "border"
          } border-[#1c1c1c] focus: outline-none h-[46px] `}
          placeholder="Password"
        />
        {error !== "" && <ErrorMessage message={error} />}
      </div>
      <input
        type="submit"
        className="w-[100%] bg-emerald-500  text-white font-bold rounded-sm h-[46px] cursor-pointer hover:bg-[#209869]"
      />
      <div className="flex justify-between items-center w-full">
        <span className="text-gray-600 text-sm">
          You do not have an account?
        </span>
        <Link
          className="text-[#209869] cursor-pointer hover:underline underline-offset-4"
          to={"/register"}
        >
          Sign Up
        </Link>
      </div>
    </form>
  );
};

export default Login;
