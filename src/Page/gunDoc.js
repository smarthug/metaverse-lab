import Gun from 'gun'
import { useEffect, useState } from 'react'

const gun = Gun({
    peers: [`http:localhost:8000/gun`] // Put the relay node that you want here
})

export default function App() {
    const [txt, setTxt] = useState()

    useEffect(() => {

        gun.get('text').once((node) => { // Retrieve the text value on startup
            console.log(node)
            if (node === undefined) {
                gun.get('text').put({ text: "Write the text here" })
            } else {
                console.log("Found Node")
                // console.log(node)
                // console.log(node.text)
                // console.log("test\\ntest")
                // console.log("test\ntest")
                // console.log("test\ntest" === node.text)
                // console.log("test\\ntest" === node.text)
                // console.log("test\ntest" === node.text.replaceAll(/\\\\n/gm, "\\\\n"))
                // // setTxt("test\ntest")
                // // setTxt(node.text)
                // console.log(node.text.replaceAll(/\\n/g, "\n"))
                setTxt(node.text.replaceAll(/\\n/gm, "\n"))
                // test\ntest
            }
        })

        gun.get('text').on((node) => { // Is called whenever text is updated
            console.log("Receiving Update")
            console.log(node)
            console.log(node.text)
            // setTxt(node.text.replaceAll(/\n/gm, "\\\\n"))
            setTxt(node.text.replaceAll(/\\n/gm, "\n"))
        })
    }, [])

    const updateText = (event) => {
        console.log("Updating Text")
        console.log(event.target.value)
        gun.get('text').put({ text: event.target.value }) // Edit the value in our db

        setTxt(event.target.value);
    }

    return (
        <div className="App">
            <h1>Collaborative Document With GunJS</h1>
            <textarea value={txt} onChange={updateText} />
        </div>
    )
}