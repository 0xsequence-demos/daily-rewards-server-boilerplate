import {Response} from "node-fetch";

export function getResponse(body: string, status?: number): Response {
    return new Response(body, {
        status: status,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Origin': '*',
        }
    });
}