import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// 
import PageHeader from 'components/PageHeader';
import SideNavigation from 'components/SideNavigation';

const PageLayout=(props)=>{
    return (
        // <GlobalContextProvider>
            <Container fluid className='page-layout-container'>
                <Row>
                    <PageHeader/>
                </Row>
                <Row noGutters style={{height:"90vh"}}
                >
                    <Col xs lg={2}>
                        <SideNavigation/>
                    </Col>
                    <Col xs lg={10} 
                    // style={{backgroundColor:"blue"}}
                    >
                        {props.Content}
                    </Col>
                </Row>
            </Container>
        // </GlobalContextProvider>
    );
}

export default PageLayout;