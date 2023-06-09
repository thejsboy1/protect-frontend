import React,{useState,useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import {withRouter} from 'react-router';
// Icon Imports
import cameraIcon from 'icons/side_nav_camera.png';
import locationIcon from 'icons/home_location_icon.png';
import areaIcon from 'icons/home_area_icon.png';
import alertIcon from 'icons/home_alert_icon.png';
// Maps Component
import MapComponent from 'components/MapComponent';
// Style Sheet
import 'styles/pages/homePage.css';
// Loading
import ReactLoading from 'react-loading';

const HomePage=props=>{
    const cardsData=[
        {
            "title":"Cameras",
            "icon":cameraIcon,
            "accessor":"cameras"
        },
        {
            "title":"Locations",
            "icon":locationIcon,
            "accessor":"locations"
        },
        {
            "title":"Alerts",
            "icon":alertIcon,
            "accessor":"alerts"
        },
        {
            "title":"Area Covered",
            "icon":areaIcon,
            "accessor":"area"
        }
    ];
    const [cardsState,setCardsState]=useState({
        loadingData:true,
        error:false,
        values:{}
    });
    const [mapData,setMapData]=useState({
        loadingData:true,
        error:false,
        data:[]
    });
    useEffect(()=>{
        getCardsValues();
        getMapData();
    },[]);
    // INFO : API METHODS
    const getCardsValues=async()=>{
        const response=await fetch('/home_cards/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setCardsState({
                loadingData:false,
                error:false,
                values:responseJSON['data']
            });
        }else{
            setCardsState({
                loadingData:false,
                error:true,
                values:[]
            });
        }
    }
    const getMapData=async()=>{
        const response=await fetch('/get_coordinates/',{
            method:'GET',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            const transformData=await transformMapData(responseJSON['response']);
            setMapData({
                loadingData:false,
                error:false,
                data:transformData
            });
        }else{
            setMapData({
                loadingData:false,
                error:true,
                data:[]
            });
        }
    }
    // 
    const transformMapData=async(rawData)=>{
        let temp=[];
        rawData.map((value)=>{
            for(let i=0;i<value.alerts;i++){
                temp.push({lat:value['lat'],lng:value['lng']});
            }
        });
        return temp;
    }
    // 
    return (
        <Container fluid>
            <Row className='mt-2'>
                <Col>
                    <CardDeck>
                        {cardsData.map((cardItem)=>{
                            return (
                                <Card className='card-item' key={cardItem.title}>
                                    <Card.Body className="pt-2">
                                        <Card.Title>{cardItem.title}</Card.Title>
                                            <Row>
                                                <Col>
                                                    <Card.Img className="card-icon align-items-center " src={cardItem.icon} alt={cardItem.title}/>
                                                </Col>
                                                <Col>
                                                    <Card.Text className='display-4'>
                                                        {
                                                            cardsState.loadingData
                                                            ?
                                                            <ReactLoading type="bubbles" color="#865c8a"/>
                                                            :
                                                            <React.Fragment>
                                                                {cardsState.values[cardItem.accessor]}<h6>{cardItem.title==="Area Covered"?"SQ FT":null}</h6>
                                                            </React.Fragment>
                                                        }           
                                                    </Card.Text>
                                                </Col>
                                            </Row>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </CardDeck>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Alerts Map<br/><small className='text-muted'>{new Date().toDateString()}</small></Card.Title>
                            {
                                mapData.loadingData
                                ?
                                <ReactLoading type="bubbles" color="#865c8a" className='mx-auto'/>
                                :
                                <MapComponent ClusteringData={mapData.data}/>
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default withRouter(HomePage);