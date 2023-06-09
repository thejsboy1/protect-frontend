import React,{useState,createContext} from 'react';

export const GlobalContext=createContext({
    emailContext:['',function(){}],
    tokenContext:['',function(){}],
});

export const GlobalContextProvider=(props)=>{
    const [email,setEmail]=useState('');
    const [token,setToken]=useState('');
    return (
        <GlobalContext.Provider value={{
            emailContext:[email,setEmail],
            tokenContext:[token,setToken]
        }}>
            {props.children}
        </GlobalContext.Provider>
    );
}