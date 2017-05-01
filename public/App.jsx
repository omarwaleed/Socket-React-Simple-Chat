import React, {Component} from 'react';
import ReactDOM from 'react-dom';

// import socket from '/socket.io/socket.io.js';

class App extends Component {
    constructor(){
        super();
    }

    render(){
        return(
            <div>
                <div style={{display: 'flex', 'flex': 1, width: '100%', spaceBetween: 'center'}}>
                    <div style={{'flex': 7}}>
                        <span style={{fontSize: '30px'}}>Messages</span>
                        <ul id="messages"></ul>
                        <h1 id="typing"></h1>
                        <h1 id="connection"></h1>
                    </div>
                    <div style={{'flex': 3, alignContent: 'center'}}>
                        <span style={{fontSize: '30px'}} onClick="clearSelected()">Users</span>
                        <ul id="connectedusers" style={{marginTop: '20px'}}>
                        </ul>
                    </div>
                </div>
                <form action="" id="form">
                    <input type="text" id="username" value="" placeholder="Username"/><input id="m" autoComplete="off" onChange="emitTyping()" /><button>Send</button>
                </form>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
