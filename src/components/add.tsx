<<<<<<< HEAD
import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromB64 } from '@mysten/sui.js/utils';
import axios, { AxiosError } from 'axios';

const PACKAGE_ID = '0x54419cdac955854ee74e49e1dd23ace8ffd736e1440c3dfed0e99166665123d8';
const SYSTEM_STATE_ID = '0xf44820d3eb6dfe52e563b70861083fadee7f6d9bd3be630ab40297ff953a9a35';
const ADD_EVIDENCE_FN = `${PACKAGE_ID}::EvidenceSystem::add_evidence`;

// Walrus configuration
const WALRUS_CONFIG = {
    apiKey: process.env.VITE_WALRUS_API_KEY || '', // Add your API key to .env file
    endpoint: process.env.VITE_WALRUS_ENDPOINT || 'https://api.walrus.sui.io/1/ipfs',
    pinataEndpoint: 'https://api.pinata.cloud/pinning/pinFileToIPFS'
};

const walrusClient = axios.create({
    baseURL: WALRUS_CONFIG.endpoint,
    headers: {
        'Authorization': `Bearer ${WALRUS_CONFIG.apiKey}`,
        'Accept': 'application/json',
    }
});

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

interface AddEvidenceForm {
    caseNo: string;
    firNo: string;
    ipfsHash: string;
    content: string;
    access: boolean;
    head: string;
    latitude: string;
    longitude: string;
    file?: File;
}

