export async function get(url: string, accessToken: string | undefined) {
    return await sendRequest(url, 'GET', undefined, accessToken);
}

export async function post(url: string, payload: string, accessToken: string | undefined) {
    return await sendRequest(url, 'POST', payload, accessToken);
}

export async function postFile(url: string, payload: FormData, accessToken: string | undefined) {
    return await sendRequest(url, 'POST', payload, accessToken);
}

export async function deleteRequest(url: string, payload: string, accessToken: string | undefined) {
    return await sendRequest(url, 'DELETE', payload, accessToken);
}

async function sendRequest(
    url: string,
    method: string,
    payload: string | FormData | undefined,
    accessToken: string | undefined,
) {
    try {
        let contentType: string | undefined = 'application/json';
        if (payload instanceof FormData) {
            contentType = undefined;
        }

        let headers: HeadersInit = {};
        if (accessToken !== undefined) {
            headers['Authorization'] = 'Bearer ' + accessToken;
        }

        if (contentType !== undefined) {
            headers['Content-Type'] = contentType;
        }

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: payload,
        });

        const ok = response.status >= 200 && response.status < 300;
        let data: any;
        try {
            data = await response.json();
        } catch (_) {
            data = null;
        }

        console.log('<<', method, response.status, url, data);
        return {
            success: ok,
            data: data,
        };
    } catch (e) {
        return {
            success: true,
            data: {},
        };
    }
}