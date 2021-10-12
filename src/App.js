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
    stakeValue: 0,
    stakeIndex: 0,
    withrawValue: 0,
    account: '',
    balance: '...',
    stakedBalance: '...',
    tableContent: [],
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const wei = await myContract.methods.balanceOf(accounts[0]).call();
    this.setState({ balance: wei / (10 ** 18) });

    const stakedData = await myContract.methods.hasStake(accounts[0]).call();
    this.setState({ stakedBalance: stakedData[0] / (10 ** 18) });
    this.setState({ tableContent: stakedData[1] });
    
    const admin = await myContract.methods.admin().call();
    const name = await myContract.methods.name().call();
    this.setState({ admin, name });
  }

  onSubmitBalanceOf = async (event) => {
    event.preventDefault();

    // this.setState({ message: 'Waiting on transaction success...' });

    // const accounts = await web3.eth.getAccounts();
    // await myContract.methods.balanceOf(this.state.account).send({
    //   from: accounts[0]
    // });

    // this.setState({ message: '' });
    // Router.replaceRoute(`/hpb/${this.props.address}`);
  };

  handleCall = async () => {
    try {
      const gasPrice = await web3.eth.getGasPrice();

      await myContract.methods.doubleOrNothing().send({
        from: this.state.account,
        gasPrice: gasPrice
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  handleStake = async (e) => {
    e.preventDefault();
    try {
      const gasPrice = await web3.eth.getGasPrice();

      await myContract.methods.stake(this.state.stakeValue).send({
        from: this.state.account,
        gasPrice: gasPrice
      });
    } catch (error) {
      console.log(error);
    }
  }

  handleWithraw = async (e) => {
    e.preventDefault();
    this.setState({ message: 'Waiting on transaction success...' });

    try {
      const gasPrice = await web3.eth.getGasPrice();

      await myContract.methods.withdrawStake(this.state.withrawValue, this.state.stakeIndex).send({
        from: this.state.account,
        gasPrice: gasPrice
      });
    } catch (error) {
      console.log(error);
    }
  
    this.setState({ message: 'Withrawed successfully!' });
    // Router.replaceRoute(`/hpb/${this.props.address}`);
  };

  render() {
    if (!this.state.account) {
      return (
        <h1>Please connect your wallet first.</h1>
      )
    }

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          DON Token Address
          <br />
          <a target="_blank" href="https://hpbscan.org/HRC20/0xde5e7442e0006627b715b068d1fcd6bcea132d12">0xDE5e7442E0006627B715b068D1fcD6BCEa132D12</a>
        </p>

        <p className='mt-20'>Number of DON tokens in your wallet: {this.state.balance} DON</p>
        <p>Number of DON tokens you have staked: {this.state.stakedBalance} DON</p>

        <p className='mt-20'>Call the DON!</p>
        <img src={call} className="" alt="call" width={280} />
        <p className="desc">Warning this function will call a random number from the HPB HRNG. You will either double your tokens or you will lose all of them!!</p>
        <button onClick={this.handleCall} className="call-btn">Call the don</button>

        <form onSubmit={this.handleStake} className='mt-20'>
          <label>Number of DON Tokens you wish to stake: </label><br />
          <div>
            <label className="ml-20">Amount: </label>
            <input
              type="number"
              min={0}
              value={this.state.stakeValue}
              onChange={event => this.setState({ stakeValue: event.target.value })}
            />
            <button className="ml-20">Stake</button>
          </div>
        </form>

        <form onSubmit={this.handleWithraw} className='mt-20'>
          <label>Number of DON Tokens you wish to withdraw: </label><br />
          <div>
            <label className="ml-20">Stack Id: </label>
            <input
              type="number"
              min={0}
              value={this.state.stakeIndex}
              onChange={event => this.setState({ stakeIndex: event.target.value })}
            />
            <label className="ml-20">Amount: </label>
            <input
              type="number"
              min={0}
              value={this.state.withrawValue}
              onChange={event => this.setState({ withrawValue: event.target.value })}
            />
            <button className="ml-20">Withdraw</button>
          </div>
        </form>

        {/* <Form address={this.props.address} onSubmit={this.onSubmit2} error={!!this.state.errorMessage}>
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
        </Form> */}

        <div className="flex center">
          <table className="mt-20">
            <tr>
              <th>Index</th>
              <th>Wallet Address</th>
              <th>Available for withdraw</th>
              <th>Last withdraw time</th>
              <th>Null</th>
            </tr>
            {this.state.tableContent.map((row, i) => (
              <tr key={i}>
                <td>{i}</td>
                <td>{row[0]}</td>
                <td>{`${row[1] / (10 ** 18)} DON`}</td>
                <td>{new Date(row[2] * 1000).toLocaleString()}</td>
                <td>{row[3]}</td>
              </tr>
            ))
            }
          </table>
        </div>
      </div>
    );
  }
}
export default App;