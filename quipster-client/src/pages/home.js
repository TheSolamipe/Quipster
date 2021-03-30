import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

import Quip from '../components/Quip/index';
import Profile from '../components/Profile/index';

import axios from 'axios';
import {connect} from 'react-redux';
import { getQuips } from '../redux/actions/dataActions';

class home extends Component {
    componentDidMount(){
        this.props.getQuips()
    }
    render() {
        const { quips, loading } = this.props.data;
        let recentQuipsMarkup = !loading ? (
            quips.map(quip => 
                        <Quip quip={quip} key={quip.quipId} />)
        ) : <p>Loading......</p>
        return (
            <div>
                <Grid container spacing={2}>
                    <Grid item sm={8} xs={12}>
                        {recentQuipsMarkup}
                    </Grid>
                    <Grid item sm={4} xs={12}>
                        <Profile />
                    </Grid>
                </Grid>
            </div>
        )
    }
}

home.propTypes ={
    getQuips: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps = (state) =>({
    data: state.data
})

export default connect(mapStateToProps, {getQuips})(home)
