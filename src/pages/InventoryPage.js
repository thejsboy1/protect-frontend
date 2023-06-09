import React,{useState,useEffect,useContext} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import {withRouter} from 'react-router';
import { useTable,useSortBy,useRowSelect } from 'react-table';
import BTable from 'react-bootstrap/Table';
import FullPageLoader from 'components/FullPageLoader';
// Custom Components
import NotificationToast from 'components/NotificationToast';
// Style Sheet
import 'styles/pages/inventoryPage.css';
const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])
  
      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
        )
    }
)

const Table=({Columns,Data,SetSelectedRows})=>{
    const tableInstance=useTable({columns:Columns,data:Data},useSortBy,
        useRowSelect,hooks=>{
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                  id: 'selection',
                  // The header can use the table's getToggleAllRowsSelectedProps method
                  // to render a checkbox
                  Header: ({ getToggleAllRowsSelectedProps }) => (
                    <div>
                      <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                    </div>
                  ),
                  // The cell can use the individual row's getToggleRowSelectedProps method
                  // to the render a checkbox
                  Cell: ({ row }) => (
                    <div>
                      <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                    </div>
                  ),
                },
                ...columns,
            ])
        });
    const { getTableProps, headerGroups, rows, prepareRow,selectedFlatRows } = tableInstance;    
    useEffect(()=>{
        SetSelectedRows(selectedFlatRows);
    },[selectedFlatRows]);
    return (
        <BTable striped bordered hover size="sm" {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </BTable>
    );
}

const InventoryPage=props=>{
    const columns=React.useMemo(()=>[
        {
            Header:'Camera Name',
            accessor:'camera_name'
        },
        {
            Header:'Model',
            accessor:'model'
        },
        {
            Header:'Name',
            accessor:'name'
        },
        {
            Header:'Country',
            Cell:<span>India</span>
        },
        {
            Header:'MAC',
            accessor:'mac'
        },
        {
            Header:'Serial Number',
            accessor:'serial_number'
        }
    ],[]);
    const [selectedRows,setSelectedRows]=useState([]);
    const [dataState,setDataState]=useState({
        data:[],
        inProgress:false,
        error:false,
        responseCode:0
    });
    const [addCameraState,setAddCameraState]=useState({
        inProgress:false,
        error:false,
        responseCode:0
    });
    useEffect(()=>{
        setDataState({...dataState,
            inProgress:true
        });
        getInventoryData();
    },[]);
    // INFO : API CALL FUNCTIONS
    const getInventoryData=async()=>{
        const response=await fetch("/fetch_inventory/",{
            method:"GET",
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            const responseJSON=await response.json();
            setDataState({
                data:responseJSON['resp'],
                inProgress:false,
                error:false,
                responseCode:200
            })  
        }else{
            setDataState({
                data:[],
                inProgress:false,
                error:true,
                responseCode:400
            });
        }
    }
    const getRefreshInventoryData=async()=>{
        const response=await fetch("/refresh_inventory/",{
            method:"GET",
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            }
        });
        if(response.status===200){
            getInventoryData();
        }else{
            setDataState({
                data:[],
                inProgress:false,
                error:true,
                responseCode:400
            });
        }
    }
    const postAddCameras=async()=>{
        const bodyData=await makeBodyDataAddCamera();
        const response=await fetch("/add_cameras/",{
            method:"POST",
            headers:{
                Authorization:`Token ${sessionStorage.getItem('token')}`
            },
            body:JSON.stringify(bodyData)
        });
        if(response.status===200){
            alert('CAMERAS ADD TO MONITORING SUCESS');
            setAddCameraState({
                inProgress:false,
                error:false,
                responseCode:200
            })  
        }else{
            alert('CAMERAS ADD TO MONITORING FAILED');
            setAddCameraState({
                inProgress:false,
                error:true,
                responseCode:400
            });
        }
    }
    // 
    const makeBodyDataAddCamera=()=>{
        let data={
            'mac_list':[]
        };
        selectedRows.map((row)=>{
            data['mac_list'].push(row['original']['mac']);
        });
        return data;
    }
    // INFO: onClick event handlers
    const onClickRefresh=()=>{
        // window.location.reload();
        setDataState({
            ...dataState,
            inProgress:true
        });
        getRefreshInventoryData();
    }
    const onClickAddToMonitoring=()=>{
        postAddCameras();
    }
    return (
        <React.Fragment>
            {/* Notifications */}
            <div
            className='notification-div'
            >
                {/* Error Notifications */}
                <NotificationToast 
                    Show={dataState.error} 
                    Heading="ERROR"
                    Type="error" 
                    Message="Unable to get data for inventory. Try refreshing (F5) page." 
                    AutoHide={false}
                    OnClose={()=>setDataState({...dataState,error:false})}
                />
                <NotificationToast 
                    Show={addCameraState.error} 
                    Heading="ERROR"
                    Type="error" 
                    Message="Unable to add selected cameras to monitoring. Try again afer refreshing (F5) page." 
                    AutoHide={false}
                    OnClose={()=>setAddCameraState({...addCameraState,error:false})}
                />
                {/* Success Notifications */}
                <NotificationToast 
                    Show={addCameraState.responseCode===200} 
                    Heading="SUCCESS"
                    Type="success" 
                    Message="Selected cameras added to monitoring." 
                    AutoHide={true}
                    Delay={5000}
                    OnClose={()=>setAddCameraState({...addCameraState,responseCode:0})}
                />
                <NotificationToast 
                    Show={dataState.responseCode===200} 
                    Heading="SUCCESS"
                    Type="success" 
                    Message="Inventory refreshed, data updated from Meraki." 
                    AutoHide={true}
                    Delay={5000}
                    OnClose={()=>setDataState({...dataState,responseCode:0})} 
                />
            </div>
            <FullPageLoader Loading={dataState.inProgress}/>
            <Container fluid className="content-container">
                <Row>
                    <h5 className='primary-font-color'>Inventory</h5>
                </Row>
                <Row>
                    <Col className='p-0'>
                        <Button size="sm" className="page-button shadow-none" onClick={onClickRefresh}>Refresh</Button>
                        <Button size="sm" className="page-button ml-1 shadow-none" onClick={onClickAddToMonitoring}>Add to Monitoring</Button>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Table Columns={columns} Data={dataState.data} SetSelectedRows={(value)=>setSelectedRows(value)}/>
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default withRouter(InventoryPage);