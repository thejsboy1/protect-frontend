import React,{useState,useEffect,useContext} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// Custom Components
import EditProfileModal from 'components/EditProfileModal';
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const NotificationProfileModal=({CallbackShowProfileModal,...props})=>{
    // Using Context
    const {camerasTableSelectedRows,reloadTable}=useContext(CamerasPageContext);
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    // 
    const [notificationState,setNotificationState]=useState({
        selectProfile:'',
        deleteProfile:''
    });
    // 
    const [notificationProfileModalState,setNotificationProfileModalState]=useState({
        loadingData:true, 
        error:false,
         // data:testScheduleAPIData
        data:[]
     });
    const [showEditProfileModal,setShowEditProfileModal]=useState(false);
    const [showCreateProfileModal,setShowCreateProfileModal]=useState(false);
    const [editProfileData,setEditProfileData]=useState([]);
     // Run once only.
     useEffect(()=>{
        getNotificationProfileData();
    },[]);
    // 
    // INFO: API call methods
    const getNotificationProfileData=async()=>{
        const response=await fetch('/notification/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setNotificationProfileModalState({
                loadingData:false,
                error:false,
                data:responseJSON['data']
            });
        }else{
            setNotificationProfileModalState({
                loadingData:false,
                error:true,
                data:[]            
            });
        }        
    }
    const postSelectedProfile=async(profileName)=>{
        const bodyData=await makeSelectProfileData(profileName);
        const response=await fetch('/select_np/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            setNotificationState({...notificationState,
                selectProfile:'success'
            });
            // PENDING : Add a loader and notification prompt; Alternate to page reload for refreshing 
            // data in table
            // alert('PROFILE SELECT SUCCESS');
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState({...notificationState,
                selectProfile:'error'
            });
            // alert('PROFILE SELECT FAILED');
        }        
    }
    const postDeleteProfile=async(profileName)=>{
        const response=await fetch('/np_delete/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify({"p_name":profileName})
        });
        if(response.status===200){
            setNotificationState({...notificationState,
                deleteProfile:'success'
            });
            // PENDING : Add a loader and notification prompt; Alternate to page reload for refreshing 
            // data in table
            // alert('PROFILE DELETE SUCCESS');
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState({...notificationState,
                deleteProfile:'error'
            });
            // alert('PROFILE DELETE FAILED');
        }
    }
    // 
    const makeSelectProfileData=(profileName)=>{
        let data={
            'mac_list':[],
            'profiles':[profileName]
        };
        tableSelectedRows.map((row)=>{
            data['mac_list'].push(row['original']['mac']);
        });
        return data;
    }
    const onCreateProfile=()=>{
        setShowCreateProfileModal(true);
        CallbackShowProfileModal(false);
    }
    const onEditProfile=(profile)=>{
        // Add parse according to which profile is being edited.
        setShowEditProfileModal(true);
        setEditProfileData(profile);
        CallbackShowProfileModal(false);
    }
    const onSelectProfile=profileData=>{
        postSelectedProfile(profileData['p_name']);
        // CallbackShowProfileModal(false);
    }
    const onDeleteProfile=profileData=>{
        postDeleteProfile(profileData['p_name']);
        // CallbackShowProfileModal(false);
    }
    return (
    <React.Fragment>
        {/* Notifications */}
        <div
            className='notification-div'
        >
            {/* Success Notifications */}
            <NotificationToast
                Show={notificationState.selectProfile==='success'}
                Heading="SUCCESS"
                Type="success"
                Message="Notification profile applied to cameras."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setNotificationState({...notificationState,selectProfile:''})}
            />
            <NotificationToast
                Show={notificationState.deleteProfile==='success'}
                Heading="SUCCESS"
                Type="success"
                Message="Notification profile deleted."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setNotificationState({...notificationState,deleteProfile:''})}
            />
            {/* Error Notifications */}
            <NotificationToast
                Show={notificationState.selectProfile==='error'}
                Heading="ERROR"
                Type="error"
                Message="Unable to apply notification profile. Try again after refreshing."
                AutoHide={false}
                OnClose={()=>setNotificationState({...notificationState,selectProfile:''})}
            />
            <NotificationToast
                Show={notificationState.deleteProfile==='error'}
                Heading="ERROR"
                Type="error"
                Message="Unable to delete notification profile. Try again after refreshing."
                AutoHide={false}
                OnClose={()=>setNotificationState({...notificationState,deleteProfile:''})}
            />
        </div>
        <Modal {...props} size='lg' centered> 
            <Modal.Header closeButton>
                <Modal.Title>
                    Notification Profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Button size='sm' onClick={onCreateProfile}>Create</Button>
                <Row>
                    {notificationProfileModalState.data.map((profile)=>(
                        <Col className='mt-2' lg={4} key={profile['p_name']}>
                            <Card className='text-center card-item mt-2'>
                                <Card.Body>
                                    <Card.Title><h4>{profile['p_name']}</h4></Card.Title>
                                    <Card.Text>
                                        Used by 3 Cameras
                                    </Card.Text>
                                    <Button size='sm' onClick={()=>onDeleteProfile(profile)}>Delete</Button>
                                    <Button size='sm' className='ml-1' onClick={()=>onEditProfile(profile)}>Edit</Button>
                                    <Button size='sm' className='ml-1' onClick={()=>onSelectProfile(profile)}>Select</Button>
                                </Card.Body>                    
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
        </Modal>
        {/* Edit Modal */}
        <EditProfileModal 
            show={showEditProfileModal} 
            profileData={editProfileData}
            editType={true}
            onHide={()=>{
                setEditProfileData([]);
                setShowEditProfileModal(false);
                CallbackShowProfileModal(true);
            }}
        />
        {/* Create Modal */}
        <EditProfileModal 
            show={showCreateProfileModal}
            profileData={[]}
            editType={false}
            onHide={()=>{
                setEditProfileData([]);
                setShowCreateProfileModal(false);
                CallbackShowProfileModal(true);
            }}
        />
    </React.Fragment>
    );
}

export default NotificationProfileModal;