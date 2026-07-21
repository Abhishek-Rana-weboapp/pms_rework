import { createContext, useContext } from "react";


export const ArtifactFormDialogContext = createContext(null);


export const useArtifactFormDialog = ()=>{
    const context = useContext(ArtifactFormDialogContext);
    if(!context){
        throw new Error("useArtifactFormDialog must be used within a ArtifactFormDialogProvider")
    }

    return context;
}