import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

import * as firebase from 'firebase';

var config = {
    apiKey: "AIzaSyAHcq3Ws8TR5FRezToGz8ZBVrIPSChN9Rs",
    authDomain: "modernweb-socket-task.firebaseapp.com",
    databaseURL: "https://modernweb-socket-task.firebaseio.com",
    projectId: "modernweb-socket-task",
    storageBucket: "modernweb-socket-task.appspot.com",
    messagingSenderId: "945693240475"
};
firebase.initializeApp(config);

const db = firebase.database();
const rootRef = db.ref().child('socket');
const usersRef = rootRef.child('users');
const msgsRef = rootRef.child('messages');

// import socket from '/socket.io/socket.io.js';

let socket = io();


class App extends Component {
    constructor(){
        super();
        this.state = {selected: '', message: '', everyone: [], messagesContainer: [], usersContainer: [], keyHolder: null};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.messageChange = this.messageChange.bind(this);
        this.emitTyping = this.emitTyping.bind(this);

        this.setSelected = this.setSelected.bind(this);

        // this.messageContent = "";
        this.username = prompt('Enter username');

        // socket.emit('user:name', this.username);
        // usersRef.set({user: this.username})
        // socket.on('user:in', (data)=>this._handleUserIn(data))
        // socket.on('user:out', (socketid)=>this._handleUserOut(socketid))
        socket.on('chat message', (msg)=>this._handleChatMessage(msg));
        msgsRef.on('value', (msg)=>this._handleChatMessage(msg.val()));
        socket.on('typing', function(content){
            console.log('typing received',content.user);
            document.getElementById('typing').innerHTML = (content.user+' is typing');
            setTimeout(function(){
                document.getElementById('typing').innerHTML = '';
                console.log('hidden');
            }, 5000)
        });
        socket.on('user connection', function(msg){
            console.log('connection', msg);
            document.getElementById('connection').innerHTML += ('<br />'+msg);
            setTimeout(()=>{
                document.getElementById('connection').innerHTML = '';
            }, 5000);
        });
        socket.on('users', (data)=>{this._handleUserChange(data)});
        usersRef.on('value', (data)=>this._handleUserChange(data.val()))
    }

    componentDidMount(){
        msgsRef.on('value', (snap)=> this._handleChatMessage(snap.val().msg));
        usersRef.on('value', (msg)=>{
            console.log(msg);
            document.getElementById('connection').innerHTML += ('<br />'+msg);
            setTimeout(()=>{
                document.getElementById('connection').innerHTML = '';
            }, 5000);
        })
        // usersRef.set({user: this.username})
        let newUser = usersRef.push();
        newUser.set(this.username);
        this.state.keyHolder = newUser;
        console.log('holder', this.state.keyHolder);
    }

    componentWillUnmount(){
        // usersRef.remove(this.state.keyHolder);
        alert('called');
        this.state.keyHolder.path.o[2].remove();
    }

    _handleChatMessage(msg){
        if(msg === undefined) return;
        console.log('got message', msg)
        var sender = (msg.for || 'anon')
        // var isPrivate = (msg.to !== undefined)? "PRIVATE ": "";
        // $('#messages').append($('<li>').text(isPrivate + sender + ": "+msg.message));
        let isPrivate = (msg.to !== undefined)? true: false;
        this.state.everyone.push({sender: sender, msg: msg.message})
        let currentContainer = this.state.messagesContainer;
        currentContainer.push(<Message isPrivate={isPrivate} sender={msg.for} message={msg.message} />)
        this.setState({messagesContainer: currentContainer})
        // console.log(this.state.everyone);
    }

    _handleUserChange(data){
        let container = [];
        data = Object.values(data);
        for (var i = 0; i < data.length; i++) {
            container.push(<User toSelect={data[i]} name={data[i]} clickable={this.setSelected.bind(this)}/>)
        }
        // container.push(<User toSelect={data} name={data} clickable={this.setSelected.bind(this)}/>)
        this.setState({usersContainer: container})
        // document.getElementById('connectedusers').innerHTML = out;
        // console.log('sockets are ', data);
    }

    _handleUserIn(data){
        console.log(data);
        let container = this.state.usersContainer;
        container.push(data);
        this.setState({usersContainer: container});
    }

    _handleUserOut(id){
        let container = this.state.usersContainer.filter((userData)=>{
            if(userData.id !== id) return userData;
        })
    }

