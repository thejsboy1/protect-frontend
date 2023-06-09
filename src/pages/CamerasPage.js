import React,{useState,useEffect,useContext} from 'react';
import {withRouter} from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import {useHistory} from 'react-router';
// Styles Sheet
import 'styles/pages/camerasPage.css';
// Custom Components
import CamerasTable from 'components/CamerasTable';
import ScheduleModal from 'components/ScheduleModal';
import NotificationProfileModal from 'components/NotificationProfileModal';
import ServicesModal from 'components/ServicesModal';
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';
import EditTagsModal from 'components/EditTagsModal';
// Loaders
import ReactLoading from 'react-loading';


const testCameraTableData=[
    {
        'mac':'abc-def-ghi-jkl',
        'name':'Camera 1',
        'network':'Proactive Delhi',
        'tags':'Delhi',
        'services':'Mask Detection, Social Distance',
        'status':'Active',
        'notification_profile':'Profile 1',
        'schedule':'Schedule 1'
    },
    {
        'mac':'mno-pqr-stu-vwx',
        'name':'Camera 2',
        'network':'Proactive Delhi',
        'tags':'Delhi',
        'services':'Mask Detection, Social Distance',
        'status':'Active',
        'notification_profile':'Profile 1',
        'schedule':'Schedule 1'
    }
];

const CardsRow=props=>{
    const cardsData=[
        {
            'title':'Offline',
            'accessor':'offline'
        },
        {
            'title':'Alerting',
            'accessor':'alerting'
        },
        {
            'title':'Online',
            'accessor':'online'
        },
        {
            'title':'Dormant',
            'accessor':'dormant'
        }
    ];
    return (
        <React.Fragment>
            {
                cardsData.map((cardItem)=>(
                    <Col key={cardItem.title}>
                        <Card className='align-items-center text-center card-item'>
                            <Card.Body>
                                <Card.Title className='display-4'>
                                    {
                                        props.loading
                                        ?
                                        <ReactLoading type="bubbles" color="#865c8a"/>
                                        :
                                        <strong>{props.data[cardItem.accessor]}</strong>
                                    }
                                </Card.Title>
                                <Card.Text className='lead'><strong>{cardItem.title}</strong></Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))
            }
        </React.Fragment>
    )
}

