import { createContext, type Dispatch, type SetStateAction } from "react";

export default createContext<{
  currPage: JSX.Element | null;
  setPage: Dispatch<SetStateAction<JSX.Element | null>>;
}>({
  currPage: null,
  setPage: () => {},
});
