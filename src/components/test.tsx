import Wallet from './Wallet'
import {  useWalletKit } from '@mysten/wallet-kit'

export default function ConnectWallet(){
    const { wallet, connect } = useWalletKit();
    

    const click_handler = () => {
        
        window.location.href = '/main'
        
    }

    return(
        <>
        <div className="wallet"><Wallet></Wallet></div>

</>
    );
}