import React,{useState,useContext,useEffect} from 'react';
import {withRouter} from 'react-router';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
// import Image from 'react-bootstrap/Image';
// CSS Imports
import 'styles/pages/loginPage.css';
// Images,Icons Imports
import loginPageImage from 'images/login_page_background.jpg';
// Context/Provider
import {GlobalContext} from 'GlobalContext';

const LoginForm=()=>{
    const history=useHistory();
    const [state,setState]=useState({
        responseCode:0,
        inProgress:false,
        error:false
    });
    useEffect(()=>{
        if(sessionStorage.getItem('verified')){
            if(sessionStorage.getItem('meraki_key')===''){
                history.push('/page/adminProfile');
            }else{
                history.push('/page/home');
            }
        }
    },[state.inProgress]);
    const getToken=async(email,pwd)=>{
        const response=await fetch('/login_check/',{
            method:"POST",
            body:JSON.stringify({
                email:email,
                password:pwd
            })
        });
        const responseJSON=await response.json();
        if(response.status===200){
            setState({...state,
                responseCode:response.status,
                error:false,
                inProgress:false
            });
            console.log(responseJSON);
            sessionStorage.setItem('token',responseJSON['token']);
            sessionStorage.setItem('verified',true);
            sessionStorage.setItem('email',email);
            sessionStorage.setItem('meraki_key',responseJSON['apikey']);
            sessionStorage.setItem('org_name',responseJSON['org_name']);
        }else if(response.status===401){
            setState({...state,
                responseCode:response.status,
                error:false,
                inProgress:false
            });
        }else{
            setState({
                ...state,
                responseCode:response.status,
                error:true,
                inProgress:false
            });
        }
    };
    const onSubmitForm=(event)=>{
        event.preventDefault();
        const formData = new FormData(event.target);
        const formDataObj=Object.fromEntries(formData.entries());
        const email=formDataObj.email;
        const pwd=formDataObj.pass;
        setState({...state,
            inProgress:true
        });
        getToken(email,pwd);
    };
    return (
        <Form className="form-card" onSubmit={onSubmitForm}>
            <Form.Row className="form-row pb-3">
                    <h3>Log in</h3>
            </Form.Row>
            <Form.Row className="form-row">
                <Col xs={8}>
                    <Form.Group controlId="formEmail">
                        <Form.Label className="form-label-text">Login, Email Address</Form.Label>
                        <Form.Control className="input-field" name="email" type="email" required/>
                    </Form.Group>
                </Col>
            </Form.Row>
            <Form.Row className="form-row">
                <Col xs={8}>
                    <Form.Group controlId="formPass">
                        <Form.Label  className="form-label-text">Password</Form.Label>
                        <Form.Control className="input-field" name="pass" type="password" required/>
                    </Form.Group>
                </Col>
            </Form.Row>
            {
                state.error&&state.responseCode===401
                ?
                <Form.Row className="form-row">
                    <Col xs={6}>
                        <Form.Text className="error-text">
                            Username or Password incorrect
                        </Form.Text>
                    </Col>
                </Form.Row>
                :null
            }
            <Form.Row className="form-row">
                <Col xs={8} style={{textAlign:"center"}}>
                    {
                        state.inProgress
                        ?
                        <Spinner animation='border' variant='primary'/>
                        :
                        <Button className="login-button" variant="primary" type="submit" block>
                            Log in
                        </Button>
                    }
                </Col>
            </Form.Row>
            <Form.Text className="form-label-text form-row mt-2">
                <Link to="/">Forgot login or password ?</Link>
            </Form.Text>
        </Form>
    );
}

const styles={
    "background":{
        backgroundImage:`url(${loginPageImage})`,
        backgroundPosition:'center',
        backgroundSize:'cover',
        backgroundRepeat:'no-repeat',
        position:'absolute',
        height:'100vh',
        width:'100vw',
        filter:'blur(8px)'
    },
}
const LoginPage=()=>{
    return (
        <React.Fragment>
            <div style={styles.background}></div>
            <Container fluid>
                <Row className="page-row">
                    {/* <Col xs lg="6">
                        <Image src={loginPageImage} fluid/>
                    </Col> */}
                    <Col xs lg="4">
                        <LoginForm/>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default withRouter(LoginPage);