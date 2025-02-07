import {jwtVerify, JWK, decodeProtectedHeader} from "jose";
import {get} from "./httpClient";

class AuthHandlerImpl {
    async verifyRequest(context: any): Promise<string> {
        const authHeader = context.request.headers.get("Authorization") as string;
        const token = authHeader.split(' ')[1];
        return await AuthHandler.verifyJwt(token);
    }

    async verifyJwt(token: string): Promise<string> {
        const response = await get("https://waas.sequence.app/.well-known/jwks.json", undefined);
        const jwks= response.data as {keys: JWK[]};

        const decodedHeader = decodeProtectedHeader(token);
        const kid = decodedHeader.kid;
        const signingKey = jwks.keys.find((k) => k.kid === kid);
        if (!signingKey) {
            throw new Error("No signing key found with matching kid");
        }

        const audience = `https://sequence.build/project/${158}`;
        const verified = await jwtVerify(token, signingKey, { audience });
        return verified.payload.sub;
    }
}

export const AuthHandler = new AuthHandlerImpl();
