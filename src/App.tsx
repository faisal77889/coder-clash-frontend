import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './App.css'

import Homepage from "./pages/Homepage"
import Challenges from "./pages/Challenges"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage />
    },
    {
      path: "/challenge/:challengeId",
      element: <Homepage />
    },
    {
      path: "/challenges",
      element: <Challenges /> 
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/signup",
      element: <Signup />
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App

