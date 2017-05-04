import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

// import socket from '/socket.io/socket.io.js';

let socket = io();


class App extends Component {
    constructor(){
        super();
        this.state = {selected: '', message: '', everyone: [], messagesContainer: []};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.messageChange = this.messageChange.bind(this);
        this.emitTyping = this.emitTyping.bind(this);

        // this.messageContent = "";
        this.username = prompt('Enter username');
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
            // document.getElementById('messages').innerHTML += ('<li><h3>You: '+toSend+'</h3></li>');
            let currentContainer = this.state.messagesContainer;
            // currentContainer.push(<Message isPrivate={false} sender="You" message={toSend} />)
            this.setState({messagesContainer: currentContainer})
        } else {
            console.log('to someone');
            console.log('define',this.state[this.state.selected], this.state.selected);
            if(this.state[this.state.selected] === undefined){
                this.state[this.state.selected] = [{sender: "you", msg: toSend}]
            } else {
                this.state[this.state.selected] = ([...this.state[this.state.selected]].push({sender: "you", msg: toSend}))
            }
            document.getElementById('messages').innerHTML += ('<li><h3>PRIVATE You: '+toSend+'</h3></li>');
            // this.state[this.state.selected] = [...this.state[this.state.selected]].push({sender: "you", msg:toSend}) || [{sender: "you", msg: toSend}];
            socket.emit('chat message', {message: toSend, for: $('#username')[0].value, to: this.state.selected})
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

        return(
            <div>
                <div style={{display: 'flex', 'flex': 1, width: '100%', spaceBetween: 'center'}}>
                    <div style={{'flex': 7}}>
                        <span style={{fontSize: '30px'}}>Messages</span>
                        <ul id="messages">{this.state.messagesContainer}</ul>
                        <h1 id="typing"></h1>
                        <h1 id="connection"></h1>
                    </div>
                    <div style={{'flex': 3, alignContent: 'center'}}>
                        <span style={{fontSize: '30px'}} onClick={this.clearSelected.bind(this)}>Users</span>
                        <ul id="connectedusers" style={{marginTop: '20px'}}>
                        </ul>
                    </div>
                </div>
                <form action="" id="form" onSubmit={this.handleSubmit}>
                    <input type="text" id="username" value={this.username} placeholder="Username"/><input id="m" autoComplete="off" value={this.state.message} onChange={this.emitTyping} /><button>Send</button>
                </form>
            </div>
        )
    }

    ComponentDidMount(){
        socket.on('chat message', function(msg){
            // console.log('got message', msg)
            var sender = (msg.for || 'anon')
            // var isPrivate = (msg.to !== undefined)? "PRIVATE ": "";
            // $('#messages').append($('<li>').text(isPrivate + sender + ": "+msg.message));
            let isPrivate = (msg.to !== undefined)? true: false;
            currentContainer.push(<Message isPrivate={isPrivate} sender="You" message={toSend} />)
            console.log(state.everyone);
            state.everyone.push({sender: sender, msg: msg.message})
        });
        socket.on('typing', function(content){
            console.log('typing received',content.user);
            document.getElementById('typing').innerHTML = (content.user+' is typing');
            setTimeout(function(){
                document.getElementById('typing').innerHTML = '';
                console.log('hidden');
            }, 5000)
        });
        socket.on('user connection', function(msg){
            document.getElementById('connection').innerHTML += ('<br />'+msg);
            setTimeout(()=>{
                document.getElementById('connection').innerHTML = '';
            }, 5000);
        });
        socket.on('users', function(data){
            let out = '';
            for (var i = 0; i < data.length; i++) {
                out += `<li onclick="setSelected('${data[i]}')">`+data[i]+'</li>'
            }
            document.getElementById('connectedusers').innerHTML = out;
            // console.log('sockets are ', data);
        });
    }
}

const Message = (props)=> {
    console.log('prop message', props.message)
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

ReactDOM.render(<App />, document.getElementById('app'));
