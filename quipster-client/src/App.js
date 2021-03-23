import React from 'react'; 
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.css';
import jwtDecode from 'jwt-decode';

//Redux
import { Provider } from 'react-redux';
import store from './redux/store';

//import pages;
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

//import components
import NavBar from './components/Navbar/index';
import AuthRoute from './utils/AuthRoute';

//import util
import themeFile from './utils/theme';

//import theme
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme(themeFile);

let authenticated;
const token = localStorage.FBIdToken;
if(token){
 const decodedToken = jwtDecode(token);
 if(decodedToken.exp * 1000 < Date.now()){
    window.location.href = '/login'
    authenticated = false;
 }else{
   authenticated = true;
 }
}

function App() {
  return (
    <MuiThemeProvider theme={theme}>
    <Provider store={store} >
        <Router>
          <NavBar />
          <div className="container">
            <Switch>
              <Route  exact path='/' component={home} />
              <AuthRoute  exact path='/login' component={login} authenticated={authenticated}/>
              <AuthRoute  exact path='/signup' component={signup} authenticated={authenticated}/>
            </Switch>
          </div>
        </Router>
    </Provider>  
    </MuiThemeProvider>
  );
}

export default App;
