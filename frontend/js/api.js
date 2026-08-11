const API_BASE = '';

async function api(url, options = {}) {
    const res = await fetch(API_BASE + url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    if (res.status === 401 && !url.includes('/auth/me')) {
        window.location.href = '/login';
        return;
    }
    
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

const apiClient = {
    get: (url) => api(url),
    post: (url, body) => api(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => api(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (url, body) => api(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url) => api(url, { method: 'DELETE' }),
    
    upload: (url, formData) => fetch(API_BASE + url, {
        method: 'POST',
        credentials: 'include',
        body: formData
    }).then(r => r.json())
};
