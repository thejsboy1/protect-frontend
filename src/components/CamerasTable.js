import React,{useEffect,useContext} from 'react';
import {useTable,useSortBy,useRowSelect} from 'react-table';
import BTable from 'react-bootstrap/Table';
// Context
import {CamerasPageContext} from 'pages/CamerasPageContext';

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


const CamerasTable=({Columns,Data})=>{
    // Using Context
    const {camerasTableSelectedRows,camerasCommonTags}=useContext(CamerasPageContext);
    const [tableSelectedRows,setTableSelectedRows]=camerasTableSelectedRows;
    const [commonTags,setCommonTags]=camerasCommonTags;
    const [rowData,setRowData]=React.useState([]);
    // 
    const tableInstance=useTable({
            columns:Columns,data:Data
        },
        useSortBy,
        useRowSelect,
        hooks=>{
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
                      <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} 
                      onClick={()=>{
                        // onRowSelected(row.original,row.getToggleRowSelectedProps().checked)}
                        setRowData(row.original);
                        }
                        } 
                      />
                    </div>
                  ),
                },
                ...columns,
            ])
        }
    );
    const { getTableProps,getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows} = tableInstance;   
    useEffect(()=>{
        setTableSelectedRows(selectedFlatRows);
        if(selectedFlatRows.length===1){
            // IF SELECTED ROW === 1 ; PUSH SELECTED ROWS TAGS TO COMMON TAGS
            // onRowSelected(true);
            onRowSelectedExperimental(selectedFlatRows);
        }
        else if(selectedFlatRows.length===0){
            // IF SELECTED ROW === 0 ; RESET COMMON TAGS
            setCommonTags([]);
        }
        else{
            // IF SELECTED ROW > 1 ; PUSH ONLY COMMON TAGS
            // onRowSelected(false);
            onRowSelectedExperimental(selectedFlatRows);
        }
    },[selectedFlatRows]);
    const onRowSelectedExperimental=(rows)=>{
        let common=[];
        rows.map((row,index)=>{
            let t=row['original']['tags'];
            t=t.split(',');
            if(index===0){
                common=t;
            }else{
                let temp=[];
                t.map((tag)=>{
                    if(common.includes(tag)&&tag!==''){
                        temp.push(tag);
                    }
                });
                common=temp;
            }
        });
        setCommonTags(common);
    }
    const onRowSelected=(firstSelection)=>{
        let rowTags=rowData.tags===undefined?'':rowData.tags;
        let newCommonTags=[];
        let currentCommonTags=commonTags;
        console.log('CURRENT COMMON TAGS:',currentCommonTags,currentCommonTags.length); 
        console.log('SELECTED ROW TAGS:',rowTags);
        if(firstSelection){
            // IF COMMON TAGS === EMPTY
            newCommonTags.push(rowTags);
        }else{
            // IF COMMON TAGS !== EMPTY
            newCommonTags=currentCommonTags.filter(value=>rowTags.includes(value));
        }
        console.log('COMMON TAGS:',newCommonTags);
        setCommonTags(newCommonTags);
    }
    return (
        <BTable striped bordered hover size="sm" {...getTableProps()}>
         {/* <table {...getTableProps()} className='cameras-table'> */}
            <thead className='cameras-table-header'>
                {
                    headerGroups.map(headerGroup=>(
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {
                                headerGroup.headers.map(column=>(
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className='cameras-table-header-cell'>
                                    {
                                        column.render('Header')
                                    }
                                    <span>
                                        {
                                            column.isSorted
                                            ?
                                            column.isSortedDesc?'🔽':'🔼'
                                            :
                                            ''
                                        }
                                    </span>
                                    </th>
                                ))
                            }
                        </tr>
                    ))
                }
            </thead>
            <tbody {...getTableBodyProps()} className='cameras-table-body'>
                {
                    rows.length>0
                    ?
                    rows.map(row=>{
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                            {
                                row.cells.map(cell=>{
                                    return (
                                        <td {...cell.getCellProps()} className='cameras-table-cell'>
                                        {
                                            cell.render('Cell')
                                        }
                                        </td>
                                    )
                                })
                            }
                            </tr>
                        )
                    })
                    :
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>No data</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                }                
            </tbody>
        {/* </table> */}
        </BTable>
    );
}

export default CamerasTable;