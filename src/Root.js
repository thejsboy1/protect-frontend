import React,{useContext} from 'react';
import {BrowserRouter as Router,Switch,Route,Redirect} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import 'bootstrap/dist/css/bootstrap.min.css';
// Custom Components Imported
import PageLayout from 'components/PageLayout';
// Pages Imported
import LoginPage from 'pages/LoginPage';
import HomePage from 'pages/HomePage';
import AnalyticsPage from 'pages/AnalyticsPage';
import CamerasPage from 'pages/CamerasPage';
import InventoryPage from 'pages/InventoryPage';
import AdminProfile from 'pages/AdminProfile';
import {GlobalContext,GlobalContextProvider} from 'GlobalContext';
import {CamerasPageProvider} from 'pages/CamerasPageContext';

const PrivateRoute=({component:Component,...rest})=>(
    <Route {...rest} render={(props)=>(
        <React.Fragment>
            {
                sessionStorage.getItem('verified')
                ?
                <Component {...props}/>
                :
                <Redirect to={{pathname:'/',state:{from:props.location}}}/>
            }
        </React.Fragment>
    )}/>
)
const HomeView=()=>(<PageLayout Content={<HomePage/>}/>);
const AnalyticsView=()=>(<PageLayout Content={<AnalyticsPage/>}/>);
const CamerasView=()=>(<CamerasPageProvider><PageLayout Content={<CamerasPage/>}/></CamerasPageProvider>);
const InventoryView=()=>(<PageLayout Content={<InventoryPage/>}/>);
const AdminProfileView=()=>(<PageLayout Content={<AdminProfile/>}/>);

const Root=()=>{
    const {emailContext,tokenContext}=useContext(GlobalContext);
    const [token,setToken]=tokenContext;
    return (
        <Router history={createBrowserHistory()}>
            <Switch>
                <Route exact path="/" render={()=><LoginPage/>}/>
                <PrivateRoute exact path="/page/home" component={HomeView} token={token}/>
                <PrivateRoute exact path="/page/analytics" component={AnalyticsView}/>
                <PrivateRoute exact path="/page/cameras" component={CamerasView}/>
                <PrivateRoute exact path="/page/inventory" component={InventoryView}/>
                <PrivateRoute exact path="/page/adminProfile" component={AdminProfileView}/>
            </Switch>
        </Router>
    );
}


export default Root;