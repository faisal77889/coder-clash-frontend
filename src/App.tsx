import{createBrowserRouter,RouterProvider} from "react-router-dom"
import './App.css'

import Test from "./pages/Test"
import Homepage from "./pages/Homepage"
import Challenges from "./pages/Challenges"



function App() {
  const router = createBrowserRouter([
    {
      path : "/",
      element : <Homepage />
    },
    {
      path : "/challenge/:challengeId",
      element : <Homepage />
    },
    {
      path : "/challenges",
      element : <Challenges /> 
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
