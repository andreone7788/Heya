import Login from './pages/login.page'
import { ManagementUser } from './pages/adminUser.page'
import { Route, Routes } from 'react-router-dom'
import { PrivateRoutes } from './routes/privateRoutes'
import Register from './pages/registrationUser.page'
import { ProfilePage } from './pages/profile.page'
import { Header } from './components/header'
import { ChatPage } from './pages/chat.page'
import { WebSocketProvider } from './provider/wsProvider'
import { NotFound } from './pages/notFound'
import { ManagementUserPending } from './pages/adminUser.page copy'
import "./pages/style/App.css"
function App() {
  return (
    <>
      
        <div id="page">
          <Header />
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/register' element={<Register />} />


            <Route path='/HeyaManagementUser' element={
              <PrivateRoutes requireAdmin={true}>
                <ManagementUser />
              </PrivateRoutes>
            } />

            <Route path='/HeyaManagementRequest' element={
              <PrivateRoutes requireAdmin={true}>
                <ManagementUserPending />
              </PrivateRoutes>
            } />

            <Route path='/HeyaChat' element={
              <PrivateRoutes requireAdmin={false}>
                <WebSocketProvider>
                <ChatPage />
                </WebSocketProvider>

              </PrivateRoutes>
            } />

            <Route path='/HeyaProfile' element={
              <PrivateRoutes requireAdmin={false}>
                <WebSocketProvider>
                <ProfilePage />
                </WebSocketProvider>
              </PrivateRoutes>
            } />

            <Route path='*' element={<NotFound/>} />


          </Routes>
        </div>
      
    </>
  )
}

export default App
