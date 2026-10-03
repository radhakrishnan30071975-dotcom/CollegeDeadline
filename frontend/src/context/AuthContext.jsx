import { createContext, useContext, useState } from 'react'; import { send } from '../services/api';
const Ctx = createContext(); export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const save = d => { localStorage.setItem('token', d.token); localStorage.setItem('refresh', d.refreshToken); localStorage.setItem('user', JSON.stringify(d.user)); setUser(d.user); return d.user; };
  const login = async (email, password) => save(await send('post', '/auth/login', { email, password }));
  const register = async body => save(await send('post', '/auth/register', body));
  const google = async credential => save(await send('post', '/auth/google', { credential }));
  const logout = () => { localStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, login, register, google, logout }}>{children}</Ctx.Provider>;
}
