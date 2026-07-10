import { useMutation } from "@tanstack/react-query";
import { signup } from "../api/authApi";
import { toast } from "sonner";


export const useSignUp = ({needEmailVarify})=> {
 return useMutation({
    mutationFn:(payload)=>signup(payload),
    onSuccess:async (data)=>{
        if(data.otp_sent) needEmailVarify(data.email)
       toast.success("SignUp successfull")
    }
})
}