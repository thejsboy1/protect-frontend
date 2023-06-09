import React from 'react';
import {withRouter} from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {useHistory} from 'react-router';
import 'styles/components/pageHeader.css';

const PageHeader=(props)=>{
    const history=useHistory();
    const onClickLogout=()=>{
        sessionStorage.clear();
        history.push('/');
    }
    return (
        <Container fluid 
        className="primary-theme-color"
        >
            <Row className="align-items-center justify-content-center page-header pt-2 pb-2">
                <Col 
                    className='p-0 text-left' 
                >
                    <h6 style={{color:"white",fontWeight:600}}>ProTect Dashboard</h6>
                </Col>
                <Col 
                    className='p-0 text-center'
                >
                    <h6 style={{color:"white",fontWeight:400,padding:0}}>{sessionStorage.getItem('org_name')}</h6>
                </Col>
                <Col
                    className='text-right mr-2' 
                >
                    <Button
                    className='button-logout shadow-none'
                    size='sm'
                    onClick={onClickLogout}
                    >Logout</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default PageHeader;