import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWalletKit } from '@mysten/wallet-kit';

const CREATE_PATIENT_FN = '0xc39d1ab581ffd496215aabba74f41e535b7d34b37258748643b02eb5a79795d6::contract::create_patient'; // Replace with actual package address + module
const STATIC_OWNER_ADDRESS = "0x0b67cf572414431d9e3558be21b6efbc34491f8ad7d5c39df6f52f82a1998e20";

const CreatePatientButton = () => {
    const { signAndExecuteTransactionBlock } = useWalletKit();

    const handleCreatePatient = async () => {
        const tx = new TransactionBlock();

        const patient = tx.moveCall({
            target: CREATE_PATIENT_FN,
            arguments: [
                tx.pure("Alice Doe"),
                tx.pure("Female"),
                tx.pure("0x0b67cf572414431d9e3558be21b6efbc34491f8ad7d5c39df6f52f82a1998e20"),
                tx.pure("2000-01-01"),
                tx.pure(9876543210),
                tx.pure(true),
            ],
        });

        // ✅ Transfer the returned object to user's wallet
        tx.transferObjects([patient], tx.pure(STATIC_OWNER_ADDRESS));

        tx.setGasBudget(100000000);

        const result = await signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEffects: true,
                showObjectChanges: true
            }
        });

        console.log('Transaction result:', result);

    };

    return <button onClick={handleCreatePatient}>Create Patient</button>;
};

export default CreatePatientButton;
