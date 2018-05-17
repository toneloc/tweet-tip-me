// Alerts

// Added - 

// #infuraConnected
// #infuraGotBalances
// #infuraCouldNotConnect
// #infuraCouldNotGetBalances

// To Add -
// #successfulCreate
// #successfulGive
// #successfulClaim


window.LogData = function getData() { 
	results = [{}];

	const Web3 = require('web3');

	const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws'));
	
	if (web3 != 'undefined') {
		$('#infuraConnected').attr("hidden", false);
	} else {
    	$('#infuraCouldNotConnect').attr("hidden", false);
  	}
	
	var abi = [ { "constant": false, "inputs": [ { "name": "_username", "type": "string" } ], "name": "createTweetWallet", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "onlyCreate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "libraryAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_libraryAddress", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "username", "type": "string" }, { "indexed": false, "name": "newAddress", "type": "address" } ], "name": "TweetWalletCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "target", "type": "address" }, { "indexed": false, "name": "clone", "type": "address" } ], "name": "CloneCreated", "type": "event" } ];
	var contract = new web3.eth.Contract(abi,'0xb64c58e4bfdfaccf9821a11d894b8959e8e1df0f');

	contract.getPastEvents('allEvents',
	    {fromBlock: 0,  toBlock: 'latest'},
	    (error, logs) => {
	        if (error) console.error(error);
	    }).then(function(logs){
	    	logs.forEach(log => {
	            results.push(log);
	        })    
		});

	return new Promise(resolve => {
	    setTimeout(() => {
	      resolve(results);
	    }, 2000);
	  });

}

window.GetBalances = function getData(addresses) { 
	const Web3 = require('web3');
	const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws'));

	var balances = [];

	for (var i = 0; i < addresses.length; i++) {
		web3.eth.getBalance(addresses[i], function(error, result){
	    if(!error && typeof result != 'undefined') {
	    	var formattedAsEth = web3.utils.fromWei(result,'ether');
	    	balances.push(formattedAsEth);
	    }
	    else {
    		$('#infuraCouldNotGetBalances').attr("hidden", false);
	        console.error(error);
	        return;
	    }

		});
	}

	return new Promise(resolve => {
	    setTimeout(() => {
	      resolve(balances);
	    }, 1000);
  	});
},

window.CreateTweetWallet = function createTweetWallet(username) { 
	results = [{}];

	console.log(username);

	var web3;

	const Web3 = require('web3');
	    if (typeof web3 !== 'undefined') {
	        web3 = new Web3(web3.currentProvider);
	    } else {
	        App.web3Provider = new Web3(window.web3.currentProvider);
	        web3 = new Web3(App.web3Provider);
	    }

    web3.eth.getAccounts(function (error, accounts) {
         if (error) {
            alert('It looks like you are not logged into the MetaMask browser plugin. To use TweetTip.me, please   to the Ethereum network with Metamask, metamask.io');
        }

        if (accounts.length == 0) {
            alert('Please connect to the Ethereum mainnet with the MetaMask browser extension, or use a service such as MyEtherWallet');
            return;
        } else {
            var account = accounts[0];
        }

        var account = accounts[0];
		var abi = [ { "constant": false, "inputs": [ { "name": "_username", "type": "string" } ], "name": "createTweetWallet", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "onlyCreate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "libraryAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_libraryAddress", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "username", "type": "string" }, { "indexed": false, "name": "newAddress", "type": "address" } ], "name": "TweetWalletCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "target", "type": "address" }, { "indexed": false, "name": "clone", "type": "address" } ], "name": "CloneCreated", "type": "event" } ];
		var contract = new web3.eth.Contract(abi,'0xb64c58e4bfdfaccf9821a11d894b8959e8e1df0f', {from: account});

        contract.methods.createTweetWallet(username).send({from: account})
			.on('error', function(error){ alert('Shucks! This transaction had an error :( Here is some more technical information you can use to debug - ' +  error); })
			.on('transactionHash', function(transactionHash){ alert('Your transaction is processing with transaction ID - ' +  transactionHash + '. Depending on how much gas you spent, it may take up to a few minutes for your payment to be processed. Refresh the page to check your TweetTip status, and review your transaction on EtherScan at the following URL – https://etherscan.io/tx/' +  transactionHash);})
			// .on('receipt', function(receipt){ alert('Your Tip has been registered on the blockchain at this contract address: ' + receipt.contractAddress) })
			.then(function(newContractInstance){
			    console.log(newContractInstance.options.address) 
			});
    });

}

window.ClaimEther = function claimEther(statusID, contractAddress) { 
	results = [{}];

	var web3;

	const Web3 = require('web3');
	    if (typeof web3 !== 'undefined') {
	        web3 = new Web3(web3.currentProvider);
	    } else {
	        App.web3Provider = new Web3(window.web3.currentProvider);
	        web3 = new Web3(App.web3Provider);
	    }

    web3.eth.getAccounts(function (error, accounts) {
         if (error) {
            alert('It looks like you are not logged into the MetaMask browser plugin. To use TweetTip.me, please connect to the Ethereum network with Metamask, metamask.io');
        }

        if (accounts.length == 0) {
            alert('Please connect to the Ethereum mainnet with the MetaMask browser extension, or use a service such as MyEtherWallet');
            return;
        } else {
            var account = accounts[0];
        }

        var account = accounts[0];

        var abi = [ { "constant": false, "inputs": [ { "name": "myid", "type": "bytes32" }, { "name": "result", "type": "string" } ], "name": "__callback", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "myid", "type": "bytes32" }, { "name": "result", "type": "string" }, { "name": "proof", "type": "bytes" } ], "name": "__callback", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_statusId", "type": "string" } ], "name": "claim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "getUsername", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "tweetInfo", "type": "string" } ], "name": "newTweetInfo", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "description", "type": "string" } ], "name": "newOraclizeQuery", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "timestamp", "type": "uint256" }, { "indexed": false, "name": "payee", "type": "address" } ], "name": "PaidOut", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "timestamp", "type": "uint256" } ], "name": "Refunded", "type": "event" }, { "constant": false, "inputs": [ { "name": "_username", "type": "string" } ], "name": "init", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "refundOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "inputs": [ { "name": "_username", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "username", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ];

        var contract = new web3.eth.Contract(abi,contractAddress, {from: account});

        contract.methods.claim(statusID).send({from: account}	)
            .on('error', function(error){ alert('Your transaction had an error :( Here is some more information - ' +  error); })
            .on('transactionHash', function(transactionHash){ alert('Your Claim Ether transaction is processing with transaction ID - ' +  transactionHash + '. Depending on how much gas you spent, it may take up to a few minutes for your claim to be processed. Refresh the page to check your transaction status, and review your transaction on EtherScan at the following URL – https://etherscan.io/tx/' +  transactionHash);})
            .then(function(){
                console.log("got here") 
                $('#claimModal').modal('toggle');
                $('#balances-table').find("tr:gt(0)").remove();
            });
    });
	
}