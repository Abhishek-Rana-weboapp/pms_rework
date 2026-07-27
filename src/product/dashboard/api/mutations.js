import { useMutation } from "@tanstack/react-query"
import { generateReport } from "./endpoints"

export const useGenerateReports = ()=>{
    return useMutation({
        mutationFn:generateReport,       
    })
}