    setSelected(id){
        // this.state.selected = id;
        console.log('setting selected');
        this.setState({selected: id})
    }

    handleSubmit(e){
        e.preventDefault();
        console.log('submit');
        let toSend = this.state.message;
        let currentUser = this.username;

        if(toSend === ''){
            return;
        }
        if(this.state.selected === ""){
            console.log('to everyone');
            this.state.everyone.push({sender: "you", msg: toSend});
            socket.emit('chat message', {message: toSend, for: {currentUser}});
            msgsRef.set({message: toSend, for: currentUser});
            // let currentContainer = this.state.messagesContainer;
            // currentContainer.push(<Message isPrivate={false} sender="You" message={toSend} />)
            // this.setState({messagesContainer: currentContainer})
        } else {
            console.log('to someone');
            console.log('define',this.state[this.state.selected], this.state.selected);
            // if(this.state[this.state.selected] === undefined){
            //     this.state[this.state.selected] = [{sender: "you", msg: toSend}]
            // } else {
            //     this.state[this.state.selected] = ([...this.state[this.state.selected]].push({sender: "you", msg: toSend}))
            // }
            // document.getElementById('messages').innerHTML += ('<li><h3>PRIVATE You: '+toSend+'</h3></li>');
            // let currentContainer = this.state.messagesContainer;
            // currentContainer.push(<Message isPrivate={true} sender="You" message={toSend} />)
            // this.setState({messagesContainer: currentContainer})
            // this.state[this.state.selected] = [...this.state[this.state.selected]].push({sender: "you", msg:toSend}) || [{sender: "you", msg: toSend}];
            socket.emit('chat message', {message: toSend, for: $('#username')[0].value, to: this.state.selected})
            msgsRef.set({message: toSend, for: currentUser, to: this.state.selected});
        }
        // log('here');
        // toSend.val('');
        this.setState({message: ''});

    }

    messageChange(e){
        this.setState({message: e.target.value})
    }

    clearSelected(){
        this.setState({selected: ''});
        console.log('clear selected');
        return;
        // now change the message shown
        document.getElementById('messages').innerHTML = '';
        for (var msg in state.everyone) {
            $('#messages').append($('<li>').text(msg.sender + ": "+msg.msg));
        }
    }

    emitTyping(e){
        this.setState({message: e.target.value});
        let username = this.username;
        if(username === '') username = undefined;
        console.log('currently writing',username);
        socket.emit('typing', {user: (username || 'some user')});
    }

    render(){
        let messageChildren = React.Children.map(this.state.messagesContainer, (child)=>child);
        let userChildren = React.Children.map(this.state.usersContainer, (child)=>child);
        return(
            <div>
                <div style={{display: 'flex', 'flex': 1, width: '100%', spaceBetween: 'center'}}>
                    <div style={{'flex': 7}}>
                        <span style={{fontSize: '30px'}}>Messages</span>
                        <ul id="messages">
                            {messageChildren}
                        </ul>
                        <h1 id="typing"></h1>
                        <h1 id="connection"></h1>
                    </div>
                    <div style={{'flex': 3, alignContent: 'center'}}>
                        <span style={{fontSize: '30px'}} onClick={this.clearSelected.bind(this)}>Users</span>
                        <ul id="connectedusers" style={{marginTop: '20px'}}>
                            {userChildren}
                        </ul>
                    </div>
                </div>
                <form action="" id="form" onSubmit={this.handleSubmit}>
                    <input type="text" id="username" value={this.username} placeholder="Username"/><input id="m" autoComplete="off" value={this.state.message} onChange={this.emitTyping} /><button>Send</button>
                </form>
            </div>
        )
    }

    // ComponentDidMount(){
    //
    // }
}

const Message = (props)=> {
    // console.log('prop message', props.message)
    if(props.isPrivate){
        return (
            <li><h3>Private {props.sender}:</h3> {props.message}</li>
        )
    } else {
        return (
            <li><h3>{props.sender}:</h3> {props.message}</li>
        )
    }
}

const User = (props) => {
    // console.log('props', props);
    let clickable = ()=>{props.clickable(props.toSelect)};
    return (
        <li onClick={clickable}>{props.name}</li>
    )
}

ReactDOM.render(<App />, document.getElementById('app'));
