import React,{useState} from 'react';
import Container from 'react-bootstrap/Container';
// Style Sheet
import 'styles/components/fullPageLoader.css';


const FullPageLoader=(props)=>{
    return (
        <React.Fragment>
            {props.Loading?<div className="loading">{props.CustomMessage}</div>:null}
        </React.Fragment>
    );
}

export default FullPageLoader;