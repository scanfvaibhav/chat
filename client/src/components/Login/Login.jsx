import React from "react";
import ReactModalLogin from "react-modal-login";
import axios from "axios";
 
import { facebookConfig, googleConfig } from "../../config/social-config";
import  {getUser}  from '../../service/BaseService';
 
export default class Login extends React.Component {
  constructor(props) {
    super(props);
 
    this.state = {
      graphPopupdisplay : false,
      graphPopupmsg : "Dataview",
      graphData : {
        nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }],
        links: [{ source: "Harry", target: "Sally" }, { source: "Harry", target: "Alice" }],
        },
      showPopup: false ,
      showModal: false,
      loading: false,
      error: null,
      user:localStorage.getItem("userInfo")?JSON.parse(localStorage.getItem("userInfo")):{},
      picture:localStorage.getItem("userInfo")?JSON.parse(localStorage.getItem("userInfo")).picture.data.url:""
    };
  }
 
  openModal() {
      
    this.setState({
      showModal: true
    });
    
  }
  togglePopup() {  
    this.setState({
      showPopup:!this.state.showPopup
    });     
  } 
  closeModal() {
    this.setState({
      showModal: false,
      error: null
    });
  }
  logout(){
    delete localStorage.userInfo;
    delete localStorage.authInfo;
    this.setState({
      user: "",
      picture: ""
    });
    if(this.props.login){
      this.props.login(false);
    }
  }
  onLoginSuccess(method, response) {
      debugger
      this.closeModal();
      let token=response.authResponse.accessToken;
      this.initUser(token);

      localStorage.setItem("authInfo",JSON.stringify(response));
      if(this.props.login){
        this.props.login(true);
      }

    console.log("logged successfully with " + response);
  }
  initUser(token) {
    getUser(this,token).then((res) => {
      if(res){
        localStorage.setItem("userInfo",JSON.stringify(res.data));
      this.setState({
        user: res.data,
        picture: res.data.picture,
      });
    }
    }).catch(() => {
      //reject('ERROR GETTING DATA FROM FACEBOOK')
    });
  }
 
  onLoginFail(method, response) {
    console.log("logging failed with " + method);
    this.setState({
      error: response
    });
  }
 
  startLoading() {
    this.setState({
      loading: true
    });
  }
 
  finishLoading() {
    this.setState({
      loading: false
    });
  }
 
  afterTabsChange() {
    this.setState({
      error: null
    });
  }
  toggleGraphPopup=()=> {  
    this.setState({
      graphPopupdisplay:!this.state.graphPopupdisplay,
      graphPopupmsg:"Friends"
    });
  } 
  login = async e => {
    e.preventDefault();
    try {
      const newUser = await axios.post("/api/login/login", {
          email: this.refs.email.value,
          password: this.refs.password.value,
        }
      );
      localStorage.setItem("authInfo",JSON.stringify(newUser));
      if(this.props.login){
        this.props.login(true);
      }
    } catch (err) {
      this.setState({ response: err.message });
    }
  };
 
  render() {
    return (
      <div>
      <p>{this.state.user.name}</p>
        <p>
          {this.state.user.name?<button onClick={() => this.logout()}>Logout</button>:
          <form className='editor' onSubmit={this.login}>
          <input 
            type="text"
            placeholder="email"
            name="email"
            ref="email"
            minLength="3"
            maxLength="100"
            id="email"
          /><input 
          type="text"
          placeholder="Password"
          name="password"
          ref="password"
          minLength="3"
          maxLength="100"
          id="password"
        />
          <button type="submit">Login</button>
          <button onClick={() => this.openModal()}>Login with Facebook</button>
       </form>
          
        }
        </p>
        <ReactModalLogin
          visible={this.state.showModal}
          onCloseModal={this.closeModal.bind(this)}
          loading={this.state.loading}
          error={this.state.error}
          tabs={{
            afterChange: this.afterTabsChange.bind(this)
          }}
          loginError={{
            label: "Couldn't sign in, please try again."
          }}
          registerError={{
            label: "Couldn't sign up, please try again."
          }}
          startLoading={this.startLoading.bind(this)}
          finishLoading={this.finishLoading.bind(this)}
          providers={{
            facebook: {
              config: facebookConfig,
              onLoginSuccess: this.onLoginSuccess.bind(this),
              onLoginFail: this.onLoginFail.bind(this),
              label: "Continue with Facebook"
            }
            /*,
            google: {
              config: googleConfig,
              onLoginSuccess: this.onLoginSuccess.bind(this),
              onLoginFail: this.onLoginFail.bind(this),
              label: "Continue with Google"
            }*/
          }}
        />
      </div>
    );
  }
}