export default function AddEvidence() {
    const { signTransactionBlock } = useWalletKit();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState<AddEvidenceForm>({
        caseNo: '',
        firNo: '',
        ipfsHash: '',
        content: '',
        access: true,
        head: '',
        latitude: '',
        longitude: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file' && files && files.length > 0) {
            setFormData(prev => ({
                ...prev,
                file: files[0]
            }));
            handleFileUpload(files[0]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);
            setError(null);

            // First try Walrus API
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await walrusClient.post('/upload', formData);
                if (response.data && response.data.IpfsHash) {
                    setFormData(prev => ({
                        ...prev,
                        ipfsHash: response.data.IpfsHash
                    }));
                    return;
                }
            } catch (walrusError) {
                console.warn('Walrus upload failed, trying Pinata:', walrusError);
                
                // Fallback to Pinata if Walrus fails
                if (process.env.VITE_PINATA_API_KEY && process.env.VITE_PINATA_SECRET_KEY) {
                    const pinataFormData = new FormData();
                    pinataFormData.append('file', file);

                    const pinataResponse = await axios.post(WALRUS_CONFIG.pinataEndpoint, pinataFormData, {
                        headers: {
                            'pinata_api_key': process.env.VITE_PINATA_API_KEY,
                            'pinata_secret_api_key': process.env.VITE_PINATA_SECRET_KEY
                        }
                    });

                    if (pinataResponse.data && pinataResponse.data.IpfsHash) {
                        setFormData(prev => ({
                            ...prev,
                            ipfsHash: pinataResponse.data.IpfsHash
                        }));
                        return;
                    }
                }
                
                throw walrusError;
            }
        } catch (error: unknown) {
            console.error('Error uploading to IPFS:', error);
            let errorMessage = 'Error uploading file: ';
            
            if (axios.isAxiosError(error)) {
                if (error.code === 'ERR_NETWORK') {
                    errorMessage += 'Network error. Please check your internet connection and try again.';
                } else if (error.response) {
                    errorMessage += `Server error: ${error.response.data?.message || error.message}`;
                } else {
                    errorMessage += error.message;
                }
            } else if (error instanceof Error) {
                errorMessage += error.message;
            } else {
                errorMessage += String(error);
            }
            
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const validateForm = (): boolean => {
        if (!formData.caseNo || isNaN(Number(formData.caseNo))) {
            setError('Valid Case Number is required');
            return false;
        }
        if (!formData.firNo || isNaN(Number(formData.firNo))) {
            setError('Valid FIR Number is required');
            return false;
        }
        if (!formData.ipfsHash) {
            setError('IPFS Hash is required');
            return false;
        }
        if (!formData.content) {
            setError('Content is required');
            return false;
        }
        if (!formData.head || !formData.head.startsWith('0x')) {
            setError('Valid Head Address is required (must start with 0x)');
            return false;
        }
        if (!formData.latitude || isNaN(Number(formData.latitude))) {
            setError('Valid Latitude is required');
            return false;
        }
        if (!formData.longitude || isNaN(Number(formData.longitude))) {
            setError('Valid Longitude is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const tx = new TransactionBlock();
            
            // Convert string inputs to appropriate types
            const ipfsBytes = new TextEncoder().encode(formData.ipfsHash);
            const contentBytes = new TextEncoder().encode(formData.content);

            // Call the add_evidence function
            tx.moveCall({
                target: ADD_EVIDENCE_FN,
                arguments: [
                    tx.object(SYSTEM_STATE_ID),
                    tx.pure(Number(formData.caseNo)),
                    tx.pure(Number(formData.firNo)),
                    tx.pure(Array.from(ipfsBytes)),
                    tx.pure(Array.from(contentBytes)),
                    tx.pure(formData.access),
                    tx.pure(formData.head),
                    tx.pure(Number(formData.latitude)),
                    tx.pure(Number(formData.longitude))
                ]
            });

            tx.setGasBudget(100_000_000);

            // Sign and execute the transaction
            const { signature, transactionBlockBytes } = await signTransactionBlock({
                transactionBlock: tx,
            });

            const response = await client.executeTransactionBlock({
                transactionBlock: transactionBlockBytes,
                signature,
                options: {
                    showEffects: true,
                    showEvents: true
                }
            });

            console.log('Transaction response:', response);
            setSuccess(true);
            
            // Reset form after successful submission
            setFormData({
                caseNo: '',
                firNo: '',
                ipfsHash: '',
                content: '',
                access: true,
                head: '',
                latitude: '',
                longitude: ''
            });

        } catch (err) {
            console.error('Error adding evidence:', err);
            setError(`Error adding evidence: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Add New Evidence</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload File</label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleInputChange}
                        className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {uploading && (
                        <p className="mt-2 text-sm text-blue-600">Uploading to IPFS...</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">IPFS Hash</label>
                    <input
                        type="text"
                        name="ipfsHash"
                        value={formData.ipfsHash}
                        onChange={handleInputChange}
                        placeholder="IPFS Hash (auto-filled after upload)"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Case Number</label>
                    <input
                        type="number"
                        name="caseNo"
                        value={formData.caseNo}
                        onChange={handleInputChange}
                        placeholder="Enter Case Number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">FIR Number</label>
                    <input
                        type="number"
                        name="firNo"
                        value={formData.firNo}
                        onChange={handleInputChange}
                        placeholder="Enter FIR Number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <input
                        type="text"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Enter Content"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Head Address</label>
                    <input
                        type="text"
                        name="head"
                        value={formData.head}
                        onChange={handleInputChange}
                        placeholder="Enter Head Address (0x...)"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="Enter Latitude"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="Enter Longitude"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="access"
                        checked={formData.access}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                        Access Enabled
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Adding Evidence...' : 'Add Evidence'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                    Evidence added successfully!
                </div>
            )}
        </div>
    );
} 
=======
import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const PACKAGE_ID = '0x54419cdac955854ee74e49e1dd23ace8ffd736e1440c3dfed0e99166665123d8';
const SYSTEM_STATE_ID = '0xf44820d3eb6dfe52e563b70861083fadee7f6d9bd3be630ab40297ff953a9a35';
const ADD_EVIDENCE_FN = `${PACKAGE_ID}::EvidenceSystem::add_evidence`;

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

interface AddEvidenceForm {
    caseNo: string;
    firNo: string;
    ipfsHash: string;
    content: string;
    access: boolean;
    head: string;
    latitude: string;
    longitude: string;
}

export default function AddEvidence() {
    const { signTransactionBlock } = useWalletKit();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState<AddEvidenceForm>({
        caseNo: '',
        firNo: '',
        ipfsHash: '',
        content: '',
        access: true,
        head: '',
        latitude: '',
        longitude: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.caseNo || isNaN(Number(formData.caseNo))) {
            setError('Valid Case Number is required');
            return false;
        }
        if (!formData.firNo || isNaN(Number(formData.firNo))) {
            setError('Valid FIR Number is required');
            return false;
        }
        if (!formData.ipfsHash) {
            setError('IPFS Hash is required');
            return false;
        }
        if (!formData.content) {
            setError('Content is required');
            return false;
        }
        if (!formData.head || !formData.head.startsWith('0x')) {
            setError('Valid Head Address is required (must start with 0x)');
            return false;
        }
        if (!formData.latitude || isNaN(Number(formData.latitude))) {
            setError('Valid Latitude is required');
            return false;
        }
        if (!formData.longitude || isNaN(Number(formData.longitude))) {
            setError('Valid Longitude is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const tx = new TransactionBlock();
            
            // Convert string inputs to appropriate types
            const ipfsBytes = new TextEncoder().encode(formData.ipfsHash);
            const contentBytes = new TextEncoder().encode(formData.content);

            // Call the add_evidence function
            tx.moveCall({
                target: ADD_EVIDENCE_FN,
                arguments: [
                    tx.object(SYSTEM_STATE_ID),
                    tx.pure(Number(formData.caseNo)),
                    tx.pure(Number(formData.firNo)),
                    tx.pure(Array.from(ipfsBytes)),
                    tx.pure(Array.from(contentBytes)),
                    tx.pure(formData.access),
                    tx.pure(formData.head),
                    tx.pure(Number(formData.latitude)),
                    tx.pure(Number(formData.longitude))
                ]
            });

            tx.setGasBudget(100_000_000);

            // Sign and execute the transaction
            const { signature, transactionBlockBytes } = await signTransactionBlock({
                transactionBlock: tx,
            });

            const response = await client.executeTransactionBlock({
                transactionBlock: transactionBlockBytes,
                signature,
                options: {
                    showEffects: true,
                    showEvents: true
                }
            });

            console.log('Transaction response:', response);
            setSuccess(true);
            
            // Reset form after successful submission
            setFormData({
                caseNo: '',
                firNo: '',
                ipfsHash: '',
                content: '',
                access: true,
                head: '',
                latitude: '',
                longitude: ''
            });

        } catch (err) {
            console.error('Error adding evidence:', err);
            setError(`Error adding evidence: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Add New Evidence</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Case Number</label>
                            <input
                                type="number"
                                name="caseNo"
                                value={formData.caseNo}
                                onChange={handleInputChange}
                                placeholder="Enter Case Number"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">FIR Number</label>
                            <input
                                type="number"
                                name="firNo"
                                value={formData.firNo}
                                onChange={handleInputChange}
                                placeholder="Enter FIR Number"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">IPFS Hash</label>
                        <input
                            type="text"
                            name="ipfsHash"
                            value={formData.ipfsHash}
                            onChange={handleInputChange}
                            placeholder="Enter IPFS Hash"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Content</label>
                        <input
                            type="text"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            placeholder="Enter Content"
                            className="w-full h-20 px-4 py-2 bg-gray-700 border  border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Head Address</label>
                        <input
                            type="text"
                            name="head"
                            value={formData.head}
                            onChange={handleInputChange}
                            placeholder="Enter Head Address (0x...)"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Latitude</label>
                            <input
                                type="number"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                placeholder="Enter Latitude"
                                step="any"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Longitude</label>
                            <input
                                type="number"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                placeholder="Enter Longitude"
                                step="any"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded-lg">
                        <input
                            type="checkbox"
                            name="access"
                            checked={formData.access}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                        />
                        <label className="text-sm text-gray-200">
                            Enable Access Control
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : 'Add Evidence'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Evidence added successfully!
                    </div>
                )}
            </div>
        </div>
    );
}
>>>>>>> master
