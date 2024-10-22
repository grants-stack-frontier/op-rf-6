export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    console.error('Failed to get token from localStorage');
    return '';
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem('token', token);
  } catch {
    console.error('Failed to set token in localStorage');
  }
}
