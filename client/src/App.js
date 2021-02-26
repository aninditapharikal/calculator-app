import React, { Component } from "react";
import "./App.css";
import { Button } from "./components/Button";
import {Input} from './components/Input';
import Data from "./components/Data";
import * as math from "mathjs";
import { Container } from 'reactstrap';

const io = require("socket.io-client");
const socket = io("http://localhost:4000/");
class App extends Component{
  constructor(props){
    super(props);
    this.state={
      data: [],
      input:""
    }
    socket.on(
			"render",
			(msg) => {
        console.log("Listening to client side---------------------");
				this.getAllData();
			}
		);
  }
  //to fetch all data while loading the
componentDidMount() {
		this.getAllData();
}

addToInput=val=>{
  this.setState({input: this.state.input+val});
}

backspace = () => {
		this.setState(() => ({
			input: this.state.input.slice(0, -1),
		}));
};
reset=()=>{
  this.setState({input:""});
}

calculate = () => {
		let value = "";
		try {
			value = math.evaluate(this.state.input);
		} catch (err) {
			value = "Invalid Input";
		}
		if (value !== "Invalid Input") {
			this.postRecord(value);
			this.send();
		}
    this.setState({ input: value });
	};
getAllData = () => {
  console.log("getAllData called");
		fetch("/api/data")
			.then((res) => res.json())
			.then((data) => this.setState({data: data }));
};
postRecord = (resp) => {
		const reverseTime = 1000000000000 - new Date().getTime();
		fetch("api/data", {
			method: "POST",
			body: JSON.stringify({
				time: reverseTime,
				value: `${this.state.input}=${resp}`,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json)
			.then(this.getAllData());
};
send = () => {
		socket.emit("new data published");
};
render(){
  const overrideStyle={
    "marginRight": "0px",
    "marginLeft": "0px"
  }
    return (
    <Container className="themed-container">
    <div className="app">
      <div className="calc-wrapper">
        <Input input={this.state.input}></Input>
        <div className="row" style={overrideStyle}>
          <Button handleClick={this.addToInput}>7</Button>
          <Button handleClick={this.addToInput}>8</Button>
          <Button handleClick={this.addToInput}>9</Button>
          <Button handleClick={this.addToInput}>/</Button>
        </div>
        <div className="row" style={overrideStyle}>
          <Button handleClick={this.addToInput}>4</Button>
          <Button handleClick={this.addToInput}>5</Button>
          <Button handleClick={this.addToInput}>6</Button>
          <Button handleClick={this.addToInput}>*</Button>
        </div>
        <div className="row" style={overrideStyle}>
          <Button handleClick={this.addToInput}>1</Button>
          <Button handleClick={this.addToInput}>2</Button>
          <Button handleClick={this.addToInput}>3</Button>
          <Button handleClick={this.addToInput}>+</Button>
        </div>
        <div className="row" style={overrideStyle}>
          <Button handleClick={this.addToInput}>.</Button>
          <Button handleClick={this.addToInput}>0</Button>
          <Button handleClick={()=>this.calculate()}>=</Button>
          <Button handleClick={this.addToInput}>-</Button>
        </div>
        <div className="row" style={overrideStyle}>
          <Button handleClick={()=>this.backspace()}>CE</Button>
          <Button handleClick={()=>this.reset()}>AC</Button>
        </div>
      </div>
      <div className="data-wrapper">
					<Data data={this.state.data} />
			</div>
    </div>
    </Container>
  );

  } 
}

export default App;
