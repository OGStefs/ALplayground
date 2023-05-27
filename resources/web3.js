/* To connect using MetaMask */
async function connect(e) {
  const test = "0xBC4157EF7A9936797A9A8FE4c3Ff59FbDAA3Ee96";
  const button = e.target;
  const contractAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72";
  let walletAddress;
  if (window.ethereum) {
    try {
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(() => {
          window.web3 = new Web3(window.ethereum);
          const account = web3.eth.accounts;
          //Get the current MetaMask selected/active wallet
          walletAddress = account.givenProvider.selectedAddress;
          console.log(`Wallet: ${walletAddress}`);
          button.textContent =
            walletAddress.slice(0, 5) + "..." + walletAddress.slice(-4);
          btn.removeEventListener("click", (e) => connect(e));
        })
        .then(() => getOwned(walletAddress))
        .then(() => getForged(walletAddress))
        .then(() => (window.location = "#venture"));
    } catch (error) {
      console.log(error);
    }
  } else {
    button.textContent = "Please check browser";
  }
}

const btn = document.getElementById("connect-button");
btn?.addEventListener("click", (e) => connect(e));

const claimWalletBtn = document.getElementById("claim-wallet");
//   ?.addEventListener("click", (e) => console.log(e));

const claimForgedBtn = document.getElementById("claim-forge");
//   ?.addEventListener("click", (e) => console.log(e));

async function getOwned(walletAddress) {
  console.log(walletAddress);
  window.web3 = new Web3(window.ethereum);

  const contractAddress = "0x61028F622CB6618cAC3DeB9ef0f0D5B9c6369C72";
  const token_ids_lst = [];

  try {
    // Update to your address
    contract = new window.web3.eth.Contract(membershipAbi, contractAddress);
    const bal = await contract.methods.balanceOf(walletAddress).call();
    console.log(bal);
    if (bal > 0) {
      const promises = [...Array(Number(bal))];

      await Promise.all(
        promises.map(async (_, i) => {
          const id = await contract.methods
            .tokenOfOwnerByIndex(walletAddress, i)
            .call();
          token_ids_lst.push(+Number(id));
        })
      );
      claimWalletBtn.textContent = "CLAIM";
      claimWalletBtn.classList.remove("empty");
    } else {
      claimWalletBtn.textContent = "nothing to claim";
    }
    console.log("Owned: " + String(token_ids_lst));
  } catch (error) {
    console.log("error: " + error);
  }

  document.getElementById("wallet-text").textContent =
    "You own " + String(token_ids_lst.length) + " Memberships";
  return token_ids_lst;
}

async function getForged(walletAddress) {
  window.web3 = new Web3(Web3.givenProvider);
  const result = await web3.eth.requestAccounts().catch();

  const url = "./resources/forged.json";
  let allforged = [];

  const x = await fetch(url)
    .then((res) => res.json())
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        // handle the 404 error
        console.log("Resource not found:", error);
      } else {
        // handle other errors
        console.log("Error:", error);
      }
    });

  let a = web3.utils.toChecksumAddress(walletAddress);
  //   console.log("converted", a);
  //   console.log("forgies", x[a]);
  console.log("the X", x);
  if (x) allforged = x[a]?.forged;

  console.log("Forged: " + String(allforged));
  if (allforged && allforged?.length > 0) {
    claimForgedBtn.textContent = "CLAIM";
    claimForgedBtn.classList.remove("empty");
  } else {
    claimForgedBtn.textContent = "nothing to claim";
  }
  document.getElementById("forge-text").textContent =
    "You have " +
    String(allforged ? allforged.length : 0) +
    " Forged Memberships";

  return allforged;
}
