import { type FormEvent, useContext, useRef, useState } from "react";

import PageContext from "./PageContext";
import Register from "./Register";
import MainMenu from "./MainMenu";
import Room from "./Room";
import Game from "./Game";

import { socket } from "./socket";
import { signIn as apiSignIn } from "./api/auth";
import { roomGet, roomGetType, roomJoin } from "./api/room";
import { gameGetState } from "./api/game";
import GameOver from "./GameOver";

export default function SignIn() {
  const { setPage } = useContext(PageContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disableSignInBtn, setDisableSignInBtn] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  async function reconnect() {
    try {
      console.log("Attempting Reconnection");

      const roomCode = await roomGet();

      if (!socket.id || !roomCode) return false;

      await roomJoin(socket.id, roomCode);

      const gameState = await gameGetState(roomCode);
      const roomType = await roomGetType(roomCode);

      if (!gameState || !roomType) return false;

      if (gameState === "idle") {
        if (roomType === "ranked") {
          setPage(<GameOver roomCode={roomCode} />);
        } else {
          setPage(<Room roomCode={roomCode} />);
        }
      } else {
        setPage(<Game roomCode={roomCode} />);
      }

      return true;
    } catch (error) {
      console.error(error);
      console.error("could not reconnect");

      return false;
    }
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();

    setDisableSignInBtn(true); // Prevent button spamming

    // Go to main menu page after successful sign in and reconnect fails
    if (await apiSignIn(email, password)) {
      if (!(await reconnect())) {
        setPage(<MainMenu />);
      }
    } else {
      setDisableSignInBtn(false);
    }
  }

  return (
    <div className="absolute transition-[height,width] lg:h-[90%] h-[98%] md:w-3/4 w-[98%] max-w-xl bg-[#000625] bg-opacity-50 rounded-xl border border-neutral-500 flex flex-col text-white overflow-y-scroll p-10 gap-2">
      <div className="w-full flex justify-center">
        <img src="logo.png" className="w-32 aspect-square" />
      </div>
      <h1 className="text-center text-white text-3xl font-bold">
        Sign In to UnRavel
      </h1>
      <form
        className="mt-8 flex flex-col gap-8"
        onSubmit={signIn}
      >
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
            className="focus:outline-none text-xl w-full h-14 p-5 pr-16 bg-[#343434] placeholder:text-[#787878] rounded-lg border border-[#787878] mt-1 "
            pattern=".{8,100}"
            title="8 to 100 characters"
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
          className="mx-auto transition-[width,font-size] w-full min-h-16 rounded sm:text-2xl text-xl font-light bg-gradient-to-r from-[#AC1C1C] to-[#003089] flex items-center justify-center gap-2 disabled:brightness-50"
          disabled={disableSignInBtn}
        >
          Sign In
          <i className="bi bi-box-arrow-in-right"></i>
        </button>
      </form>
      <h3 className="text-center mt-12">
        Don't have an account?{" "}
        <a
          onClick={() => setPage(<Register />)}
          className="cursor-pointer text-blue-500"
        >
          Register
        </a>
      </h3>
    </div>
  );
}
