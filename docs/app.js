App = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // if (typeof web3 !== 'undefined') {
        //     App.web3Provider = web3.currentProvider;
        //     web3 = new Web3(web3.currentProvider);
        // } else {
        //     // Set the provider you want from Web3.providers
        //     App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
        //     web3 = new Web3(App.web3Provider);
        // }
        
        // web3.eth.getAccounts(function(error, accounts) { 
        //     if (error) {
        //         alert('It looks like you are not logged into the MetaMask browser plugin. To use TweetTip.me, please connect to the Ethereum network with Metamask, metamask.io');
        //     }
        // });         

        return App.initContract();

    },

    initContract: function () {
        // Get the necessary contract artifact files and instantiate with truffle-contract.
        // $.getJSON('TweetWallet.json', function (data) {
        //     var TweetWalletArtifact = data;
        //     App.contracts.TweetWallet = TruffleContract(TweetWalletArtifact);
        //     // Set the provider for our contract.
        //     App.contracts.TweetWallet.setProvider(App.web3Provider);
        // });

        // $.getJSON('TweetWalletParent.json', function (data) {
        //     var TweetWalletParentArtifact = data;
        //     App.contracts.TweetWalletParent = TruffleContract(TweetWalletParentArtifact);
        //     App.contracts.TweetWalletParent.setProvider(App.web3Provider);
        // });

        return App.bindEvents();
    },

    bindEvents: function () {
    	
        $(document).on('click', '#createButton', App.handleCreate);

        $(document).on('click', '#submitClaim', function(event) {
            App.handleClaim(event, $(this));
        });

        $(document).on('click', '#sendButton', function(event)
        {
            App.handleSend(event, $(this));
        });

        $(document).on('click', '.open-claim-modal', function () {
             // Populate
            var username = $(this).closest('tr').find('td:eq(0)').text();
            var address = $(this).closest('tr').find('td:eq(1)').text();
            $('#username-fill > p').text( username );
            $('#address-fill > p').text( address );
            $("#open-claim-modal").toggle();
           
        });

        $(document).on('click', '.open-send-modal', function () {
            // Populate
            var username = $(this).closest('tr').find('td:eq(0)').text();
            var address = $(this).closest('tr').find('td:eq(1)').text();
            $('#username-fill-2 > p').text( username );
            $('#address-fill-2 > p').text( address );
        });

        // Wait so contracts can load ...
        setTimeout(function () {
            return App.getBalances();
        }, 3000);

    },

    handleCreate: function (event) {
        event.preventDefault();
        var username = $('#username').val();

        console.log('Username = ' + username);
        var tweetWalletParentInstance;

        web3.eth.getAccounts(function (error, accounts) {
             if (error) {
                alert('Please connect to the Ethereum mainnet with the MetaMask browser extension, or use a service such as MyEtherWallet.');
            }

            if (accounts.length == 0) {
                alert('Please connect to the Ethereum mainnet with the MetaMask browser extension, or use a service such as MyEtherWallet');
                return;
            } else {
                var account = accounts[0];
            }

            var account = accounts[0];
            App.contracts.TweetWalletParent.deployed().then(function (instance) {
                tweetWalletParentInstance = instance;
                return tweetWalletParentInstance.createTweetWallet(username);
            })

                .then(function (result) {
                    alert('Smart contract created.');
                    $('#balances-table').find("tr:gt(0)").remove();
                    return App.getBalances();

                }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleClaim: function (event, button) {
        event.preventDefault();
        var contractAddress = $('#address-fill > p').text().toString().trim();
        var status = $('#status-id').val().toString();
        console.log(status);
        console.log(contractAddress);

        var tweetWalletInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            App.contracts.TweetWallet.at(contractAddress).then(function (instance) {
                tweetWalletInstance = instance;

                return tweetWalletInstance.claim(status);
            }).then(function (result) {
                alert('Transfer processed. Please allow several blocks to be mined and then re-check balances.');
                $('#claimModal').modal('toggle');
                $('#balances-table').find("tr:gt(0)").remove();
                return App.getBalances();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleSend: function (event, button) {
        event.preventDefault();

        var addressToSendTo = $('#inputEmail4').text();
        addressToSendTo = addressToSendTo.toString().trim();
        var amountToSend = $('#amount-to-send').val();

        console.log(addressToSendTo);

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            account = accounts[0];

            var send = web3.eth.sendTransaction({from: account, to: addressToSendTo, value: web3.toWei(amountToSend, "ether")},function(error, result) {
                    if (error) {
                   console.log(error);
                } else {
                    $('#balances-table').find("tr:gt(0)").remove();
                    $('#sendModal').modal('toggle');
                    return App.getBalances();
                }
            });

        });
    },

    getBalances: function () {
      var parentContractAddress = '0xf396316bD6DE45Dd85F8C465715798Bf13C46E26';
      $('#parent-contract-address').text(parentContractAddress);

      $('#my-token-balances').html("");

      /////////////////////////////
      // Async on async on async :(
      async function asyncCall() {
          console.log('calling');
          var events = await LogData(); 

        // For some reason, first item is blank
        events.shift();

        /// Balance related code \/
        var addresses = [];
            for (var i = 0; i < events.length; i++) {
            addresses.push(events[i].returnValues._address.toString());
        }

        async function asyncBalancesCall() {
          var balances = await GetBalances(addresses); 
          console.log("Balances" + balances);
          
          // Add balances back in to events array
          for (i=-0; i < balances.length; i++) {
            events[i].returnValues.balance = balances[i];
          }

          // After we have all data and balances, then populate grid
          App.processArray(events, App.populateGrid);

        };

        asyncBalancesCall();

      };

      asyncCall();

    },

    processArray: function(items, process) {
        var todo = items.concat();

        setTimeout(function() {
            process(todo.shift());
            if(todo.length > 0) {
                setTimeout(arguments.callee, 25);
            }
        }, 25);

    },

    populateGrid: function (event) {
        var table = document.getElementById("balances-table");

        var row = table.insertRow();
        var usernameCell = row.insertCell(0);
        var addressCell = row.insertCell(1);
        var balanceCell = row.insertCell(2);
        var claimCell = row.insertCell(3);
        var sendCell = row.insertCell(4);

        var addressString = event.returnValues._address.toString();
        var url = "https://ropsten.etherscan.io/address/" + addressString;

        var spanString = "<span> <a href=\'" + url + "\' target=\'_blank_\'>" + addressString + "</a> </span>";

        addressCell.innerHTML = spanString;

        usernameCell.innerHTML = "Loading ...";
        balanceCell.innerHTML = "Loading ...";
        balanceCell.innerHTML = event.returnValues.balance;

        var usernameString = event.returnValues._username;
        var url = "https://twitter.com/" + usernameString;
        var spanString2 = "<span> <a href=\'" + url + "\' target=\'_blank_\'>" + usernameString + "</a> </span>";
        
        usernameCell.innerHTML = spanString2;

        claimCell.innerHTML = '<span ><button type="button" data-toggle="modal" class="open-claim-modal btn btn-primary" data-target="#claimModal"><font color="black">Claim ether</font></button></span>';
        sendCell.innerHTML = '<span <button type="button" data-toggle="modal" class="open-send-modal btn btn-primary" data-target="#sendModal"><font color="black">Send ether</font></button></span>';

    }, 


    // populateBalances: function (addresses) {
    //     var table = document.getElementById("balances-table");
    //     var rows = tbody.getElementsByTagName("tr");​​​​​​​​​

    //     for (i=0, i< addresses.length, i++) {
    //         balanceCell.innerHTML = formattedAsEth.toString();
    //     }
    // }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});

// +++++++++++++++++++++++++++
// Main Ethereum Network
// https://mainnet.infura.io/67HMqY7SLmu1MBybaX95 

// Test Ethereum Network (Ropsten)
// https://ropsten.infura.io/67HMqY7SLmu1MBybaX95 

// Test Ethereum Network (Rinkeby)
// https://rinkeby.infura.io/67HMqY7SLmu1MBybaX95 

// Test Ethereum Network (Kovan)
// https://kovan.infura.io/67HMqY7SLmu1MBybaX95 

// IPFS Gateway
// https://ipfs.infura.io 

// IPFS RPC
// https://ipfs.infura.io:5001 
