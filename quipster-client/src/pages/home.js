import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import Quip from '../components/Quip/index';

import axios from 'axios';

class home extends Component {
    state= {
        quips: null
    }
    componentDidMount(){
        axios.get('/quips')
            .then(res =>{
                this.setState({
                    quips: res.data
                })
            })
            .catch(err => console.log(err));
    }
    render() {
        let recentQuipsMarkup = this.state.quips ? (
            this.state.quips.map(quip => 
                        <Quip quip={quip} key={quip.quipId} />)
        ) : <p>Loading......</p>
        return (
            <div>
                <Grid container spacing={16}>
                    <Grid item sm={8} xs={12}>
                        {recentQuipsMarkup}
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <p>Profile.....</p>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default home
