import React from 'react';
import Toast from 'react-bootstrap/Toast';
import Badge from 'react-bootstrap/Badge';
import 'styles/components/notificationToast.css';

const NotificationToast=props=>{
    const onClose=()=>{
        props.OnClose();
    }
    return (
        <React.Fragment>
            <Toast
                show={props.Show}
                delay={props.Delay}
                autohide={props.AutoHide}
                onClose={onClose}
            >
                <Toast.Header
                    // className={
                    //     props.Type==='success'
                    //     ?
                    //     'text-success'
                    //     :
                    //     props.Type==='info'
                    //     ?
                    //     'text-warning'
                    //     :
                    //     props.Type==='error'
                    //     ?
                    //     'text-danger'
                    //     :
                    //     ''
                    // }
                >
                    <strong className='mr-auto'><Badge pill variant={props.Type==='error'?'danger':props.Type}>{props.Heading}</Badge></strong>
                </Toast.Header>
                <Toast.Body>
                    {props.Message}
                </Toast.Body>
            </Toast>
        </React.Fragment>
    );
}

export default NotificationToast;