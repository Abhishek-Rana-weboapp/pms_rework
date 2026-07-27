import { createContext, useContext } from "react";

export const BacklogContext = createContext(null);

export const useBacklogContext = ()=>{
    const context = useContext(BacklogContext);
    if(!context){
        throw new Error("useBacklogContext must be used withing BacklogContextProvider")
    }
    return context;
}