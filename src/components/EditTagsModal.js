import React,{useState,useEffect,useContext} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
// Custom Components
import InputTags from 'components/InputTags';
import NotificationToast from 'components/NotificationToast';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

const EditTagsModal=(props)=>{
    // CONTEXT VARIABLES
    const {camerasCommonTags,camerasTableSelectedRows,reloadTable}=useContext(CamerasPageContext);
    const [reloadTableData,setReloadTableData]=reloadTable;
    const [commonTags,setCommonTags]=camerasCommonTags;
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    // COMPONENT VARIABLES
    const [newTags,setNewTags]=useState([]);
    const [removedTags,setRemovedTags]=useState([]);
    const [tagsUpdatedState,setTagsUpdatedState]=useState({
        inProgress:false,
        error:false,
        responseCode:0
    });
    // API Call Methods
    const postAddTags=async()=>{
        const bodyData=await makeBodyDataTags(newTags);
        const response=await fetch('/add_tags/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            // alert('CAMERA TAGS ADDED : SUCCESS');
            setTagsUpdatedState({
                inProgress:false,
                error:false,
                responseCode:response.status
            });
            setReloadTableData(true);
        }else{
            // alert('CAMERA TAGS ADDED : FAILED');
            setTagsUpdatedState({
                inProgress:false,
                error:true,
                responseCode:response.status
            });
        }
    }
    const postRemoveTags=async()=>{
        const bodyData=await makeBodyDataTags(removedTags);
        const response=await fetch('/remove_tags/',{
            method:'POST',
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            // alert('CAMERA TAGS ADDED : SUCCESS');
            setTagsUpdatedState({
                inProgress:false,
                error:false,
                responseCode:response.status
            });
            setReloadTableData(true);
        }else{
            // alert('CAMERA TAGS ADDED : FAILED');
            setTagsUpdatedState({
                inProgress:false,
                error:true,
                responseCode:response.status
            });
        }
    }
    // 
    const makeBodyDataTags=(tags)=>{
        let data={
            'mac_list':[],
            'tags':tags
        };
        tableSelectedRows.map((row)=>{
            data['mac_list'].push(row['original']['mac']);
        });
        return data;
    }
    const updateAddTagsCallback=(value)=>{
        setNewTags(value);
    }
    const updateRemoveTagsCallback=(value)=>{
        setRemovedTags(value);
    }
    // INFO : onClick event handlers
    const onClickApply=()=>{
        if(newTags.length!==0){
            console.log('ADD TAGS:',newTags);
            postAddTags();
        }
        if(removedTags.length!==0){
            console.log('REMOVE TAGS:',removedTags);
            postRemoveTags();
        }
    }
    return (
        <React.Fragment>
        {/* Notifications */}
        <div className='notification-div'>
            {/* Success Notifications */}
            <NotificationToast
                Show={tagsUpdatedState.responseCode===200}
                Heading='SUCCESS'
                Type='success'
                Message='Camera Groups updated.'
                AutoHide={true}
                Delay={5000}
                OnClose={()=>setTagsUpdatedState({...tagsUpdatedState,responseCode:0})}
            />
            {/* Error Notifications */}
            <NotificationToast
                Show={tagsUpdatedState.error}
                Heading='ERROR'
                Type='error'
                Message='Unable to update camera groups.'
                AutoHide={false}
                OnClose={()=>setTagsUpdatedState({...tagsUpdatedState,error:false})}
            />
        </div>
        <Modal {...props} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit Camera Groups
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{color:'grey'}}>NOTE: Only common groups for the selected cameras are shown here.</p>
                <InputTags Tags={commonTags} UpdateAddTagsCallback={updateAddTagsCallback} UpdateRemoveTagsCallback={updateRemoveTagsCallback}/>
            </Modal.Body>
            <Modal.Footer>
                <Button size='sm' onClick={onClickApply}>Apply</Button>
            </Modal.Footer>
        </Modal>
        </React.Fragment>
    );
}

export default EditTagsModal;