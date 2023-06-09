import React,{useState,useContext,useEffect} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// Custom Components
import EditScheduleModal from 'components/EditScheduleModal';
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const testScheduleAPIData=[
    {
        'sd_name':'reception',
        'days':[
            {
                'day':'monday',
                's_time':'7:00',
                'e_time':'20:00'
            },
            {
                'day':'tuesday',
                's_time':'7:00',
                'e_time':'20:00'
            },
            {
                'day':'wednesday',
                's_time':'7:00',
                'e_time':'20:00'
            },
            {
                'day':'friday',
                's_time':'7:00',
                'e_time':'20:00'
            },
            {
                'day':'saturday',
                's_time':'7:00',
                'e_time':'23:00'
            }
        ]
    }
];

const ScheduleCard=({schedule,selected,onEditSchedule,onSelectSchedule,onDeleteSchedule,...props})=>{
    return (
    <Col className='mt-2' lg={4} key={props.key}>
        <Card className='text-center card-item mt-2'>
            <Card.Body>
                <Card.Title>
                    <h4>
                        {schedule['sd_name'].charAt(0).toUpperCase()+schedule['sd_name'].slice(1)}
                        {/* {scheduleName.charAt(0).toUpperCase()+scheduleName.slice(1)} */}
                    </h4>
                </Card.Title>
                <Card.Text>
                    Schedule used by 3 Cameras
                </Card.Text>
                <Button size='sm' onClick={()=>onDeleteSchedule(schedule['sd_name'])}>Delete</Button>
                <Button size='sm' className='ml-1' onClick={()=>onEditSchedule(schedule)}>Edit</Button>
                <Button 
                    size='sm' 
                    className='ml-1' 
                    onClick={()=>onSelectSchedule(schedule['sd_name'])}
                    disabled={selected}
                >{selected?'Selected':'Select'}</Button>
            </Card.Body>
        </Card>
    </Col>    
    );
}


