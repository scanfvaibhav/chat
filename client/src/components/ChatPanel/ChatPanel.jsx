import React, { Component } from 'react';
import './Chat.css';
import Profile from '../Profile/Profile';
import  "../Posts/Posts.css";
import {getMessages} from "../../service/BaseService"; 

import "../../Layout/Home/Home.css";
import axios from "axios";
import { GridLoader } from 'react-spinners';
// Components
import User from "../User/User";
import SearchUsers from "../SearchUsers/SearchUsers";

class ChatPanel extends  Component{
 
 
  state = {
    data:this.props.data,
    allUsers: null,
    error: ""
  };

  async componentDidMount() {
    let email=localStorage.userInfo?JSON.parse(localStorage.userInfo).email:"";
    if(email){
      try {
        getMessages(this,email).then((res)=>{
          if(res){
            this.setState({data:res.data.data});
          }
        }).catch();
      } catch (err) {
        this.setState({ error: err.message });
      }
  }
  }

  removeUser = async id => {
    try {
      const users = await axios("/api/users/");
      this.setState({ data: users.data });
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  searchUsers = async username => {
    let allUsers = [...this.state.data.users];
    if (this.state.allUsers === null) this.setState({ allUsers });

    let users = this.state.data.users.filter(({ name }) =>
      name.toLowerCase().includes(username.toLowerCase())
    );
    if (users.length > 0) this.setState({ data: { users } });

    if (username.trim() === "")
      this.setState({ data: { users: this.state.allUsers } });
  };

render() {


  let columnModel = [{"text":"Name","index":"name"},
  {"text":"Genre","index":"genre"},
  {"text":"Age","index":"age"}];
  let Header  = columnModel.map(function(cm){
    return <th>{cm.text}</th>
  });
  let users;

  if (this.state.data)
    users =
      this.state.data.users &&
      this.state.data.users.map(user => (
        <User key={user._id} columnModel={columnModel} data={user} />
      ));
  else return <div className="Spinner-Wrapper"> <GridLoader color={'#333'} /> </div>;

  if (this.state.error) return <h1>{this.state.error}</h1>;
  if (this.state.data !== null)
    if (!this.state.data.users.length)
      return <h1 className="No-Users">No users!</h1>;

        return (

          <div className="container">
       
    <div className="left-col">
  
    <Profile data={this.state.userData}/>
    </div>
    
    <div className="center-col">
    <div className="Table-Wrapper">
        
        <SearchUsers searchUsers={this.searchUsers} />
        <table className="Table">
          <thead>
            <tr>
            {Header}
            </tr>
          </thead>
          <tbody>{users}</tbody>
        </table>
      </div>
        
    </div>
    
    <div className="right-col">
      Right col
    </div>
  </div>);  
  }  
} 
export default ChatPanel;