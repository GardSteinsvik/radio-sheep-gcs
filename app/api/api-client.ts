import convert from 'xml-js'

const localStorageKey = '__sheep_token__'

export function client(endpoint: string, {body, ...customConfig}: any = {}) {

    console.log({body})

    const token = window.localStorage.getItem(localStorageKey)
    const headers: any = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    console.log(`${process.env.REACT_APP_API_URL}/${endpoint}`, config)

    return fetch(`${process.env.REACT_APP_API_URL}/${endpoint}`, config)
        .then(async response => {
            const data = await response.json()

            if (response.ok) {
                return data
            } else {
                return Promise.reject(data)
            }
        })
}

export async function xmlClient(url: string, {body, ...customConfig}: any = {}) {
    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...customConfig.headers,
        },
    }

    return await fetch(url, config)
        .then(async response => {
            const xml = await response.text()
            const data = convert.xml2js(xml, {compact: true, elementNameFn: value => value.replace('wps:', '').replace('ows:', '').toLowerCase()})

            if (response.ok) {
                return data
            } else {
                return Promise.reject(data)
            }
        })
}
