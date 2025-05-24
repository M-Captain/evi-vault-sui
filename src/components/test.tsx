import Wallet from './Wallet'
<<<<<<< HEAD
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
=======

export default function ConnectWallet() {
    return (
        <>
            <div className="wallet "><Wallet></Wallet></div>
        </>
>>>>>>> master
    );
}