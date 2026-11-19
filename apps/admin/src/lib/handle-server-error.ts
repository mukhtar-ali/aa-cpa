import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
    console.error(error)
    let errMsg = 'Something went wrong!'
    if (error instanceof AxiosError) {
        errMsg = error.response?.data?.message ?? error.response?.data?.title ?? errMsg
    }
    toast.error(errMsg)
}
