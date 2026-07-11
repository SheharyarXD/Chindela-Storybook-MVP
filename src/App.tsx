import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import StoryBrowser from './pages/StoryBrowser'
import StoryReader from './pages/StoryReader'
import Diary from './pages/Diary'
import Subscriptions from './pages/Subscriptions'
import Notifications from './pages/Notifications'
import ChildLogin from './pages/ChildLogin'
import ChildDashboard from './pages/ChildDashboard'
import ChildReader from './pages/ChildReader'
import ChildDiary from './pages/ChildDiary'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/stories" element={<StoryBrowser />} />
      <Route path="/stories/:id" element={<StoryReader />} />
      <Route path="/diary" element={<Diary />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/child-login" element={<ChildLogin />} />
      <Route path="/child" element={<ChildDashboard />} />
      <Route path="/child/read/:id" element={<ChildReader />} />
      <Route path="/child/diary" element={<ChildDiary />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
