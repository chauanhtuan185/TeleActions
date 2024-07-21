import { ActionGetResponse , ActionsURLMapper, ActionsJsonConfig } from "./types"
import axios from 'axios'

export async function Handler(actionsURL: string) {
    try {
        const response = await axios.get(actionsURL);
        const data : ActionGetResponse = response.data
        return data;    
    } catch (error) {
        console.error(`Error`);
    }
}


