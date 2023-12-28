import React, { Component } from 'react';
import ReactModal from 'react-modal';
import logo from './logo.png';
import call from './call.png';
import './App.css';
import web3 from './web3';
import myContract from './myContract';

const delay = (t) => new Promise((s) => setTimeout(s, t * 1000));

class App extends Component {
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
    isWin: false,
    showModal: false,
    message: '', // Add a message state for waiting messages
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.requestAccounts();
      const netId = await web3.eth.net.getId();

      if (netId === 369) {
        this.setState({ account: accounts[0] });
        this.showData();
      } else {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x171' }],
        });
        this.showData();
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Add a function to fetch data and update the state
  async fetchData() {
    try {
      const balance = await myContract.methods.balanceOf(this.state.account).call();
      const stakedData = await myContract.methods.hasStake(this.state.account).call();
      const admin = await myContract.methods.admin().call();
      const name = await myContract.methods.name().call();

      this.setState({
        balance: balance / (10 ** 18),
        stakedBalance: stakedData[0] / (10 ** 18),
        tableContent: stakedData[1],
        admin,
        name,
      });
    } catch (error) {
      console.error(error);
    }
  }

 handleCall = async () => {
    
    
    try {
      const gasPrice = await web3.eth.getGasPrice();

      await myContract.methods.doubleOrNothing().send({
        from: this.state.account,
        gasPrice: gasPrice
      });

      await delay(3);

      myContract.methods.balanceOf(this.state.account).call().then(wei => {
        this.setState({ balance: wei / (10 ** 18) });
        this.setState({ isWin: wei > 0 });
        this.setState({ showModal: true });
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
    const { account, showModal, balance, isWin, message } = this.state;

    if (!account) {
      return (
        <div>
          <h1>Please connect your Metamask wallet to Pulsechain first.</h1>
          <img src={logo} className="App-logo" alt="logo" />
        </div>
      );
    }

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Earn 87.6% interest per year, staking with the DON!</p>
          DON Token Address
          <br />
          <a rel="noreferrer" target="_blank" href="https://otter.pulsechain.com/address/0x3709bb762148c2ad9441Ffd2b74e2C0ba1a7B370">0x3709bb762148c2ad9441Ffd2b74e2C0ba1a7B370</a>

        <p className='mt-20'>Number of DON tokens in your wallet: {this.state.balance} DON</p>
        <p>Number of DON tokens you have staked: {this.state.stakedBalance} DON</p>

        <p className='mt-20'>Call the DON!</p>
        <img src={call} className="" alt="call" width={280} />
        <p className="desc">Warning: this function means Double Or Nothing!
        <br />  The function will call a random number from the Pulsechain Random Pseudo Proxy. 
        <br />  You will either double the DON tokens in your wallet, or you will lose all of them! 
        <br /> Only a true DON will ever be brave enough to call this function!</p>
        <button onClick={this.handleCall} className="call-btn">Call the don</button>
        <br />
        <p className='mt-20'>DON Token Staking</p>
        <p>Earn 0.01% interest for every hour staked (0.24% interest per day | 1.68% interest per week | 87.6% per year)</p>
               

        <form onSubmit={this.handleStake} className='mt-20'>
          <label>Number of Pulsechain DON Tokens you wish to stake: </label><br />
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

        <br />
        <p>You can withdraw whenever you like, but withdrawals from each subsequent stake index incur a 1% incremental withdrawl fee. 
        You can only ever deposit once per stake index, however you can withdraw from each stake index in full or in part</p>

        <form onSubmit={this.handleWithdraw} className='mt-20'>
          <label>Number of Pulsechain DON Tokens you wish to withdraw (excluding stake interest which will be added automatically): </label><br />
          <div>
            <label className="ml-20">Stake Index: </label>
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
              <th>Stake Index</th>
              <th>Available to withdraw</th>
              <th>Last Deposit/Withdraw time</th>
              <th>Stake interest accrued</th>
            </tr>
            {this.state.tableContent.map((row, i) => (
              Number(row[0]) === 0 || Number(row[2]) === 0 ? <></> : (
                <tr key={i}>
                  <td>{i}</td>
                  <td>{`${row[1] / (10 ** 18)} DON`}</td>
                  <td>{new Date(row[2] * 1000).toLocaleString()}</td>
                  <td>{`${row[3] / (10 ** 19)} DON`}</td>
                </tr>
              )
            ))}
          </table>
        </div>
        <br />
        <div>
        
        <p className='mt-20'>Use PulseX to swap DON tokens</p>
        <p>Please ensure that you use only the offical Pulsechain DON token address:</p>
        <p>0x3709bb762148c2ad9441Ffd2b74e2C0ba1a7B370</p>
        
        
          <Iframe
            title="DON"
            src="https://app.sushi.com/swap?inputCurrency=&outputCurrency=0x3709bb762148c2ad9441Ffd2b74e2C0ba1a7B370"
            height="660px"
            width="100%"
            style={divStyle}
            id="myId"
            />
      </div>
           
        <ReactModal
           className="ReactModal__Content"
           isOpen={this.state.showModal}
           data={
            { background: "green" }
           }
        >
          {this.state.isWin 
            ? <h2 className="dialog-message win">Congratulations!</h2>
            : <h2 className="dialog-message lose">Bad luck!</h2>
          }
          <button onClick={this.handleCloseModal}>Close</button>
        </ReactModal>
      </div>
    );
  }
}
export default App;
