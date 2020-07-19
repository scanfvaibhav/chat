import React, { Component } from "react";
import {getPosts,getTree} from "../../service/BaseService"; 
import '../AddUser/AddUser.css';
import axios from "axios";
import { EditorState, convertToRaw ,convertFromHTML,ContentState} from 'draft-js';

import {Editor} from 'primereact/editor';
import {InputTextarea} from 'primereact/inputtextarea';

import {Treebeard} from 'react-treebeard';
import {TREE_STYLE} from "../../constants/Style";
import {v4} from "uuid";


class Write extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: "",
      editorState: EditorState.createEmpty(),
      details: {name:localStorage.getItem('userInfo')?JSON.parse(localStorage.getItem('userInfo')).name:""},
      posts:[],
      treeData:[] 
    };
    this.onToggle = this.onToggle.bind(this);
    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.edit = this.edit.bind(this);
  }
  componentDidMount(){
    if(this.state.treeData.length==0){
      getPosts(this).then((res)=>{
        if(res){
          this.setState({posts:res.data.posts});
        }
        getTree(this).then((res)=>{
          if(res){
            this.setState({treeData:res.data.data});
          }
        }).catch();
      }).catch();
    }
  }

  onChangeHandler = e => {
      this.setState({ [e.target.name]: e.target.value });
  }
  onEditorChangeHandler = e => {
      this.setState({"description":  e.htmlValue });
  }

  addPost = async e => {
    e.preventDefault();
    try {
      let title = this.state.title;
      let randomId = await this.appendNode(title);
      const newPost = await axios.post("/api/post/create", {
          title: title,
          description: this.state.description,
          details: this.state.details,
          email:JSON.parse(localStorage.userInfo).email,
          titleId : randomId
        }
      );
      this.setState({ response: `Done!` });
    } catch (err) {
      this.setState({ response: err.message });
    }
  };
  addNewNode(treeData,id,name,randomId){
    for(let i in treeData){
      if(treeData[i].id===id){
        if(!treeData[i]["children"]){
          treeData[i]["children"]=[];
        }
        treeData[i]["children"].push({name:name,id:randomId});
        treeData[i]["toggled"]=true;
      }else{
        if(treeData[i]["children"]){
          this.addNewNode(treeData[i]["children"],id,name,randomId);
        }
      }
    }
  };
  async addNode(){
    let val = this.refs.node.value;
    await this.appendNode(val);
  };

  async removeNode(){
    let val = this.state.selectedNode.id;
    let treeData = this.state.treeData;
    this.removeNodeFromState(treeData,val);
    const menu = await axios.post("/api/post/updateMenuTree", {
      menu: treeData,
      email:JSON.parse(localStorage.userInfo).email
    });
    this.setState({treeData:menu.data.menu});

  };

  async removeNodeFromState(treeData,id){
    for(let i=0;i<treeData.length;i++){
      if(treeData[i].id===id){
        treeData.splice(i,1);
      }else if(treeData[i].children)
        this.removeNodeFromState(treeData[i].children,id)
    }
  };

  edit(){
    let selectedNode = this.state.selectedNode;
    this.setState({descriptionData:"geee"});
    //this.refs.description.value="hello"
  };

  async appendNode(value){
    let treeData = this.state.treeData;
    let randomId = v4();
    if(this.state.selectedNode){
      this.addNewNode(treeData,this.state.selectedNode.id,value,randomId);
    }else{
      treeData.push({name:value,id:randomId});
    }
    const menu = await axios.post("/api/post/updateMenuTree", {
        menu: treeData,
        email:JSON.parse(localStorage.userInfo).email
      }
    );
    this.setState({treeData:menu.data.menu});
    return randomId;
  };
  onEditorStateChange =(editorState) =>{
    this.setState({
      editorState,
    });
  }
  setEditorValue(value){
    const blocksFromHTML = convertFromHTML(value);
      const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      this.setState({editorState: EditorState.createWithContent(state)});
  }
  onToggle(node, toggled){
    this.setState({selectedNode:node});
    this.refs.title.value = node.name;
    this.refs.description.rawContentState = node.description;

    const {cursor, data} = this.state;
    if (cursor) {
        this.setState(() => ({cursor, active: false}));
    }
    node.active = true;
    if (node.children) { 
        node.toggled = toggled; 
    }
    this.setState(() => ({cursor: node, data: Object.assign({}, data)}));
  };
  render() {
    
    return (
      <div className="container">
       
    <div className="left-col">
    <div className="category">
    
    <Treebeard
                data={this.state.treeData}
                onToggle={this.onToggle}
                style={TREE_STYLE}
                ref="treeMenu"
            />
            
            <input 
            type="text"
            placeholder="add node"
            name="node"
            ref="node"
            minLength="3"
            maxLength="100"
            className="AddNodeText"
          />

          <button type="submit" onClick={this.addNode} className="Add-Node-Submit fa fa-plus"></button>
          <button type="submit" onClick={this.removeNode} className="Add-Node-Submit fa fa-minus"></button>
          <button type="submit" onClick={this.edit} className="Add-Node-Submit fa fa-pencil-square-o"></button>

            </div>
            
    </div>
    
    <div className="center-col">
    <div className="AddUser-Wrapper">
        <form className='editor' onSubmit={this.addPost}>

        <InputTextarea 
          rows={5} 
          cols={30}
          onChange={this.onChangeHandler.bind(this)}
          autoResize={true}
          type="text"
          placeholder="Title"
          name="title"
          ref="title"
          className="Add-User-Input"
          minLength="3"
          maxLength="100"
          id="title"
             />
          
          <Editor 
          style={{height:'320px'}}
          placeholder ="Content"
          name ="description"
          ref ="description"
          required
          minLength ="3"
          maxLength ="1000000"
          id ="description"
          value={this.state.descriptionData}
          onTextChange={this.onEditorChangeHandler.bind(this)}
          />
          <button type="submit" className="Add-User-Submit fa fa-plus"></button>
          <button type="reset" className="Add-User-Reset fa fa-eraser"></button>

       </form>

        <p>{this.state.response}</p>
      </div>
    </div>
    
    <div className="right-col">
    </div>
  </div>
      
    );
  }
}
function uploadImageCallBack(file) {
  return new Promise(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.imgur.com/3/image');
      xhr.setRequestHeader('Authorization', 'Client-ID XXXXX');
      const data = new FormData();
      data.append('image', file);
      xhr.send(data);
      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      });
      xhr.addEventListener('error', () => {
        const error = JSON.parse(xhr.responseText);
        reject(error);
      });
    }
  );
}

export default Write;
