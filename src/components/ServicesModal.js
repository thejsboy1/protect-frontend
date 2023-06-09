import React,{useState,useEffect,useContext} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
// Custom Components
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const SOCIAL_DISTANCING='Social Distancing';
const MASK_DETECTION='Mask Detection';
const BOTH='Social Distancing+Mask Detection';

const ServicesModal=props=>{
    const {camerasTableSelectedRows,reloadTable}=useContext(CamerasPageContext);
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [camerasMacOnService,setCamerasMacOnService]=useState({
        social_distancing:[],
        mask_detection:[]
    });
    const [newServices,setNewServices]=useState([]);
    const [removeService,setRemoveService]=useState([]);
    const [servicesUpdateState,setServicesUpdateState]=useState({
        inProgress:false,
        error:false,
        responseCode:0
    });
    const [selectedMacList,setSelectedMacList]=useState([]);
    useEffect(()=>{
        let macList=[];
        let macSD=[];
        let macMD=[];
        tableSelectedRows.map((row)=>{
            let servicesRow=row['original']['services'];
            servicesRow=servicesRow.split('+');
            servicesRow.map((service)=>{
                if(service===MASK_DETECTION){
                    macMD.push(row['original']['mac']);
                }else if(service===SOCIAL_DISTANCING){
                    macSD.push(row['original']['mac']);
                }
            });
            macList.push(row['original']['mac']);
        });
        setSelectedMacList(macList);
        setCamerasMacOnService({
            social_distancing:macSD,
            mask_detection:macMD
        });
    },[tableSelectedRows]);
    // API Call Methods
    const postAddServices=async()=>{
        const bodyData=await makeBodyDataAdd();
        const response=await fetch('/add_services/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            // alert('CAMERA SERVICES ADDED : SUCCESS');
            setServicesUpdateState({
                inProgress:false,
                error:false,
                responseCode:response.status
            });
            setReloadTableData(true);
        }else{
            // alert('CAMERA SERVICES ADDED : FAILED');
            setServicesUpdateState({
                inProgress:false,
                error:true,
                responseCode:response.status
            });
        }
    }
    const postRemoveServices=async(remService)=>{
        const bodyData=await makeBodyDataRemove(remService);
        const response=await fetch('/remove_services/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            // alert('CAMERA SERVICES REMOVED : SUCCESS');
            setServicesUpdateState({
                inProgress:false,
                error:false,
                responseCode:response.status
            });
            setReloadTableData(true);
        }else{
            // alert('CAMERA SERVICES REMOVED : FAILED');
            setServicesUpdateState({
                inProgress:false,
                error:true,
                responseCode:response.status
            });
        }
    }
    // 
    const makeBodyDataRemove=(remService)=>{
        let data={
            'mac_list':selectedMacList,
            'services':remService
        };
        return data;
    }
    const makeBodyDataAdd=()=>{
        let data={
            'mac_list':selectedMacList,
            'services':newServices
        };
        return data;
    }
    // INFO: onClick event handlers
    const onClickApply=()=>{
        postAddServices();
    }
    const onServiceSelect=(event)=>{
        let valueSelected=event.target.value;
        valueSelected=valueSelected.split(',');
        console.log(valueSelected);
        setNewServices(valueSelected);
    }
    const onClickRemove=(service)=>{
        setRemoveService([service]);
        postRemoveServices([service]);
    }
    // 
    return (
        <React.Fragment>
        {/* Notifications */}
        <div className='notification-div'>
            {/* Success Notifications */}
            <NotificationToast
                Show={servicesUpdateState.responseCode===200}
                Heading='SUCCESS'
                Type='success'
                Message='Services updated.'
                AutoHide={true}
                Delay={5000}
                OnClose={()=>setServicesUpdateState({...servicesUpdateState,responseCode:0})}
            />
            {/* Error Notifications */}
            <NotificationToast
                Show={servicesUpdateState.error}
                Heading='ERROR'
                Type='error'
                Message='Unable to updated services. Try again after refreshing.'
                AutoHide={false}
                OnClose={()=>setServicesUpdateState({...servicesUpdateState,error:false})}
            />
        </div>
        <Modal {...props} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                   Edit Services
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Card className='text-center card-item mt-2'>
                            <Card.Body>
                                <Card.Title>
                                    Social Distancing
                                </Card.Title>
                                <Card.Text>
                                    Running on
                                </Card.Text>
                                <Card.Text className='display-4'>
                                    {camerasMacOnService.social_distancing.length}
                                </Card.Text>
                                <Card.Text>cameras</Card.Text>
                                <Button size='sm' onClick={()=>onClickRemove(SOCIAL_DISTANCING)}> 
                                    Remove Service
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card className='text-center card-item mt-2'>
                            <Card.Body>
                                <Card.Title>
                                    Mask Detection
                                </Card.Title>
                                <Card.Text>
                                    Running on
                                </Card.Text>
                                <Card.Text className='display-4'>
                                    {camerasMacOnService.mask_detection.length}
                                </Card.Text>
                                <Card.Text>cameras</Card.Text>
                                <Button size='sm' onClick={()=>onClickRemove(MASK_DETECTION)}> 
                                    Remove Service
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className='mt-2 '>
                    <Col>Select services to apply to all cameras:</Col>
                </Row>
                <Row className='mt-1'>
                    <Col>
                        <Form>
                            <Form.Control as='select' custom onChange={onServiceSelect}> 
                                <option>None</option>
                                <option value={SOCIAL_DISTANCING}>Social Distancing</option>
                                <option value={MASK_DETECTION}>Mask Detection</option>
                                <option value={BOTH}>Social Distance, Mask Detection</option>
                            </Form.Control>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button size='sm' onClick={onClickApply}>Apply</Button>
            </Modal.Footer>
        </Modal>
        </React.Fragment>
    );
}

export default ServicesModal;