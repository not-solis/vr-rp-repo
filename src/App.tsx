import { useState } from 'react';
import Repo from './repo/Repo';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import './App.css';
import { AuthContext, UserData } from './context/AuthProvider';
import { LoginComponent } from './components/LoginComponent';

export const USER_DATA_COOKIE = 'user';

function App() {
  const [userData, setUserData] = useState<UserData>({});

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      <CookiesProvider>
        <div style={{ height: '100vh' }}>
          <div className='nav'>
            <header>VR Roleplay Repo </header>
            {/* <DarkModeToggle /> */}
            <LoginComponent />
          </div>
          <BrowserRouter>
            <Routes>
              <Route path='/repo' element={<Repo />} />
              <Route path='/auth/*' element={<div>you did it!</div>} />
              <Route
                path='*'
                element={<Navigate to='/repo' replace={true} />}
              />
            </Routes>
          </BrowserRouter>
        </div>
      </CookiesProvider>
    </AuthContext.Provider>
  );
}

export default App;
