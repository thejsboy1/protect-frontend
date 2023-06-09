import React,{useState,useEffect,useContext} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
// Custom Components
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const EditProfileModal=({editType,profileData,...props})=>{
    const {reloadTable}=useContext(CamerasPageContext);
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [notificationState,setNotificationState]=useState('');
    const [profileName,setProfileName]=useState('');
    const [data,setData]=useState([]);
    const [editableFields,setEditableFields]=useState({
        // NOTE : if editType===true => fields not editable initially
        // editType===false => fields editable initially.
        webex:!editType,
        whatsapp:!editType,
        email:!editType,
        sms:!editType
    });
    useEffect(()=>{
        if(profileData){
            makeData();
        }
    },[profileData]);
    // INFO : API call functions
    const postNotificationProfile=async()=>{
        const response=await fetch('/np_create/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(data )
        });
        if(response.status===200){
            // alert('CHANGES TO PROFILE SUCCESSFUL');
            setNotificationState('success');
            // PENDING  : add loader and notification ;
            // Alternate to page refresh for updating schedule list.
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState('error');
            // alert('CHANGES TO PROFILE FAILED');
        }
    }
    // 
    const makeData=()=>{
        let currentData=profileData;
        setData(currentData);
        setProfileName(currentData['p_name']);
    }
    const switchEditableField=(field)=>{
        let temp={...editableFields};
        temp[field]=!editableFields[field];
        setEditableFields(temp);
    }
    // INFO : onChange event handlers
    const onChangeProfileName=(event)=>{
        let name=event.target.value;
        let currData={...data};
        currData['p_name']=name;
        setData(currData);
        setProfileName(name);
    }
    const onChangeWebex=event=>{
        let temp=event.target.value;
        let currData={...data};
        currData['roomid']=temp;
        setData(currData);
    }
    const onChangeWhatsapp=event=>{
        let temp=event.target.value;
        let currData={...data};
        currData['whatsapp']=temp;
        setData(currData);
    }
    const onChangeEmail=event=>{
        let temp=event.target.value;
        let currData={...data};
        currData['email']=temp;
        setData(currData);
    }
    const onChangeSMS=event=>{
        let temp=event.target.value;
        let currData={...data};
        currData['sms']=temp;
        setData(currData);
    }
    const onClickApplyChanges=()=>{
        postNotificationProfile();
    }

    return (
        <React.Fragment>
        {/* Notifications */}
        <div
            className='notification-div'
        >
             <NotificationToast
                Show={notificationState==='success'}
                Heading="SUCCESS"
                Type="success"
                Message="Notification Profile changes saved."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setNotificationState('')}
            />
            <NotificationToast
                Show={notificationState==='error'}
                Heading="ERROR"
                Type="error"
                Message="Unable to save notification profile changes. Try again after refreshing."
                AutoHide={false}
                OnClose={()=>setNotificationState('')}
            />
        </div>
        <Modal {...props} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Profile Settings
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className='mt-2'>
                    <Col lg={2}>Profile Name</Col>
                    <Col lg={6}>
                        <Form.Control 
                            onChange={onChangeProfileName} 
                            disabled={editType}
                            defaultValue={profileName}
                        />
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col lg={2}>
                        Webex Teams
                    </Col>
                    <Col lg={6}>
                        <InputGroup>
                            <Form.Control
                                id='webex_teams'
                                name='webex_teams'
                                type='text'
                                defaultValue={profileData?data['roomid']:''}
                                disabled={!editableFields.webex}
                                onChange={onChangeWebex}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>
                                    <i className='far fa-edit form-edit-icon' onClick={()=>switchEditableField('webex')}></i>
                                </InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col lg={2}>
                        Email Id
                    </Col>
                    <Col lg={6}>
                        <InputGroup>
                            <Form.Control
                                id='email_id'
                                name='email_id'
                                type='email'
                                defaultValue={profileData?data['email']:''}
                                disabled={!editableFields.email}
                                onChange={onChangeEmail}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>
                                    <i className='far fa-edit form-edit-icon' onClick={()=>switchEditableField('email')}></i>
                                </InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col lg={2}>
                        Whatsapp
                    </Col>
                    <Col lg={6}>
                        <InputGroup>
                            <Form.Control
                                id='whatsapp'
                                name='whatsapp'
                                type='number'
                                defaultValue={profileData?data['whatsapp']:''}
                                disabled={!editableFields.whatsapp}
                                onChange={onChangeWhatsapp}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>
                                    <i className='far fa-edit form-edit-icon' onClick={()=>switchEditableField('whatsapp')}></i>
                                </InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col lg={2}>
                        SMS
                    </Col>
                    <Col lg={6}>
                        <InputGroup>
                            <Form.Control
                                id='sms'
                                name='sms'
                                type='number'
                                defaultValue={profileData?data['sms']:''}
                                disabled={!editableFields.sms}
                                onChange={onChangeSMS}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>
                                    <i className='far fa-edit form-edit-icon' onClick={()=>switchEditableField('sms')}></i>
                                </InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClickApplyChanges}>Apply Changes</Button>
            </Modal.Footer>
        </Modal>
        </React.Fragment>
    );
}

export default EditProfileModal;