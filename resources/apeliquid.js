// Azuki Apes resources

var zukis = [];
var allforged = [];
const apesClaimContract = "";

async function connect() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else {
    window.alert("Please install MetaMask!");
  }
}

async function getMemberships() {
  const memberships = await getOwned();
  const allforged = await getForged();
}

async function claimApes(itemsToMint, areForged) {
  web3 = new Web3(Web3.givenProvider);
  var result = await web3.eth.requestAccounts().catch();
  var myAddress = result[0];

  var thisforge = new web3.eth.Contract(apesAbi, apesClaimContract);

  try {
    if (areForged) {
      await thisforge.methods
        .claimForgedApes(itemsToMint)
        .send({ from: myAddress });
    } else {
      await thisforge.methods.claimApes(itemsToMint).send({ from: myAddress });
    }
  } catch (error) {
    console.log("Error:", error);
    await Swal.fire({
      title: "Memberships NOT Claimed",
      html:
        "<h2>You FAILED to claim " +
        String(itemsToMint.length) +
        " Memberships</h2>",
      icon: "error",
      confirmButtonText: "Awww fck!",
      showDenyButton: false,
    });
    return;
  }

  await Swal.fire({
    title: "Memberships Claimed",
    html:
      "<h2>You have claimed " +
      String(itemsToMint.length) +
      " Memberships</h2>",
    icon: "info",
    confirmButtonText: "The Adventure Begins!",
    showDenyButton: false,
  });
}

async function getForged() {
  web3 = new Web3(Web3.givenProvider);
  var result = await web3.eth.requestAccounts().catch();
  var myAddress = result[0];

  let url = "/resources/forged.json";
  var allforged = [];

  try {
    let x = await fetch(url);
    if (x.status == 200) {
      var res = await (await fetch(url)).json();
      allforged = res[myAddress]["forged"];
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // handle the 404 error
      console.log("Resource not found:", error);
    } else {
      // handle other errors
      console.log("Error:", error);
    }
  }

  console.log("Forged: " + String(allforged));

  document.getElementById("apes_forged").textContent =
    "You have " + String(allforged.length) + " Forged Membership";
  return allforged;
}

// Which partner tokens are owned / forged
async function getOwned() {
  web3 = new Web3(Web3.givenProvider);
  var result = await web3.eth.requestAccounts().catch();
  var myAddress = result[0];

  const contractAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72";
  const token_ids_lst = [];

  try {
    // Update to your address
    contract = new web3.eth.Contract(membershipAbi, contractAddress);
    const bal = await contract.methods.balanceOf(String(myAddress)).call();

    const promises = [...Array(Number(bal))];

    await Promise.all(
      promises.map(async (_, i) => {
        const id = await contract.methods
          .tokenOfOwnerByIndex(result[0], i)
          .call();
        token_ids_lst.push(+Number(id));
      })
    );

    console.log("Owned: " + String(token_ids_lst));
  } catch (error) {
    console.log("error: " + error);
  }

  document.getElementById("apes_owned").textContent =
    "You own " + String(token_ids_lst.length) + " Memberships";
  return token_ids_lst;
}

async function vpassMint(itemsToMint, claimingForged) {
  var r = await Swal.fire({
    title: "Memberships Owned",
    html:
      "<h2>You are minting " +
      String(itemsToMint.length) +
      " Memberships</h2>" +
      "<h3>This will claim your Venture Pass. You will receive a new mint. Your original" +
      " Membership will be claimed &amp; no longer claimable.</h3>" +
      "<h2>You will pay gas mint each NFT.</h2>" +
      "<h3>There will be a transition period before METL is loaded into your VPASS." +
      "<h3>Are you sure?</h3>",
    icon: "info",
    confirmButtonText: "Ok!",
    showDenyButton: true,
  });

  if (r.isDenied) {
    return;
  }

  claimApes(itemsToMint, claimingForged);

  console.log("Burn + Mint: " + String(itemsToMint));
}

/*
    Swal.fire({
        title: "Burn NFTs",
        html: '<h6>Under construction.</h6>',
        icon: 'info',
        confirmButtonText: 'Meh.',
        showDenyButton: false,
    })
    return
 */
/*

// Set contract ABI and address
let contractAbi = YOUR_CONTRACT_ABI;
let contractAddress = "YOUR_CONTRACT_ADDRESS";

// Create contract instance
let contract = new web3.eth.Contract(contractAbi, contractAddress);

// Set user address
let userAddress = "YOUR_USER_ADDRESS";

document.getElementById('mintButton').addEventListener('click', () => {
    // Call setApprovalForAll
    contract.methods.setApprovalForAll(contractAddress, true).send({ from: userAddress }, (error, transactionHash) => {
        if (error) {
            console.log("Error: ", error);
        } else {
            console.log("Transaction Hash: ", transactionHash);

            // Call claimAzukiApes after approval
            let tokenIds = YOUR_TOKEN_ID_ARRAY; // Replace with your token ID array
            contract.methods.claimAzukiApes(tokenIds).send({ from: userAddress }, (error, transactionHash) => {
                if (error) {
                    console.log("Error: ", error);
                } else {
                    console.log("Transaction Hash: ", transactionHash);
                }
            });
        }
    });
});

*/
