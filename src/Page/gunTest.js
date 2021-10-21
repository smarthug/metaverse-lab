import { useEffect } from "react"
import Gun from 'gun'

const gun = Gun({
    peers: [`http:localhost:8000/gun`] // Put the relay node that you want here
});

// const gun = Gun();


export default function GunTest() {

    useEffect(() => {
        gun.get('test').once((node) => {
            console.log(node);
        })


        gun.get('test').on((node) => { // Is called whenever text is updated
            console.log(node)
        })

    }, [])

    function handleClick() {
        let tmp = prompt("input")
        gun.get("test").put({ test: tmp })
    }


    return (
        <div>
            <h1>Gun Test</h1>
            <button onClick={handleClick}>TEST</button>
        </div>
    )
}