const ScheduleModal=({CallbackShowScheduleModal,...props})=>{
    // Using Context
    const {camerasTableSelectedRows,reloadTable}=useContext(CamerasPageContext);
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    const [reloadTableData,setReloadTableData]=reloadTable;

    // 
    const [notificationState,setNotificationState]=useState({
        selectSchedule:'',
        deleteSchedule:''
    });
    const [scheduleModalState,setScheduleModalState]=useState({
       loadingData:true, 
       error:false,
        // data:testScheduleAPIData
       data:[]
    });
    const [selectedSchedules,setSelectedSchedules]=useState([]);
    const [showEditScheduleModal,setShowEditScheduleModal]=useState(false);
    const [showCreateScheduleModal,setShowCreateScheduleModal]=useState(false);
    const [editScheduleModalData,setEditScheduleModalData]=useState([]);
    // Run once only.
    useEffect(()=>{
        getScheduleData();
    },[]);

    // INFO: API call methods
    const getScheduleData=async()=>{
        const response=await fetch('/schedule/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setScheduleModalState({
                loadingData:false,
                error:false,
                data:responseJSON['data']
            });
        }else{
            setScheduleModalState({
                loadingData:false,
                error:true,
                data:[]            
            });
        }        
    }
    const postSelectSchedule=async()=>{
        const bodyData=await makeSelectScheduleData();
        const response=await fetch('/select_schedule/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            // PENDING : Add a loader ; Alternate to page reload for refreshing 
            // data in table
            setNotificationState({...notificationState,selectSchedule:'success'});
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState({...notificationState,selectSchedule:'error'});
        }        
    }
    const postDeleteSchedule=async(scheduleName)=>{
        const response=await fetch('/sd_delete/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify({"sd_name":scheduleName})
        });
        if(response.status===200){
            // PENDING : Add a loader and notification prompt; Alternate to page reload for refreshing 
            // data in table
            setNotificationState({...notificationState,deleteSchedule:'success'});
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState({...notificationState,deleteSchedule:'error'});
        }        
    }
    // 
    const makeSelectScheduleData=async()=>{
        let data={
            'mac_list':[],
            'schedules':selectedSchedules
        };
        tableSelectedRows.map((row)=>{
            data['mac_list'].push(row['original']['mac']);
        });
        return data;
    }
    // INFO: onClick event handlers
    const onEditSchedule=(scheduleData)=>{
        setShowEditScheduleModal(true);
        setEditScheduleModalData(scheduleData);
        CallbackShowScheduleModal(false);
    }
    const onCreateSchedule=()=>{
        setShowCreateScheduleModal(true);
        CallbackShowScheduleModal(false);
    }
    const onSelectSchedule=(scheduleName)=>{
        let currentSelected=selectedSchedules;
        currentSelected.push(scheduleName);
        setSelectedSchedules([...currentSelected]);
    }
    const onDeleteSchedule=(scheduleName)=>{
        postDeleteSchedule(scheduleName);
        CallbackShowScheduleModal(false);
    }
    const onClickScheduleApply=()=>{
        // PENDING : Add API call to backend to tell for changes here.
        CallbackShowScheduleModal(false);
        // INFO: After API call success, Refresh Page for Getting Latest Data.
        // window.location.reload();
        postSelectSchedule();
        console.log('Apply These Schedules:',selectedSchedules);
        console.log('To these Mac Address:',tableSelectedRows);
    }
    return (
        <React.Fragment>
            {/* Notifications */}
            <div
            className='notification-div'
            >
                {/* Success Notifications */}
                <NotificationToast
                    Show={notificationState.selectSchedule==='success'}
                    Heading="SUCCESS"
                    Type="success"
                    Message="Schedule applied to cameras."
                    Delay={5000}
                    AutoHide={true}
                    OnClose={()=>setNotificationState({...notificationState,selectSchedule:''})}
                />
                <NotificationToast
                    Show={notificationState.deleteSchedule==='success'}
                    Heading="SUCCESS"
                    Type="success"
                    Message="Schedule deleted."
                    Delay={5000}
                    AutoHide={true}
                    OnClose={()=>setNotificationState({...notificationState,deleteSchedule:''})}
                />
                {/* Error Notifications */}
                <NotificationToast
                    Show={notificationState.selectSchedule==='error'}
                    Heading="ERROR"
                    Type="error"
                    Message="Unable to apply schedule. Try again after refreshing."
                    AutoHide={false}
                    OnClose={()=>setNotificationState({...notificationState,selectSchedule:''})}
                />
                <NotificationToast
                    Show={notificationState.deleteSchedule==='error'}
                    Heading="ERROR"
                    Type="error"
                    Message="Unable to delete schedule. Try again after refreshing."
                    AutoHide={false}
                    OnClose={()=>setNotificationState({...notificationState,deleteSchedule:''})}
                />
                <NotificationToast
                    Show={scheduleModalState.error}
                    Heading="ERROR"
                    Type="error"
                    Message="Unable to get schedule list. Try again after refreshing."
                    AutoHide={false}
                    OnClose={()=>setScheduleModalState({...scheduleModalState,error:false})}
                />
            </div>
            <Modal {...props} size='lg' centered onExited={()=>setSelectedSchedules([])}> 
                <Modal.Header closeButton>
                    <Modal.Title>
                        Schedule
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Button size='sm' onClick={onCreateSchedule}>Create</Button>
                    <Row>
                        {scheduleModalState.data.map((schedule)=>(
                           <ScheduleCard 
                            schedule={schedule} 
                            selected={selectedSchedules.includes(schedule['sd_name'])}
                            onEditSchedule={onEditSchedule}
                            onSelectSchedule={onSelectSchedule}
                            onDeleteSchedule={onDeleteSchedule}
                            key={schedule['sd_name']}
                           />
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onClickScheduleApply}>Apply</Button>
                </Modal.Footer>
            </Modal>
            <EditScheduleModal 
                daySlotData={editScheduleModalData['days']} 
                scheduleCurrentName={editScheduleModalData['sd_name']}
                editType={true} 
                show={showEditScheduleModal} 
                onHide={()=>{
                    setShowEditScheduleModal(false);
                    setEditScheduleModalData([]);
                    CallbackShowScheduleModal(true);
                }}
            />
            <EditScheduleModal
                editType={false} 
                show={showCreateScheduleModal} 
                onHide={()=>{
                    setShowCreateScheduleModal(false);
                    CallbackShowScheduleModal(true);
                }}
            />
        </React.Fragment>
    );
}

export default ScheduleModal;