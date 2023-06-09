import React,{useState,useEffect} from 'react';
import {withRouter} from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import Chart from 'react-google-charts';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";
import ReactLoading from 'react-loading';
import "../../node_modules/react-datepicker/dist/react-datepicker.css";
import Spinner from 'react-bootstrap/Spinner';
// Custom Components
import NotificationToast from 'components/NotificationToast';

// const VAR_OVERALL='all';
const VAR_DELHI='delhi';
const VAR_BANGALORE='bangalore';
const VAR_CHENNAI='chennai';
const VAR_MUMBAI='mumbai';

const AnalyticsPage=props=>{
    // State Variables for Filters
    const [notificationState,setNotificationState]=useState({
        applyFilters:''
    });
    const [applyingFilters,setApplyingFilters]=useState(false);
    const [defaultLocationChanged,setDefaultLocationChanged]=useState(false);
    const [lastDaysFilter,setLastDaysFilter]=useState({
        selected:false,
        value:''
    });
    const [dateRangeSelected,setDateRangeSelected]=useState(false);
    const [filters,setFilters]=useState({
        start_date:new Date(),
        end_date:new Date(),
        location:VAR_DELHI
    });
    // State Variables for Gauge Charts
    const [gaugeData,setGaugeData]=useState({
        loadingData:true,
        error:false,
        mask_violations:0,
        social_distancing_violations:0,
        mask_violations_alerts_count:0,
        social_distancing_violations_alerts_count:0
    });
    // State Variables for Bar Chart : Alerts by time of day
    const [alertsByTimeDayData,setAlertsByTimeDayData]=useState({
        loadingData:true,
        error:false,
        data:[["Time", "Mask Detection Alerts","Social Distancing Alerts"],
        ["7am", 0, 0]
        ["8am", 0 ,0]
        ["9am", 0 ,0]
        ["10am", 0, 0],
        ["11am", 0, 0],
        ["12pm", 0, 0],
        ["1pm", 0, 0],
        ["2pm", 0, 0],
        ["3pm", 0, 0],
        ["4pm", 0, 0],
        ["5pm", 0, 0],
        ["6pm",0,0],
        ["7pm",0,0],
        ["8pm",0,0],
        ["9pm",0,0],
        ["10pm",0,0],
        ["11pm",0,0],]
    });
    // State Variables for Pie Chart:- Violations by tags, Violations by cameras :: Bar Chart:- Violations, Notifications Channels
    const [chartGrpData,setChartGrpData]=useState({
        loadingData:true,
        error:false,
        pie_chart_tags:[],
        pie_chart_cameras:[],
        bar_chart_locations:[],
        bar_chart_notification_channels:[]
    });
    //
    useEffect(()=>{
        makeDefaultFilters();
        getChartGrpData(true);
        getGaugeChartData(true);
        getAlertsByTimeData();
    },[]);
    // INFO : API CALL METHODS
    const getChartGrpData=async(makeFilters)=>{
        var apiFilters={};
        if(makeFilters){
            apiFilters=await makeDefaultFilters();
        }else{
            apiFilters=filters;
        }
        const response=await fetch('/analytics_charts/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(apiFilters)
        });
        if(response.status===200){
            const responseJSON=await response.json();
            const data=await transformChartGroupData(responseJSON['charts']);
            console.log(data);
            setChartGrpData({
                loadingData:false,
                error:false,
                pie_chart_tags:data.tagsData,
                pie_chart_cameras:data.camerasData,
                bar_chart_locations:data.locationsData,
                bar_chart_notification_channels:data.channelsData
            });
            if(!makeFilters){
                setNotificationState({
                    applyFilters:'success'
                });
                setApplyingFilters(false);
            }
        }else{
            setChartGrpData({
                loadingData:false,
                error:true,
                pie_chart_tags:[],
                pie_chart_cameras:[],
                bar_chart_locations:[],
                bar_chart_notification_channels:[]
            });
            if(!makeFilters){
                setNotificationState({
                    applyFilters:'error'
                });
                setApplyingFilters(false);
            }
        }
    }
    const getGaugeChartData=async(makeFilters)=>{
        var apiFilters={};
        if(makeFilters){
            apiFilters=await makeDefaultFilters();
        }else{
            apiFilters=filters;
        }
        const response=await fetch('/analytics_dials/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(apiFilters)
        });
        if(response.status===200){
            const responseJSON=await response.json();
            const data=responseJSON['data'];
            console.log(data);
            setGaugeData({
                loadingData:false,
                error:false,
                mask_violations:data['md_count'],
                social_distancing_violations:data['sd_count'],
                mask_violations_alerts_count:data['md_pcount'],
                social_distancing_violations_alerts_count:data['sd_pcount']
            });
            if(!makeFilters){
                setNotificationState({
                    applyFilters:'success'
                });
                setApplyingFilters(false);
            }
        }else{
            setGaugeData({
                loadingData:false,
                error:true,
                mask_violations:0,
                social_distancing_violations:0,
                mask_violations_alerts_count:0,
                social_distancing_violations_alerts_count:0
            });
            if(!makeFilters){
                setNotificationState({
                    applyFilters:'error'
                });
                setApplyingFilters(false);
            }
        }
    }
    const getAlertsByTimeData=async()=>{
        const response=await fetch('/analytics_atod/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify({'location':filters.location})
        });
        if(response.status===200){
            const responseJSON=await response.json();
            const data=await transformAlertsByTimeData(responseJSON['data']);
            setAlertsByTimeDayData({
                loadingData:false,
                error:false,
                data:data
            });
        }else{
            setAlertsByTimeDayData({
                loadingData:false,
                error:true,
                data:[]
            });
        }
    }
    //
    const makeDefaultFilters=async()=>{
        setLastDaysFilter({
            selected:true,
            value:'last 30 days'
        });
        setDateRangeSelected(false);
        let todayDate=new Date();
        let lastWeekDate=new Date(new Date().getTime()-60*60*24*30*1000);
        let startDate=`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()}`;
        let endDate=`${todayDate.getFullYear()}-${todayDate.getMonth()+1}-${todayDate.getDate()}`;
        setFilters({
            start_date:startDate,
            end_date:endDate,
            location:VAR_DELHI
        });
        return ({
            start_date:startDate,
            end_date:endDate,
            location:VAR_DELHI
        });
    }
    const transformChartGroupData=async(rawData)=>{
        // Prepare Violations by Cameras Data : PIE CHART
        let camerasData=[["Cameras", "Violations in %"]];
        rawData.cameras.map((value)=>{
            let temp=[];
            temp.push(value.name);
            temp.push(value.alerts);
            camerasData.push(temp);
        });
        // Prepare Violations by Tags Data : PIE CHART
        let tagsData=[["Tags", "Violations in %"]];
        rawData.tags.map((value)=>{
            let temp=[];
            if(value.tag!==""){
                temp.push(value.tag);
                temp.push(value.alerts);
                tagsData.push(temp);
            }
        });
        // Prepare Violations by Locations Data : BAR CHART
        let locationsData=[["Location", "Mask Detection Alerts","Social Distancing Alerts"]];
        rawData.locations.md.map((value,index)=>{
            let temp=[];
            let locationVal=value.location;
            locationVal=locationVal.charAt(0).toUpperCase()+locationVal.slice(1);
            temp.push(locationVal);
            temp.push(value.alerts);
            if(rawData.locations.sd.length!==0){
                temp.push(rawData.locations.sd[index].alerts);
            }else{
                temp.push(0);
            }
            locationsData.push(temp);
        })
        // Prepare Notification Channels Data : BAR CHART
        let channelsData=[["Notification Channel", "Alert Count",{ role: 'style' }]];
        rawData.channels.map((value)=>{
            let temp=[];
            let channelVal=value.channel;
            channelVal=channelVal.charAt(0).toUpperCase()+channelVal.slice(1);
            temp.push(channelVal);
            temp.push(value.alerts);
            if(value.channel==='webex'){
                temp.push('#00d0ff');
            }else if(value.channel==='whatsapp'){
                temp.push('#45bf63');
            }else if(value.channel==='sms'){
                temp.push('#b3b3b3');
            }else if(value.channel==='email'){
                temp.push('#0077ff');
            }
            channelsData.push(temp);
        });
        return {
            camerasData:camerasData,
            tagsData:tagsData,
            locationsData:locationsData,
            channelsData:channelsData
        };
    }
    const transformAlertsByTimeData=async(rawData)=>{
        let transformedData=[
            ["Time", "Mask Detection Alerts","Social Distancing Alerts"],
            // ["12am", rawData[0].md, rawData[0].sd],
            // ["1am", rawData[1].md, rawData[1].sd],
            // ["2am", rawData[2].md, rawData[2].sd],
            // ["3am", rawData[3].md, rawData[3].sd],
            // ["4am", rawData[4].md, rawData[4].sd],
            // ["5am", rawData[5].md, rawData[5].sd],
            // ["6am", rawData[6].md, rawData[6].sd],
            ["7am", rawData[7].md, rawData[7].sd],
            ["8am", rawData[8].md, rawData[8].sd],
            ["9am", rawData[9].md, rawData[9].sd],
            ["10am", rawData[10].md, rawData[10].sd],
            ["11am", rawData[11].md, rawData[11].sd],
            ["12pm", rawData[12].md, rawData[12].sd],
            ["1pm", rawData[13].md, rawData[13].sd],
            ["2pm", rawData[14].md, rawData[14].sd],
            ["3pm", rawData[15].md, rawData[15].sd],
            ["4pm", rawData[16].md, rawData[16].sd],
            ["5pm", rawData[17].md, rawData[17].sd],
            ["6pm",rawData[18].md,rawData[18].sd],
            ["7pm",rawData[19].md,rawData[19].sd],
            ["8pm",rawData[20].md,rawData[20].sd],
            ["9pm",rawData[21].md,rawData[21].sd],
            ["10pm",rawData[22].md,rawData[22].sd],
            ["11pm",rawData[23].md,rawData[23].sd],
        ];
        return transformedData;
    }
    // INFO: onChange event handlers
    const onChangeFilterLocation=(event)=>{
        const val=event.target.value;
        setDefaultLocationChanged(true);
        setFilters({
            ...filters,
            location:val
        });
    }
    const onChangeFilterLastDays=event=>{
        const val=event.target.value;
        if(val==='custom'){
            setDateRangeSelected(true);
            setLastDaysFilter({
                selected:false,
                value:'custom'
            });
        }else{
            let startDate='';
            let endDate='';
            let currDate=new Date();
            if(val==='today'){
                startDate=`${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                endDate=startDate;
            }else if(val==='last 7 days'){
                let lastWeekDate=new Date(new Date().getTime()-60*60*24*7*1000);
                startDate=`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()}`;
                endDate=`${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
            }else if(val==='last 30 days'){
                let lastThirtyDate=new Date(new Date().getTime()-60*60*24*30*1000);
                startDate=`${lastThirtyDate.getFullYear()}-${lastThirtyDate.getMonth()+1}-${lastThirtyDate.getDate()}`;
                endDate=`${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
            }
            setDateRangeSelected(false);
            setLastDaysFilter({
                selected:true,
                value:val
            });
            setFilters({
                ...filters,
                start_date:startDate,
                end_date:endDate
            });
        }
    }
    const onChangeStartDate=value=>{
        const startDate=`${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`;
        setFilters({
            ...filters,
            start_date:startDate
        });
    }
    const onChangeEndDate=value=>{
        const endDate=`${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`;
        setFilters({
            ...filters,
            end_date:endDate
        });
    }
    // INFO : onClick event handlers
    const onClickApplyFilter=event=>{
        setApplyingFilters(true);
        if(defaultLocationChanged){
            getAlertsByTimeData();
        }
        getChartGrpData(false);
        getGaugeChartData(false);
    }
    // Render
    return (
        <React.Fragment>
        {/* Notifications */}
        <div className='notification-div'>
            {/* Success Notifications */}
            <NotificationToast
                Show={notificationState.applyFilters==='success'}
                Heading='SUCCESS'
                Type='success'
                Message='Filters applied.'
                Delay={5000}
                AutoHide={true}
                OnClose={()=>setNotificationState({...notificationState,applyFilters:''})}
            />
            {/* Error Notifications */}
            <NotificationToast
                Show={notificationState.applyFilters==='error'}
                Heading='ERROR'
                Type='error'
                Message='Unable to apply filters. Try again after refreshing.'
                AutoHide={false}
                OnClose={()=>setNotificationState({...notificationState,applyFilters:''})}
            />
        </div>
        <Container>
            {/* ================================== FILTERS ============================== */}
            <Row className='mt-4'>
                <Col>
                    <Card className='card-item'>
                        <Card.Title className='mt-2 ml-2'>
                            <h5>Filters</h5>
                        </Card.Title>
                        <Card.Body className='mt-0 pt-0 pl-0 ml-2'>
                            <Row>
                                <Col>
                                    <Form>
                                        <Form.Label>Select Location</Form.Label>
                                        <Form.Control
                                            as='select'
                                            custom
                                            onChange={onChangeFilterLocation}
                                            // size='sm'
                                            value={filters.location}
                                        >
                                            {/* <option value={VAR_OVERALL}>All location</option> */}
                                            <option value={VAR_DELHI}>Delhi</option>
                                            <option value={VAR_BANGALORE}>Bangalore</option>
                                            <option value={VAR_MUMBAI}>Mumbai</option>
                                            <option value={VAR_CHENNAI}>Chennai</option>
                                        </Form.Control>
                                    </Form>
                                </Col>
                                {/* <Col>
                                    <Form>
                                        <Form.Control as='select' custom>
                                            <option>Select group tag</option>
                                            <option>Tag1</option>
                                            <option>Tag2</option>
                                            <option>Tag3</option>
                                            <option>Tag4</option>
                                        </Form.Control>
                                    </Form>
                                </Col> */}
                                <Col>
                                    <Form>
                                        <Form.Label>Select date range</Form.Label>
                                        <Form.Control as='select' custom onChange={onChangeFilterLastDays}
                                            value={lastDaysFilter.value}
                                        >
                                            <option value='today'>Today</option>
                                            <option value='last 7 days'>Last 7 Days</option>
                                            <option value='last 30 days'>Last 30 Days</option>
                                            <option value='custom'>Custom</option>
                                        </Form.Control>
                                    </Form>
                                </Col>
                                <Col>
                                    <Form.Label>Start Date</Form.Label>
                                    <DatePicker
                                        className='form-control'
                                        dateFormat='dd MMM yyyy'
                                        selected={new Date(filters.start_date)}
                                        onChange={onChangeStartDate}
                                        disabled={!dateRangeSelected}
                                    />
                                </Col>
                                <Col>
                                    <Form.Label>End Date</Form.Label>
                                    <DatePicker
                                        className='form-control'
                                        dateFormat='dd MMM yyyy'
                                        selected={new Date(filters.end_date)}
                                        onChange={onChangeEndDate}
                                        disabled={!dateRangeSelected}
                                    />
                                </Col>
                            </Row>
                            <Row className='mt-2'>
                                <Col lg={{offset:10}}>
                                    <Button
                                        variant='primary'
                                        size='sm'
                                        className='ml-4'
                                        onClick={onClickApplyFilter} disabled={applyingFilters}
                                    >
                                        {
                                            applyingFilters
                                            ?
                                            <React.Fragment>
                                                <Spinner as='span'
                                                    animation='grow'
                                                    size='sm'
                                                    role='status'
                                                    aria-hidden='true'
                                                />
                                                &nbsp;Applying...
                                            </React.Fragment>
                                            :
                                            'Apply Filters'
                                            }
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* ================================== GAUGE CHARTS ROW ============================== */}
            <Row className='mt-4'>
                <Col>
                    <CardDeck>
                        <Card className='align-items-center card-item'>
                            <Card.Title className='mt-2'>
                                <h6>Mask Violations</h6>
                            </Card.Title>
                            <Card.Body>
                                <Chart
                                    chartType="Gauge"
                                    loader={<ReactLoading type='bars' color='#895070'/>}
                                    data={[
                                    ["Label", "Value"],
                                    ["Alerts", gaugeData.mask_violations],
                                    ]}
                                    options={{
                                    redFrom: 70,
                                    redTo: 100,
                                    yellowFrom: 40,
                                    yellowTo: 70,
                                    greenFrom: 0,
                                    greenTo: 40,
                                    minorTicks: 5,

                                    }}
                                />
                            </Card.Body>
                        </Card>
                        <Card className='align-items-center card-item'>
                            <Card.Title className='mt-2'>
                                <h6>Social Distancing Violations</h6>
                            </Card.Title>
                            <Card.Body>
                                <Chart
                                    chartType="Gauge"
                                    loader={<ReactLoading type='bars' color='#895070'/>}
                                    data={[
                                    ["Label", "Value"],
                                    ["Alerts", gaugeData.social_distancing_violations],
                                    ]}
                                    options={{
                                    redFrom: 70,
                                    redTo: 100,
                                    yellowFrom: 40,
                                    yellowTo: 70,
                                    greenFrom: 0,
                                    greenTo: 40,
                                    minorTicks: 5
                                    }}
                                />
                            </Card.Body>
                        </Card>
                        <Card className='align-items-center card-item'>
                            <Card.Title className='mt-2'>
                                <h6>Mask Violations People Count</h6>
                            </Card.Title>
                            <Card.Body>
                                <Chart
                                    chartType="Gauge"
                                    loader={<ReactLoading type='bars' color='#895070'/>}
                                    data={[
                                    ["Label", "Value"],
                                    ["Alerts", gaugeData.mask_violations_alerts_count],
                                    ]}
                                    options={{
                                    redFrom: 70,
                                    redTo: 150,
                                    yellowFrom: 40,
                                    yellowTo: 70,
                                    greenFrom: 0,
                                    greenTo: 40,
                                    minorTicks: 5
                                    }}
                                />
                            </Card.Body>
                        </Card>
                        <Card className='align-items-center card-item'>
                            <Card.Title className='mt-2'>
                                <h6>Social Distancing Violations<br/>People Count</h6>
                            </Card.Title>
                            <Card.Body className='pt-0'>
                                <Chart
                                    chartType="Gauge"
                                    loader={<ReactLoading type='bars' color='#895070'/>}
                                    data={[
                                    ["Label", "Value"],
                                    ["Alerts", gaugeData.social_distancing_violations_alerts_count],
                                    ]}
                                    options={{
                                    redFrom: 70,
                                    redTo: 100,
                                    yellowFrom: 40,
                                    yellowTo: 70,
                                    greenFrom: 0,
                                    greenTo: 40,
                                    minorTicks: 5
                                    }}
                                />
                            </Card.Body>
                        </Card>
                    </CardDeck>
                </Col>
            </Row>
            {/* ================================== BAR CHART : ALERTS BY TIME OF DAY ============================== */}
            <Row className='mt-2'>
                <Col>
                    <Card className='card-item'>
                        <Card.Body>
                            <Chart
                                width={"100%"}
                                // Change this from px to percentage (%)
                                height={300}
                                chartType="Bar"
                                loader={<ReactLoading type='bars' color='#895070'/>}
                                data={alertsByTimeDayData.data}
                                options={{
                                    isStacked:true,
                                    // Material design options
                                    chart: {
                                        title: `Alerts by Time of Day - ${filters.location.charAt(0).toUpperCase()+filters.location.slice(1)}, ${new Date().toDateString()} `
                                    },
                                    animation:{
                                        startup:true,
                                        duration:500,
                                        easing:'out'
                                    }
                                    // vAxis:{
                                    //     // maxValue:20
                                    //     ticks:[0,2,4,6,10]
                                    // }
                                }}
                                // For tests
                                // rootProps={{ "data-testid": "2" }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* ================================== CHARTS GROUP 3 ============================== */}
            {/* PIE CHARTS : VIOLATIONS BY CAMERA GROUPS(TAGS), VIOLATIONS BY CAMERAS */}
            <Row className='mt-2'>
                <Col>
                    <Card className='align-items-center card-item'>
                        <Card.Title className='mt-2'>
                            <h6>Violations by Camera Groups</h6>
                        </Card.Title>
                        <Card.Body>
                            <Chart
                                width={"100%"}
                                height={"100%"}
                                chartType="PieChart"
                                loader={<div>Loading Chart</div>}
                                data={chartGrpData.pie_chart_tags}
                                options={{
                                    // title: "Violations by tags"
                                }}
                                // rootProps={{ "data-testid": "1" }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className='align-items-center card-item'>
                        <Card.Title className='mt-2'>
                            <h6>Violations by Cameras</h6>
                        </Card.Title>
                        <Card.Body>
                            <Chart
                                width={"100%"}
                                height={"100%"}
                                chartType="PieChart"
                                loader={<div>Loading Chart</div>}
                                data={chartGrpData.pie_chart_cameras}
                                options={{
                                    // title: "Violations by tags"
                                }}
                                // rootProps={{ "data-testid": "1" }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* BAR CHARTS : VIOLATIONS, NOTIFICATION CHANNELS */}
            <Row className='mt-2'>
                <Col>
                    <Card className='align-items-center card-item'>
                        <Card.Title className='mt-2'>
                            <h6>Violations by Locations</h6>
                        </Card.Title>
                        <Card.Body>
                            <Chart
                                width={"100%"}
                                height={"100%"}
                                chartType="Bar"
                                loader={<div>Loading Chart</div>}
                                data={chartGrpData.bar_chart_locations}
                                options={{
                                    isStacked:true
                                    // title: "Violations by tags"
                                }}
                                // rootProps={{ "data-testid": "1" }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className='align-items-center card-item'>
                        <Card.Title className='mt-2'>
                            <h6>Notification Channels</h6>
                        </Card.Title>
                        <Card.Body>
                            <Chart
                                width={"100%"}
                                height={"100%"}
                                chartType="ColumnChart"
                                loader={<div>Loading Chart</div>}
                                data={chartGrpData.bar_chart_notification_channels}
                                options={{
                                    // title: "Violations by tags"
                                    legend: { position: 'none' },
                                    vAxes:{
                                        0:{title:'Alerts',titleTextStyle:{
                                            italic:false,
                                            fontSize:20
                                        }}
                                    }
                                }}
                                // rootProps={{ "data-testid": "1" }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        </React.Fragment>
    );
}

export default withRouter(AnalyticsPage);