import { useContext, useRef, useState } from "react";

import PageContext from "./PageContext";
import Register from "./Register";

export default function SignIn() {
  const { setPage } = useContext(PageContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  function authenticate() {
  }

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] md:w-3/4 w-[98%] max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-2">
      <div className="w-full flex justify-center">
        <img src="logo.png" className="w-32 aspect-square" />
      </div>
      <h1 className="text-center text-white text-3xl font-bold">
        Sign in to UnRavel
      </h1>
      <form className="mt-8 flex flex-col gap-8" onSubmit={authenticate}>
        <label className="text-left font-light">
          Email
          <input
            onInput={(event) => setEmail(event.currentTarget.value)}
            type="email"
            placeholder="Enter your email"
            className="focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1"
            required
          >
          </input>
        </label>
        <label className="relative text-left font-light">
          Password
          <input
            ref={passwordInputRef}
            onInput={(event) => setPassword(event.currentTarget.value)}
            type="password"
            placeholder="Enter your password"
            className="focus:outline-none text-xl w-full h-14 p-5 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1 "
            required
          >
          </input>
          <i
            onClick={(event) => {
              if (!passwordInputRef.current) return;
              const inputType = passwordInputRef.current.type;
              if (inputType === "password") {
                passwordInputRef.current.type = "text";
                event.currentTarget.classList.remove("bi-eye");
                event.currentTarget.classList.add("bi-eye-slash");
              } else {
                passwordInputRef.current.type = "password";
                event.currentTarget.classList.add("bi-eye");
                event.currentTarget.classList.remove("bi-eye-slash");
              }
            }}
            className="bi bi-eye text-gray-500 text-2xl absolute right-5 top-10 cursor-pointer"
          />
        </label>
        <button
          type="submit"
          className="mx-auto transition-[width,font-size] w-full min-h-16 rounded sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2"
        >
          Sign in
          <i className="bi bi-box-arrow-in-right"></i>
        </button>
      </form>
      <h3 className="text-center mt-12">
        Don't have an account?{" "}
        <a
          onClick={() => setPage(<Register />)}
          href="#"
          className="text-blue-500"
        >
          Register
        </a>
      </h3>
    </div>
  );
}
