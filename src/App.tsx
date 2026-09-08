import{createBrowserRouter,RouterProvider} from "react-router-dom"
import './App.css'

import Test from "./pages/Test"
import Homepage from "./pages/Homepage"



function App() {
  const router = createBrowserRouter([
    {
      path : "/",
      element : <Homepage />
    },
    {
      path : "/test",
      element : <Test /> 
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
