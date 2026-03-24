const API_CHECK_AUTH = "/api/SecureWebSite/me";
import { sleep } from "../utils/sleep";


async function logout() {
    const response = await fetch("/api/securewebsite/logout", {
        method: "POST",
        credentials: "include"
    });

    //const data = await response.json();

    document.location = "/login";

    //if (response.ok) {
        //localStorage.removeItem("user")
        
    //} else {
        //console.log("could not logout: ", response);
    //}
}


async function checkAuth() {
    let isLogged = false;

    try {
        const resp = await fetch(API_CHECK_AUTH, {
            method: "GET",
            credentials: "include",
        });

        await sleep(3000);

        if (!resp.ok) {
            //console.log(`authService: HTTP ${resp.status}`);
            localStorage.removeItem("user");
            return false;
        }

        const data = await resp.json();
        const email = data?.login;

        if (email) {
            localStorage.setItem("user", email);
            return true;
        }

        console.log("authService(EMAIL): null");
        localStorage.removeItem("user");
        return false;
    } catch (err) {
        localStorage.removeItem("user");
        console.log("authService: ", err);
        return false;
    }
    
    await sleep(5000);
}

//async function checkAuth() {
//    //const minMs = 500;
//    //const start = Date.now();

//    let isLogged = false;

//    try {
//        const resp = await fetch(API_CHECK_AUTH, {
//            method: "GET",
//            credentials: "include",
//        });

//        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

//        const data = await resp.json();

//        // Se a resposta realmente significa “logado”, ok:
//        //if (!cancelled) {
//            //setIsLogged(true);
//            localStorage.setItem("user", data.user?.email ?? "");
//            isLogged = true;
//        //}
//    } catch (err) {
//        //if (!cancelled) {
//            //setIsLogged(false);
//            localStorage.removeItem("user");
//            console.log("Error protected routes: ", err);
//        //}
//        return false;
//    } finally {
//        console.log("a.2");
//        //const elapsed = Date.now() - start;
//        //const remaining = Math.max(0, minMs - elapsed);

//        //await sleep(remaining); // pra que isso mesmo ?kk

//        //if (!cancelled) setWaiting(false);

//        return isLogged;
//    }
//}

//function saveAuthInStorage() {
    //localStorage.setItem("user", data.user?.email ?? "");
//}

const authService = {
    checkAuth,
    logout
};

export default authService;


//// Auth service for the React app.
//// Responsibilities:
//// - login / logout / register
//// - token storage in localStorage
//// - helper to perform authenticated fetch requests
//// - optional token refresh

//const STORAGE_KEY = 'auth';
//const API_BASE = process.env.REACT_APP_API_URL || ''; // e.g. 'https://api.example.com'

//function saveAuth(payload) {
//  // payload expected: { accessToken, refreshToken, user }
//  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
//}

//function clearAuth() {
//  localStorage.removeItem(STORAGE_KEY);
//}

//function loadAuth() {
//  const raw = localStorage.getItem(STORAGE_KEY);
//  if (!raw) return null;
//  try {
//    return JSON.parse(raw);
//  } catch {
//    clearAuth();
//    return null;
//  }
//}

//async function handleResponse(res) {
//  const text = await res.text();
//  const data = text ? JSON.parse(text) : null;
//  if (!res.ok) {
//    const error = (data && data.message) || res.statusText || 'Request failed';
//    const err = new Error(error);
//    err.status = res.status;
//    err.data = data;
//    throw err;
//  }
//  return data;
//}

//async function login({ email, password }) {
//  const res = await fetch(`${API_BASE}/auth/login`, {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    body: JSON.stringify({ email, password }),
//  });
//  const data = await handleResponse(res);
//  // Expected response shape: { accessToken, refreshToken, user }
//  if (data && data.accessToken) {
//    saveAuth({
//      accessToken: data.accessToken,
//      refreshToken: data.refreshToken || null,
//      user: data.user || null,
//    });
//  }
//  return data;
//}

//async function register(userPayload) {
//  const res = await fetch(`${API_BASE}/auth/register`, {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    body: JSON.stringify(userPayload),
//  });
//  const data = await handleResponse(res);
//  // Some APIs return the created user but not tokens. Do not auto-login here.
//  return data;
//}

//function logout() {
//  // Optionally inform server about logout (invalidate refresh token)
//  const auth = loadAuth();
//  clearAuth();
//  if (auth && auth.refreshToken) {
//    // fire-and-forget
//    fetch(`${API_BASE}/auth/logout`, {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ refreshToken: auth.refreshToken }),
//    }).catch(() => {
//      /* ignore network errors on logout */
//    });
//  }
//}

//function getCurrentUser() {
//  const auth = loadAuth();
//  return auth ? auth.user : null;
//}

//function getAccessToken() {
//  const auth = loadAuth();
//  return auth ? auth.accessToken : null;
//}

//function isAuthenticated() {
//  return !!getAccessToken();
//}

//async function refreshToken() {
//  const auth = loadAuth();
//  if (!auth || !auth.refreshToken) throw new Error('No refresh token available');
//  const res = await fetch(`${API_BASE}/auth/refresh`, {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    body: JSON.stringify({ refreshToken: auth.refreshToken }),
//  });
//  const data = await handleResponse(res);
//  // Expected: { accessToken, refreshToken?, user? }
//  const newAuth = {
//    accessToken: data.accessToken,
//    refreshToken: data.refreshToken || auth.refreshToken,
//    user: data.user || auth.user,
//  };
//  saveAuth(newAuth);
//  return newAuth;
//}

//async function authFetch(input, init = {}) {
//  // wrapper around fetch that injects Authorization header and optionally refreshes token on 401
//  const token = getAccessToken();
//  const headers = new Headers(init.headers || {});
//  headers.set('Accept', 'application/json');
//  if (token) headers.set('Authorization', `Bearer ${token}`);

//  const response = await fetch(input.startsWith('http') ? input : `${API_BASE}${input}`, {
//    ...init,
//    headers,
//  });

//  if (response.status === 401) {
//    // try refreshing token once
//    try {
//      await refreshToken();
//      const newToken = getAccessToken();
//      if (newToken) {
//        headers.set('Authorization', `Bearer ${newToken}`);
//        return fetch(input.startsWith('http') ? input : `${API_BASE}${input}`, {
//          ...init,
//          headers,
//        });
//      }
//    } catch {
//      logout();
//      throw new Error('Unauthorized');
//    }
//  }

//  return response;
//}

//const authService = {
//  login,
//  register,
//  logout,
//  getCurrentUser,
//  getAccessToken,
//  isAuthenticated,
//  refreshToken,
//  authFetch,
//  // utility exported for tests or advanced usage
//  __internal: { loadAuth, saveAuth, clearAuth },
//};

//export default authService;