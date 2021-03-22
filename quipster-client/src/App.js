import React from 'react'; 
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './App.css';

//import pages;
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

//import components
import NavBar from './components/Navbar/index'

//import theme
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
  pallete: {
    primary:{
      light: '#6573c3',
      main: '#3f51b5',
      dark: '#2c387e',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ffee33',
      main: '##ffea00',
      dark: '#b2a300',
      contrastText: '#000'
    }
  },
  typography: {
    useNextVariants: true
  }
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <NavBar />
          <div className="container">
            <Switch>
              <Route  exact path='/' component={home} />
              <Route  exact path='/login' component={login} />
              <Route  exact path='/signup' component={signup} />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
