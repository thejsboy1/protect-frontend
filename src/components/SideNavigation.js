import React,{useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
// import {withRouter} from 'react-router-dom';
import {useHistory} from 'react-router';
import sideNavCameraIcon from 'icons/side_nav_camera.png';
// Style Sheet
import 'styles/components/sideNavigation.css';

const styles={
    navigationIcons:{
        color:"#865c8a"
    }
}

const ItemNavigation=(props)=>{
    return (
        <Container fluid 
        style={{height:"7vh",padding:0}}
        >
            <Row noGutters
            className="d-flex h-100 w-100 align-items-center"
            >   
                <Button variant="link" block 
                className={props.CurrentLocation===props.Location?'text-left side-navigation-item-active':'text-left side-navigation-item'}
                onClick={props.OnClick}>
                    <h6 className="primary-font-color" style={{fontWeight:400}}>
                        {props.Icon}&nbsp;&nbsp;&nbsp;{props.Title}
                    </h6>
                </Button>
            </Row>
        </Container>
    );
}

const SideNavigation=(props)=>{
    const history=useHistory();
    const navigationItemsList=[
        {
            "Title":"Home",
            "Location":"/page/home",
            "Icon":<span style={styles.navigationIcons}><i className="fas fa-home"/></span>,
            "OnClick":()=>{
                history.push('/page/home');
            }
        },
        {
            "Title":"Analytics",
            "Location":"/page/analytics",
            "Icon":<span style={styles.navigationIcons}><i className="fas fa-chart-line"/></span>,
            "OnClick":()=>{
                history.push('/page/analytics');
            }
        },
        {
            "Title":"Cameras",
            "Location":"/page/cameras",
            // "Icon":<span style={styles.navigationIcons}><i className="fas fa-home"/></span>
            "Icon":<span style={styles.navigationIcons}><img src={sideNavCameraIcon} width="20" height="20"/></span>,
            "OnClick":()=>{
                history.push('/page/cameras');
            }
        },
        {
            "Title":"Inventory",
            "Location":"/page/inventory",
            "Icon":<span style={styles.navigationIcons}><i className="fas fa-home"/></span>,
            "OnClick":()=>{
                history.push('/page/inventory');
            }
        },
        {
            "Title":"Admin Profile",
            "Location":"/page/adminProfile",
            "Icon":<span style={styles.navigationIcons}><i className="fas fa-user-alt"/></span>,
            "OnClick":()=>{
                history.push('/page/adminProfile');
            }
        }
    ];
    return (
        <Container fluid className='side-navbar-container side-navbar-shadow'>   
            {navigationItemsList.map((item)=>{
                return <ItemNavigation Title={item.Title} Icon={item.Icon} Location={item.Location} key={item.Title} OnClick={item.OnClick} CurrentLocation={history.location.pathname}/>
            })}
       </Container>
    );
}

export default SideNavigation;