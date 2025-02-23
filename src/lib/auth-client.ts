import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import {
	usernameClient,
	passkeyClient,
adminClient
} from "better-auth/client/plugins";
export const authClient =  createAuthClient({
    plugins:[passkeyClient(), usernameClient(),adminClient()]
})