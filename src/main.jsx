import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import TravelDetail from './pages/TravelDetail.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import MyPage from './pages/MyPage.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore/:id" element={<TravelDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
