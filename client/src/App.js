import React, { Component } from "react";
import "./App.css";
import { Button } from "./components/Button";
import { Input } from './components/Input';
import Data from "./components/Data";
import * as math from "mathjs";
import { Container } from 'reactstrap';
import { isInteger } from "mathjs";


const io = require("socket.io-client");
const socket = io();
class App extends Component {

  state = {
    data: [],
    input: ""
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    socket.on(
      "render",
      (msg) => {
        this.getAllData();
      }
    );
    document.addEventListener("keydown", this._handleKeyDown);
    this.getAllData();
  }

  addToInput = val => {
    let lastChar = this.state.input.toString().charAt(this.state.input.length - 1);
    if ((lastChar === "+" || lastChar === "-") && (val === "/" || val === "*"))
      return;
    else if (lastChar === "/") {
      if (val === "*") {
        let substr = this.state.input.toString().slice(0, -1);
        this.setState({ input: substr + val });
        return;
      } else if (val === "/") return;

    } else if (lastChar === "*") {
      if (val === "/") {
        let substr = this.state.input.toString().slice(0, -1);
        this.setState({ input: substr + val });
        return;
      } else if (val === "*") return;

    }
    this.setState({ input: this.state.input + val });
  }
  _handleKeyDown = (event) => {
    if (event.key === "+" || event.key === "-" || event.key === "*" || event.keyCode === 8 || event.key === "/"
      || event.key === "." || event.keyCode === 13 || isInteger(parseInt(event.key))) {
      switch (event.keyCode) {
        case 13:
          this.calculate();
          break;
        case 8:
          this.backspace();
          break;
        default:
          this.addToInput(event.key);
          break;
      }
    }
  }

  backspace = () => {
    let val = this.state.input.toString();
    this.setState(() => ({
      input: val.slice(0, -1),
    }));
  };
  reset = () => {
    this.setState({ input: "" });
  }

  calculate = () => {
    let value = "";
    let lastChar = this.state.input.toString().charAt(this.state.input.length - 1);
    if (lastChar === "+" || lastChar === "-" || lastChar === "*" || lastChar === "/" || lastChar === ".") return;
    try {
      if (!this.state.input) return;
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
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => this.setState({ data: data }));
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
  render() {
    const overrideStyle = {
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
              <Button handleClick={() => this.calculate()}>=</Button>
              <Button handleClick={this.addToInput}>-</Button>
            </div>
            <div className="row" style={overrideStyle}>
              <Button handleClick={() => this.backspace()}>CE</Button>
              <Button handleClick={() => this.reset()}>AC</Button>
            </div>
          </div>
          <div className="data-wrapper">
            <Data data={this.state.data} />
          </div>
        </div>
      </Container>
    );

  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
  }
}

export default App;
