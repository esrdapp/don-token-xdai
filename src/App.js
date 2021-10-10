import logo from './logo.png';
import call from './call.png';
import './App.css';
import web3 from './web3';
import myContract from './myContract';
import React from "react";
import { Form, Button, Input, Message, Header, Container } from "semantic-ui-react";
class App extends React.Component {
state = {
  admin: '',
  name: '',
  address: '',
  balanceOf: '',
  account: ''
};


async componentDidMount() {
    const admin = await myContract.methods.admin().call();
    const name = await myContract.methods.name().call();
    const address = await myContract.address;
    

    this.setState({admin, name, address});
}
onSubmit = async(event) => {
  event.preventDefault();
this.setState({ message: 'Waiting on transaction success...'});
const accounts = await web3.eth.getAccounts();
  await myContract.methods.stake(this.state.value).send({
    from: accounts[0]
  });
this.setState({ message: 'You have submitted your stake!'});
};

onSubmit2 = async(event) => {
  event.preventDefault();

  this.setState({ message: 'Waiting on transaction success...'});

  const accounts = await web3.eth.getAccounts();
  await myContract.methods.withdrawStake(this.state.amount, this.state.stake_index).send({
    from: accounts[0]
  });

  this.setState({ message: 'First deposit successful and game name registered!'});
  // Router.replaceRoute(`/hpb/${this.props.address}`);
};

onSubmitBalanceOf = async(event) => {
  event.preventDefault();

  this.setState({ message: 'Waiting on transaction success...'});

  const accounts = await web3.eth.getAccounts();
  await myContract.methods.balanceOf(this.state.account).send({
    from: accounts[0]
  });

  this.setState({ message: ''});
  // Router.replaceRoute(`/hpb/${this.props.address}`);
};



render()
{
return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="" alt="logo" />
        <p>
        DON Token Address
        <br />
        <a style={{color: 'white'}}href="https://hpbscan.org/HRC20/0xde5e7442e0006627b715b068d1fcd6bcea132d12">0xDE5e7442E0006627B715b068D1fcD6BCEa132D12</a>        
        </p>

        <p>Number of DON tokens in your wallet: </p>
        <p>Number of DON tokens you have staked: </p>

        <br />
        <p>Call the DON!</p>
        <img src={call} className="" alt="call" />
        <Button color="red">Call</Button>

<form onSubmit={this.onSubmit}>
<div>
<label>Number of DON Tokens you wish to stake: </label><br />
<input
value={this.state.value}
onChange={event => this.setState({ value: event.target.value })}
/>
</div>
<button>click to confirm</button>
</form>

<form onSubmit={this.onSubmit2}>
<div>
<label>Number of DON Tokens you wish to withdraw: </label><br />
<input
value={this.state.value}
onChange={event => this.setState({ value: event.target.value })}
/>
</div>
<button>click to confirm</button>
</form>

      <Form address={this.props.address} onSubmit={this.onSubmit2} error={!!this.state.errorMessage}>
            <Form.Field>
          <label>amount of DON:</label>
          <Form.Input width={6}
            value={this.state.amount}
            onChange={event => this.setState({ amount: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
          <label>ID:</label>
          <Form.Input width={6}
            value={this.state.stake_index}
            onChange={event => this.setState({ stake_index: event.target.value })}
            />
        </Form.Field>
        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button color="green">First Deposit</Button>

      </Form>



      <Form address={this.props.address} onSubmit={this.onSubmitBalanceOf} error={!!this.state.errorMessage}>
            <Form.Field>
          <label>balance:</label>
          <Form.Input width={6}
            value={this.state.amount}
            onChange={event => this.setState({ account: event.target.value })}
            />
          </Form.Field>
        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button color="green">Get Account</Button>

      </Form>






      </header>
    </div>
  );
}
}
export default App;