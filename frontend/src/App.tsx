// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import ClearableInput from './components/keyword_input'

function App() {
  // const [count, setCount] = useState(0)
  // const [value, setValue] = useState("")

  // const handleInputChange = (newValue: string) => {
  //   setValue(newValue);
  // }

  return (
    <>
    <div>
      <h1>Playlist Builder</h1>
      {/* <input type="type" name="" id="" placeholder='Playlist name'/> */}
      <ClearableInput/>
      {/* <ClearableInput placeholder="Playlist name" value={value} onChange={handleInputChange} /> */}
      
    </div>
      {/* <div>
        <a href="" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
