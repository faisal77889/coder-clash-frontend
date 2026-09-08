import{createBrowserRouter,RouterProvider} from "react-router-dom"
import './App.css'
import Homepage from "./pages/HomePage"
import Test from "./pages/Test"



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
