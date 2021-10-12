import logo from './logo.png';
import call from './call.png';
import './App.css';
import web3 from './web3';
import myContract from './myContract';
import React from "react";

class App extends React.Component {
  state = {
    admin: '',
    name: '',
    stakeValue: 0,
    stakeIndex: 0,
    withdrawValue: 0,
    account: '',
    balance: '...',
    stakedBalance: '...',
    tableContent: [],
  };

  showData() {
    myContract.methods.balanceOf(this.state.account).call().then(wei => {
      this.setState({ balance: wei / (10 ** 18) });
    });

    myContract.methods.hasStake(this.state.account).call().then(stakedData => {
      this.setState({ stakedBalance: stakedData[0] / (10 ** 18) });
      this.setState({ tableContent: stakedData[1] });

      console.log(stakedData[1][0])
    });

    myContract.methods.admin().call().then(admin => {
      this.setState({ admin });
    });

    myContract.methods.name().call().then(name => {
      this.setState({ name });
    });
  }

  async componentDidMount() {
    window.ethereum.request({ method: "eth_requestAccounts" }).then(() => {
      web3.eth.requestAccounts()
        .then(accounts => {
          web3.eth.net.getId().then(async netId => {
            if (netId === 269) {
              this.setState({ account: accounts[0] });
              this.showData();
            } else {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x10d' }]
              })
              this.showData();
            }
          })
        })
    });
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

      this.showData();
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

      this.showData();

    } catch (error) {
      console.log(error);
    }
  }

  handleWithdraw = async (e) => {
    e.preventDefault();
    this.setState({ message: 'Waiting on transaction success...' });

    try {
      const gasPrice = await web3.eth.getGasPrice();

      await myContract.methods.withdrawStake(this.state.withdrawValue, this.state.stakeIndex).send({
        from: this.state.account,
        gasPrice: gasPrice
      });

      this.showData();
    } catch (error) {
      console.log(error);
    }
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
          <a rel="noreferrer" target="_blank" href="https://hpbscan.org/HRC20/0xde5e7442e0006627b715b068d1fcd6bcea132d12">0xDE5e7442E0006627B715b068D1fcD6BCEa132D12</a>
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

        <form onSubmit={this.handleWithdraw} className='mt-20'>
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
              value={this.state.withdrawValue}
              onChange={event => this.setState({ withdrawValue: event.target.value })}
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
              <th>Wallet address</th>
              <th>Available for withdraw</th>
              <th>Last withdraw time</th>
              <th>Stake interest</th>
            </tr>
            {this.state.tableContent.map((row, i) => (
              <tr key={i}>
                <td>{i}</td>
                <td>{row[0]}</td>
                <td>{`${row[1] / (10 ** 18)} DON`}</td>
                <td>{row[0] != 0 && row[2] > 0  ? new Date(row[2] * 1000).toLocaleString() : "Not Applicable"}</td>
                <td>{`${row[3] / (10 ** 19)} DON`}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    );
  }
}
export default App;