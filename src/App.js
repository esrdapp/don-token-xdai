import React, { useState, useEffect } from "react";
import web3 from './web3';
import myContract from './myContract';
import ReactModal from 'react-modal';
import Iframe from 'react-iframe';

const delay = t => new Promise(s => setTimeout(s, t * 1000));

const divStyle = {
  'border': '0',
  'margin': '0 auto',
  'display': 'block',
  'border-radius': '10px',
  'max-width': '600px',
  'min-width': '300px'
};

function App() {
  const [admin, setAdmin] = useState('');
  const [name, setName] = useState('');
  const [stakeValue, setStakeValue] = useState(0);
  const [stakeIndex, setStakeIndex] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('...');
  const [stakedBalance, setStakedBalance] = useState('...');
  const [tableContent, setTableContent] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function connectWallet() {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const netId = await web3.eth.net.getId();
        if (netId === 369) {
          setAccount(accounts[0]);
          showData();
        } else {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x171' }]
          });
          showData();
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }

    // Check if Metamask is installed and connected
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
      connectWallet();
    }
  }, []);

  async function showData() {
    try {
      const wei = await myContract.methods.balanceOf(account).call();
      setBalance(wei / (10 ** 18));

      const stakedData = await myContract.methods.hasStake(account).call();
      setStakedBalance(stakedData[0] / (10 ** 18));
      setTableContent(stakedData[1]);

      const adminResult = await myContract.methods.admin().call();
      setAdmin(adminResult);

      const nameResult = await myContract.methods.name().call();
      setName(nameResult);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function handleCall() {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await myContract.methods.doubleOrNothing().send({
        from: account,
        gasPrice: gasPrice
      });

      await delay(3);
      showData();

      setShowModal(true);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function handleStake(e) {
    e.preventDefault();
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await myContract.methods.stake(stakeValue).send({
        from: account,
        gasPrice: gasPrice
      });

      showData();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    try {
      const gasPrice = await web3.eth.getGasPrice();
      await myContract.methods.withdrawStake(withdrawValue, stakeIndex).send({
        from: account,
        gasPrice: gasPrice
      });

      showData();
    } catch (error) {
      console.log(error);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
  }

    
  render() {
    // if (!this.state.account) {
    //   return (
    //     <div>
    //     <h1>Please connect your Metamask wallet to Pulsechain first.</h1>
    //     <img src={logo} className="App-logo" alt="logo" />
    //     </div>
    //   )
    // }

    

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />

        {!this.state.account ? (
        <div>
          <h1>Please connect your Metamask wallet to Pulsechain first.</h1>
          <button onClick={this.connectWallet}>Connect Wallet</button>
        </div>
        ) : (
        <>


      
        <p>
          Earn 87.6% interest per year, staking with the DON!</p>
          DON Token Address
          <br />
          <a rel="noreferrer" target="_blank" href="https://otter.pulsechain.com/address/0xbeAF9572154D99177198bC328eeacA64c5ca275F">0xbeAF9572154D99177198bC328eeacA64c5ca275F</a>

        <p className='mt-20'>Number of DON tokens in your wallet: {this.state.balance} DON</p>
        <p>Number of DON tokens you have staked: {this.state.stakedBalance} DON</p>

        <p className='mt-20'>Call the DON!</p>
        <img src={call} className="" alt="call" width={280} />
        <p className="desc">Warning: this function means Double Or Nothing!
        <br />  The function will call a random number from the Pulsechain Random Pseudo Proxy. 
        <br />  You will either double the DON tokens in your wallet, or you will lose all of them! 
        <br /> Only a true DON will ever be brave enough to call this function!</p>
        <button onClick={this.connectWallet}>Connect Wallet</button>
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
        <p>0xbeAF9572154D99177198bC328eeacA64c5ca275F</p>
        
        
          <Iframe
            title="DON"
            src="https://gopulse.com/x?out=0xbeAF9572154D99177198bC328eeacA64c5ca275F"
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

              </>
      )}
      </div>
    );
  }
}
export default App;
