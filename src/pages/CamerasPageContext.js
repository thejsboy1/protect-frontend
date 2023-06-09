import React,{useState,createContext} from 'react';

export const CamerasPageContext=createContext({
    camerasTableSelectedRows:[[],function(){}],
    camerasCommonTags:[[],function(){}],
    firstRowSelected:[false,function(){}],
    reloadTable:[false,function(){}]
});


export const CamerasPageProvider=props=>{
    const [tableSelectedRows,setTableSelectedRows]=useState([]);
    const [commonTags,setCommonTags]=useState([]);
    const [firstRowSelected,setFirstRowSelected]=useState(false);
    const [reloadTableData,setReloadTableData]=useState(false);
    return (
        <CamerasPageContext.Provider value={{
            camerasTableSelectedRows:[tableSelectedRows,setTableSelectedRows],
            camerasCommonTags:[commonTags,setCommonTags],
            firstRowSelected:[firstRowSelected,setFirstRowSelected],
            reloadTable:[reloadTableData,setReloadTableData]
        }}
        >
            {props.children}
        </CamerasPageContext.Provider>
    );
}