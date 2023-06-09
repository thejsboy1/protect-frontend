import React,{useState,useEffect} from 'react';
import {withRouter} from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
// Custom Components
import FullPageLoader from 'components/FullPageLoader';
import NotificationToast from 'components/NotificationToast';
// Styles Sheets
import 'styles/pages/adminProfile.css';

const ConfirmModal=(props)=>{
    return (
        <Modal {...props} centered>
            Testing Stuff
        </Modal>
    );
}

const AdminProfile=(props)=>{
    const [showNotification,setShowNotification]=useState({
        merakiKeyNotAdded:false,
    });
    const [changeEmailState,setChangeEmailState]=useState({
        success:false,
        error:false,
        errorDetails:null,
        inProgress:false
    });
    const [changePasswordState,setChangePasswordState]=useState({
        success:false,
        error:false,
        errorDetails:null,
        inProgress:false,
        passwordMatch:false
    });
    const [addMerakiKeyState,setAddMerakiKeyState]=useState({
        success:false,
        error:false,
        errorDetails:null,
        inProgress:false
    });
    const [editEmail,setEditEmail]=useState(false);
    const [editMerakiApiKey,setEditMerakiApiKey]=useState(false);
    const [showConfirmModal,setShowConfirmModal]=useState(false);
    const [currentMerakiApiKey,setCurrentMerakiApiKey]=useState('');
    useEffect(()=>{
        if(sessionStorage.getItem('meraki_key')===''){
            setCurrentMerakiApiKey('');
            setShowNotification({
                merakiKeyNotAdded:true
            });
        }else{
            setCurrentMerakiApiKey(`${sessionStorage.getItem('meraki_key')[0]}XXXXXXXXXXXXXX${sessionStorage.getItem('meraki_key').charAt(sessionStorage.getItem('meraki_key').length)}`);
        }
    },[]);
    const postChangeEmail=async(newEmail)=>{
        const response=await fetch("/email_change/",{
            method:"POST",
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify({
                email:sessionStorage.getItem('email'),
                new_email:newEmail
            })
        });
        const responseJSON=await response.json();
        if(response.code===200){
            setChangeEmailState({...changeEmailState,
                success:true,
                error:false,
                inProgress:false
            });
            // Change Session Storage Email after Update Email is Success
            sessionStorage.setItem('email',newEmail);
        }else if(response.code===201){
            setChangeEmailState({
                ...changeEmailState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:responseJSON["message"]
            });
        }else{
            setChangeEmailState({
                ...changeEmailState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:"There was an error while processing your request please contact admin or support."
            });
        }
    }
    const postChangePassword=async(oldPass,newPass)=>{
        const response=await fetch('/pwd_change/',{
            method:"POST",
            body:JSON.stringify({
                old_pwd:oldPass,
                new_pwd:newPass,
                email:sessionStorage.getItem('email')
            })
        });
        const responseJSON=await response.json();
        if(response.code===200){
            setChangePasswordState({...changePasswordState,
                success:true,
                error:false,
                inProgress:false
            });
        }else if(response.code===201){
            setChangePasswordState({
                ...changePasswordState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:responseJSON["message"]
            });
        }else{
            setChangePasswordState({
                ...changePasswordState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:"There was an error while processing your request please contact admin or support."
            });
        }
    }
    const postAddMerakiKey=async(newMerakiKey)=>{
        const response=await fetch("/apikey_add/",{
            method:"POST",
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify({
                email:sessionStorage.getItem('email'),
                apikey:newMerakiKey
            })
        });
        const responseJSON=response.json();
        if(response.code===200){
            setAddMerakiKeyState({...addMerakiKeyState,
                success:true,
                error:false,
                inProgress:false
            });
            setShowNotification({
                merakiKeyNotAdded:false
            });
            sessionStorage.setItem('meraki_key',newMerakiKey);
        }else if(response.code===401){
            setAddMerakiKeyState({
                ...addMerakiKeyState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:responseJSON["message"]
            });
        }else{
            setAddMerakiKeyState({
                ...addMerakiKeyState,
                success:false,
                error:true,
                inProgress:false,
                errorDetails:"There was an error while processing your request please contact admin or support."
            });
        }
    }
    const onClickAdd=(event)=>{
        event.preventDefault();
        const formData = new FormData(event.target);
        const formDataObj=Object.fromEntries(formData.entries());
        const newMerakiKey=formDataObj.meraki_api_key;
        setAddMerakiKeyState({...addMerakiKeyState,
            inProgress:true
        });
        postAddMerakiKey(newMerakiKey);
    }
    const onClickChangeEmail=(event)=>{
        event.preventDefault();
        const formData=new FormData(event.target);
        const formDataObj=Object.fromEntries(formData.entries());
        const newEmail=formDataObj.change_email;
        setChangeEmailState({...changeEmailState,
            inProgress:true
        });
        postChangeEmail(newEmail);
    }
    const onClickChangePassword=(event)=>{
        event.preventDefault();
        const formData=new FormData(event.target);
        const formDataObj=Object.fromEntries(formData.entries());
        const oldPass=formDataObj.old_pass;
        const newPass=formDataObj.new_pass;
        setChangePasswordState({...changePasswordState,
            inProgress:true
        });
        postChangePassword(oldPass,newPass);
    }
    return (
        <React.Fragment>
            {/* Notifications */}
            <div
            className='notification-div'
            >
            <NotificationToast
                Show={showNotification.merakiKeyNotAdded}
                Heading="INFO"
                Type="info"
                Message="Add Meraki Key to use all features."
                AutoHide={false}
                OnClose={()=>setShowNotification({merakiKeyNotAdded:false})}
            />
            <NotificationToast
                Show={addMerakiKeyState.success}
                Heading="SUCCESS"
                Type="success"
                Message="Meraki API Key added successfully."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setAddMerakiKeyState({...addMerakiKeyState,success:false})}
            />
            <NotificationToast
                Show={changeEmailState.success}
                Heading="SUCCESS"
                Type="success"
                Message="User EMAIL ID changed."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setChangeEmailState({...changeEmailState,success:false})}
            />
            <NotificationToast
                Show={changePasswordState.success}
                Heading="SUCCESS"
                Type="success"
                Message="Password changed."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setChangePasswordState({...changePasswordState,success:false})}
            />
            </div>
            {/* Loaders */}
            <FullPageLoader Loading={changeEmailState.inProgress} CustomMessage="Loading..."/>
            <FullPageLoader Loading={changePasswordState.inProgress} CustomMessage="Loading..."/>
            <FullPageLoader Loading={addMerakiKeyState.inProgress} CustomMessage="Syncing up with Meraki.."/>
            {/* Content Here */}
            <Container fluid className="content-container">
                <Row>
                    <h5 className="primary-font-color">Account Settings</h5>
                </Row>
                <Row>
                    <Col xs lg={12}>
                        <Form onSubmit={onClickChangeEmail}>
                            <Row className="mt-2">
                                <Col xs lg={2}>
                                    <Form.Label>
                                        {/* <h6>Email</h6> */}
                                        Email
                                    </Form.Label>
                                </Col>
                                <Col xs lg={4}>
                                    <InputGroup>
                                        <Form.Control id="change_email" name="change_email" type="email"
                                        defaultValue={sessionStorage.getItem('email')}
                                        disabled={!editEmail}
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>
                                                <i className='far fa-edit form-edit-icon' onClick={()=>setEditEmail(true)}></i>
                                            </InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col xs lg={4}></Col>
                                <Col xs lg={2}>
                                    <Button className="admin-form-button shadow-none" type="submit" block>
                                        Change Email
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col xs lg={12}>
                        <Form onSubmit={onClickChangePassword}>
                            <Row className="mt-2">
                                <Col xs lg={2}>
                                    <Form.Label>
                                        {/* <h6>Change Password</h6> */}
                                        Change Password
                                    </Form.Label>
                                </Col>
                                <Col xs lg={4}>
                                    <Form.Control id="old_pass" name="old_pass" type="password" placeholder="Current Password"/>
                                </Col>
                                <Col xs lg={6}></Col>
                            </Row>
                            {/* Next Line */}
                            <Row className="mt-2">
                                <Col xs lg={2}></Col>
                                <Col xs lg={4}>
                                    <Form.Control
                                        id="new_pass"
                                        name="new_pass"
                                        type="password"
                                        placeholder="New Password"
                                        // isValid={true}
                                    />
                                </Col>
                            </Row>
                            {/* Next Line */}
                            <Row className="mt-2">
                                <Col xs lg={2}></Col>
                                <Col xs lg={4}>
                                    <Form.Control
                                        id="confirm_new_pass"
                                        name="confirm_new_pass"
                                        type="password"
                                        placeholder="Confirm New Password"
                                        isInvalid={changePasswordState.passwordMatch}
                                        // isValid={true}
                                    />
                                    <Form.Control.Feedback type='invalid' tooltip>
                                        Doesn't match New Password.
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            {/* Next Line */}
                            <Row className="mt-2">
                                <Col xs lg={4}></Col>
                                <Col xs lg={2}>
                                    <Button className="admin-form-button shadow-none" type="submit" block>
                                        Change Password
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <Row><hr style={{backgroundColor:"black",width:"100%"}}/></Row>
                <Row>
                    <h5 className="primary-font-color">Meraki API Access</h5>
                </Row>
                <Row>
                    <Col xs lg={12}>
                        <Form onSubmit={onClickAdd}>
                            <Row className="mt-2">
                                <Col xs lg={2}>
                                    <Form.Label>
                                        {/* <h6>Meraki API Key</h6> */}
                                        Meraki API Key
                                    </Form.Label>
                                </Col>
                                <Col xs lg={4}>
                                    <InputGroup>
                                        <Form.Control id="meraki_api_key" name="meraki_api_key"
                                        defaultValue={currentMerakiApiKey}
                                        disabled={!editMerakiApiKey}
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>
                                                <i className='far fa-edit form-edit-icon' onClick={()=>setEditMerakiApiKey(true)}></i>
                                            </InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col xs lg={4}></Col>
                                <Col xs lg={2}>
                                    <Button className="admin-form-button shadow-none" type="submit" block
                                    // onClick={onClickAdd}
                                    >
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Container>
            <ConfirmModal show={showConfirmModal} onHide={()=>setShowConfirmModal(false)}/>
        </React.Fragment>
    );
}
export default AdminProfile;