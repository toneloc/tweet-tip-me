App = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // Try to connect to MetaMask; if we can't add in a pop up.
        return App.initContract();

    },

    initContract: function () {
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.open-create-modal', function () {
            var username = document.getElementById('username').value;
            console.log(username);
            $('#username-fill-6 > p').text( username );
            $("#open-create-modal").toggle();
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

        $(document).on('click', '#createButton', App.handleCreate);

        $(document).on('click', '#submitClaimButton', App.handleClaim);

        $(document).on('click', '#sendButton', function(event)
        {
            App.handleSend(event, $(this));
        });
        
        return App.getBalances();

    },

    handleCreate: function (event) {
        event.preventDefault();
        var username = $('#username').val();
        var amountToSend = $('#amount-to-send').val();

        console.log('Username = ' + username);

        async function asyncCreateTweetWalletCall() {
          var balances = await CreateTweetWallet(username); 
          $("#open-create-modal").toggle();
        };

        asyncCreateTweetWalletCall();
         
    },

    handleClaim: function (event, button) {
        event.preventDefault();
        var contractAddress = $('#address-fill > p').text().toString().trim();
        var status = $('#status-id').val().toString();
        console.log(status);
        console.log(contractAddress);

        async function asyncClaimCall() {
        var balances = await ClaimEther(status, contractAddress); 
            
        };

        asyncClaimCall();
        
    },

    handleSend: function (event, button) {
        event.preventDefault();

        var addressToSendTo = $('#inputEmail4').text();
        addressToSendTo = addressToSendTo.toString().trim();
        var amountToSend = $('#amount-to-send').val();

        console.log(addressToSendTo);
        console.log(amountToSend);

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            account = accounts[0];

            var send = web3.eth.sendTransaction({from: account, to: addressToSendTo, value: web3.toWei(amountToSend, "ether")}, function(error, result) {
                    if (error) {
                        console.log(error);
                        console.log(result.toString);
                } else {
                    alert('Your transaction is processing with transaction ID - ' +  result + '. Depending on how much gas you spent, it may take up to a few minutes for your payment to be processed. Refresh the page to check your transaction status, and review your transaction on EtherScan at the following URL – https://etherscan.io/tx/' +  result);
                    $('#balances-table').find("tr:gt(0)").remove();
                    $('#sendModal').modal('toggle');
                    return App.getBalances();
                }
            });

        });
    },

    getBalances: function () {
      var parentContractAddress = '0xb64c58e4bfdfaccf9821a11d894b8959e8e1df0f';
      $('#parent-contract-address').text(parentContractAddress);

      $('#my-token-balances').html("");

      /////////////////////////////
      // Async on async on async :(
      async function asyncCall() {
        console.log('calling');
        var events = await LogData(); 

        // For some reason, first item is blank
        events.shift();

        async function asyncBalancesCall() {

            /// Balance related code \/
            var addresses = [];
                for (var i = 0; i < events.length; i++) {
                addresses.push(events[i].returnValues.newAddress.toString());
            }  
          
          var balances = await GetBalances(addresses); 
          console.log("Balances" + balances);
          
          // Add balances back in to events array
          for (i=0; i < balances.length; i++) {
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

        console.log("done");

        // For each event
        // get events from the address and see if it was claimed
        // some how record that it was paid out by replacing the row

    },

    populateGrid: function (event) {
        if (typeof event == 'undefined') {
            $('#infuraConnected').attr("hidden", true);
            $('#infuraCouldNotConnect').attr("hidden", false);
        }

        if (typeof event.returnValues.balance == 'undefined') {
            $('#infuraGotBalances').attr("hidden", true);
            $('#infuraCouldNotGetBalances').attr("hidden", false);
        }

        var table = document.getElementById("balances-table");

        var row = table.insertRow();
        var usernameCell = row.insertCell(0);
        var addressCell = row.insertCell(1);
        var balanceCell = row.insertCell(2);
        var claimCell = row.insertCell(3);
        var sendCell = row.insertCell(4);

        var addressString = event.returnValues.newAddress.toString();
        var url = "https://etherscan.io/address/" + addressString;

        var spanString = "<span> <a href=\'" + url + "\' target=\'_blank_\'>" + addressString + "</a> </span>";

        addressCell.innerHTML = spanString;

        usernameCell.innerHTML = "Loading ...";
        balanceCell.innerHTML = "Loading ...";
        balanceCell.innerHTML = event.returnValues.balance;

        var usernameString = event.returnValues.username;
        var url = "https://twitter.com/" + usernameString;
        var spanString2 = "<span> <a href=\'" + url + "\' target=\'_blank_\'>" + usernameString + "</a> </span>";
        
        usernameCell.innerHTML = spanString2;

        claimCell.innerHTML = '<span ><button type="button" data-toggle="modal" class="open-claim-modal btn btn-primary" data-target="#claimModal"><font color="black">Claim ether</font></button></span>';
        sendCell.innerHTML = '<span <button type="button" data-toggle="modal" class="open-send-modal btn btn-primary" data-target="#sendModal"><font color="black">Send ether</font></button></span>';

    }, 

}

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
