import { useEffect, useState } from "react"

export default function NewLineTest(){

    const [txt, setTxt] = useState()
    
    useEffect(()=>{
        let test = "test\ntest"
        console.log(test)

        
        let tmp = JSON.stringify({text:`${test}`})
        
        console.log(tmp)

        let tmp2 = JSON.parse(tmp)
        console.log(tmp2)
        setTxt(tmp2.text)
    },[])
    return(
        <div>
            hello
            <textarea value={txt} onChange={()=>{}} />
        </div>
    )
}