const CamerasPage=props=>{
    const history=useHistory();
    const {camerasTableSelectedRows,reloadTable}=useContext(CamerasPageContext);
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    const columns=React.useMemo(()=>[
        {
            Header:'Status',
            accessor:'status'
        },
        {
            Header:'Camera Name',
            accessor:'name'
        },
        {
            Header:'Camera Groups',
            accessor:'tags',
            Cell:props=><span>{props.value[0]===','?props.value.slice(1):props.value}</span>
        },
        {
            Header:'Network',
            accessor:'network'
        },
        {
            Header:'Mac',
            accessor:'mac'
        },
        {
            Header:'Service',
            accessor:'services'
        },
        {
            Header:'Notification Profile',
            accessor:'notification_profile'
        },
        {
            Header:'Schedule',
            accessor:'schedule'
        }
    ],[]);
    const [cameraDetailState,setCameraDetailState]=useState({
        inProgress:true,
        error:false,
        responseCode:false,
        data:[]
        // data:testCameraTableData
    });
    const [cardsDetailState,setCardsDetailState]=useState({
        inProgress:true,
        error:false,
        responseCode:false,
        data:[]
    });
    const [showScheduleModal,setShowScheduleModal]=useState(false);
    const [showNotificationProfileModal,setShowNotificationProfileModal]=useState(false);
    // 
    const [editTagState,setEditTagState]=useState({
        showEditTags:false,
        editTags:[]
    });
    const [removeCameraState,setRemoveCameraState]=useState({
        inProgress:false,
        error:false,
        responseCode:0
    });
    const [showEditServices,setShowEditServices]=useState(false);
    // 
    useEffect(()=>{
        getTableData();
        getCardsData();
    },[]);
    useEffect(()=>{
        if(reloadTableData){
            getTableData();
        }
    },[reloadTableData]);
    // API Call Methods
    const getTableData=async()=>{
        const response=await fetch('/get_cameras/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setCameraDetailState({
                inProgress:false,
                error:false,
                responseCode:200,
                data:responseJSON['response']
            });
            setReloadTableData(false);
        }else{
            setCameraDetailState({
                inProgress:false,
                error:true,
                responseCode:response.status,
                data:[]
            });
            setReloadTableData(false);
        }
    }
    const getCardsData=async()=>{
        const response=await fetch('/card_details/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setCardsDetailState({
                inProgress:false,
                error:false,
                responseCode:200,
                data:responseJSON['status']
            });
        }else{
            setCardsDetailState({
                inProgress:false,
                error:true,
                responseCode:response.status,
                data:[]
            });
        }
    }
    const postRemoveCamera=async()=>{
        const bodyData=await makeBodyDataRemoveCamera();
        const response=await fetch('/remove_cameras/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            alert('CAMERA REMOVE FROM MONITORING : SUCCESS');
            setRemoveCameraState({
                inProgress:false,
                error:false,
                responseCode:response.status
            });
        }else{
            alert('CAMERA REMOVE FROM MONITORING : FAILED');
            setRemoveCameraState({
                inProgress:false,
                error:true,
                responseCode:response.status
            });
        }
    }
    // 
    const makeBodyDataRemoveCamera=async()=>{
        let data={
            'mac_list':[]
        };
        tableSelectedRows.map((row)=>{
            data['mac_list'].push(row['original']['mac']);
        });
        return data;
    }
    // INFO : onClick event handler functions
    const onClickEditTags=()=>{
        setEditTagState({...editTagState,showEditTags:true});
    }
    const onCloseEditTags=()=>{
        setEditTagState({
            editTags:[],
            showEditTags:false
        });
    }
    const onClickAddCameras=()=>{
        history.push('/page/Inventory');
    }
    const onClickRemoveCamera=()=>{
        setRemoveCameraState({...removeCameraState,inProgress:true});
        postRemoveCamera();
    }
    const onClickServices=()=>{
        setShowEditServices(true);
    }
    return (
        <React.Fragment>
            {/* Notifications */}
            <div
            className='notification-div'
            >
                {/* Success Notifications */}
                <NotificationToast
                    Show={removeCameraState.responseCode===200}
                    Heading="SUCCESS"
                    Type="success"
                    Message="Selected cameras removed from monitoring."
                    Delay={5000}
                    AutoHide={true}
                    OnClose={()=>setRemoveCameraState({...removeCameraState,responseCode:0})}
                />
                {/* Error Notifications */}
                <NotificationToast
                    Show={removeCameraState.error}
                    Heading="ERROR"
                    Type="error"
                    Message='Unable to remove selected cameras from monitoring.'
                    AutoHide={false}
                    OnClose={()=>setRemoveCameraState({...removeCameraState,error:false})}
                /> 
            </div>
            <Container fluid>
                <Row className='mt-4'>
                    <CardsRow
                        data={cardsDetailState.data}
                        loading={cardsDetailState.inProgress}
                    />
                </Row>
                <Row className='mt-4'>
                    <Col>
                        <h5 className='primary-font-color'>Cameras Details</h5>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col>
                        <DropdownButton as={ButtonGroup} bsPrefix='btn btn-primary btn-sm button-cameras-page shadow-none' title='Edit'>
                            <Dropdown.Item onClick={onClickEditTags}>Camera Groups</Dropdown.Item>
                            <Dropdown.Item onClick={onClickServices}>Services</Dropdown.Item>
                            <Dropdown.Item onClick={onClickRemoveCamera}>Remove from Monitoring</Dropdown.Item>
                        </DropdownButton>
                        <Button size='sm' className='button-cameras-page ml-1 shadow-none' onClick={()=>setShowScheduleModal(true)}>
                            Schedule
                        </Button>
                        <Button size='sm' className='button-cameras-page ml-1 shadow-none' onClick={()=>setShowNotificationProfileModal(true)}>
                            Notification Profile
                        </Button>
                        <Button size='sm' className='button-cameras-page ml-1' onClick={onClickAddCameras}>
                            Add Cameras
                        </Button>
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col>
                        <CamerasTable Columns={columns} Data={cameraDetailState.data}/>
                    </Col>
                </Row>
            </Container>
            {/* Schedule Settings */}
            <ScheduleModal 
                show={showScheduleModal} 
                onHide={()=>setShowScheduleModal(false)}
                CallbackShowScheduleModal={(value)=>setShowScheduleModal(value)}
            />
            {/* Notification Profile Settings */}
            <NotificationProfileModal 
                show={showNotificationProfileModal} 
                onHide={()=>setShowNotificationProfileModal(false)} 
                CallbackShowProfileModal={(value)=>setShowNotificationProfileModal(value)}
            />
            <EditTagsModal
                show={editTagState.showEditTags}
                onHide={onCloseEditTags}
            />
            <ServicesModal
                show={showEditServices}
                onHide={()=>setShowEditServices(false)}
            />
        </React.Fragment>
    );
}

export default withRouter(CamerasPage);