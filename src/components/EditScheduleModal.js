import React,{useState,useEffect,useContext} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
// Custom Components
import ScheduleSlider from 'components/ScheduleSlider';
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const EditScheduleModal=({scheduleCurrentName,editType,daySlotData,...props})=>{
    const {reloadTable}=useContext(CamerasPageContext);
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [scheduleName,setScheduleName]=useState('');
    const [notificationState,setNotificationState]=useState({
        success:false,
        error:false
    });
    const [data,setData]=useState([
        {
            'day':'monday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'tuesday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'wednesday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'thursday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'friday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'saturday',
            's_time':'00:00',    
            'e_time':'00:00'
        },
        {
            'day':'sunday',
            's_time':'00:00',    
            'e_time':'00:00'
        }
    ]);
    useEffect(()=>{
        if(scheduleCurrentName){
            let name=scheduleCurrentName;
            name=name.charAt(0).toUpperCase()+name.slice(1);
            setScheduleName(name);
        }
        if(daySlotData){
            makeData();
        }
    },[scheduleCurrentName,daySlotData]);

    const postEditSchedule=async()=>{
        const bodyData={
            'sd_name':scheduleName,
            'days':data
        };
        const response=await fetch('/sd_create/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            setNotificationState({
                success:true,
                error:false
            });
            // PENDING  : add loader and notification ;
            // Alternate to page refresh for updating schedule list.
            // window.location.reload();
            setReloadTableData(true);
        }else{
            setNotificationState({...notificationState,
                success:false,
                error:true
            });
        }
    }
    
    const makeData=()=>{
        let currentData=data;
        currentData.map((value,index)=>{
            daySlotData.map((newValue)=>{
                if(newValue['day']===value['day']){
                    currentData[index]=newValue;
                }
            });
        });
        setData(currentData);
    }

    const onChangeScheduleName=(event)=>{
        let name=event.target.value;
        setScheduleName(name);
    }

    const onChangeScheduleTime=(startVal,endVal,dayIndex,day)=>{
        let startHr=startVal;
        let endHr=endVal;
        let startMin='00';
        let endMin='00';
        if(startHr%1===0.5){
            startMin='30';
            startHr=startHr-0.5;
        }
        if(endHr%1===0.5){
            endMin='30';
            endHr=endHr-0.5;
        }
        let startTime=`${startHr}:${startMin}`;
        let endTime=`${endHr}:${endMin}`;
        // Assigning edited time slot values for the day.
        let currentData=data;
        currentData[dayIndex]={
            'day':day,
            's_time':startTime,
            'e_time':endTime
        };
        setData(currentData);
    }

    const onClickApplyChanges=()=>{
        postEditSchedule();
    }

    return (
        <React.Fragment>
        <div
        className='notification-div'
        >
            <NotificationToast
                Show={notificationState.success}
                Heading="SUCCESS"
                Type="success"
                Message="Schedule changes saved."
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setNotificationState({success:false,error:false})}
            />
            <NotificationToast
                Show={notificationState.error}
                Heading="ERROR"
                Type="error"
                Message="Unable to save schedule changes. Try again after refreshing."
                AutoHide={false}
                OnClose={()=>setNotificationState({success:false,error:false})}
            />
        </div>
        <Modal {...props} size='lg' centered>
            <Modal.Header closeButton>
                <Modal.Title>Schedule Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col lg={2}>Schedule Name</Col>
                    <Col lg={6}>
                        <Form.Control 
                            onChange={onChangeScheduleName} 
                            disabled={editType}
                            defaultValue={scheduleName}
                        />
                    </Col>
                </Row>
                {data.map((item,index)=>(
                    <Row className='mt-4 pb-2' key={index}>
                        <Col lg={2}>{item['day'].charAt(0).toUpperCase()+item['day'].slice(1)}</Col>
                        <Col lg={10}>
                            <ScheduleSlider 
                                CallbackForTimeSlot={onChangeScheduleTime} 
                                Day={item['day']} 
                                DayIndex={index}
                                StartTime={item['s_time']} 
                                EndTime={item['e_time']}
                            />
                        </Col>
                        <Col></Col>
                    </Row>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClickApplyChanges}>Apply Changes</Button>
            </Modal.Footer>
        </Modal>
        </React.Fragment>
    );
}


export default EditScheduleModal;