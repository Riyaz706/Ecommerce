import { Routes, Route } from 'react-router-dom'
import Navigation from './customer/components/Navigation/Navigation';
import HomePage from './customer/pages/HomePage/HomePage';


function App() {
  return (
    <>
      <Navigation />
      <HomePage />
    </>
  )
}


export default App;