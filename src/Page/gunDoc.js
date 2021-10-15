import Gun from 'gun'
import {useEffect, useState} from 'react'

const gun = Gun({
    peers: [`http:localhost:8000/gun`] // Put the relay node that you want here
})

function App() {
    const [txt, setTxt] = useState()

    return (
        <div className="App">
            <h1>Collaborative Document With GunJS</h1>
            <textarea value={txt} onChange = {updateText} />
        </div>
    )
}