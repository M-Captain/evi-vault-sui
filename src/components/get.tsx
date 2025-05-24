import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const PACKAGE_ID = '0x54419cdac955854ee74e49e1dd23ace8ffd736e1440c3dfed0e99166665123d8';
const SYSTEM_STATE_ID = '0xf44820d3eb6dfe52e563b70861083fadee7f6d9bd3be630ab40297ff953a9a35';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

interface EvidenceData {
    evidence_id: string;
    case_no: string;
    fir_no: string;
    ipfs: number[];
    content: number[];
    access: boolean;
    head: string;
    latitude: string;
    longitude: string;
    date: string;
}

interface Evidence {
    id: string;
    details: EvidenceData;
}

export default function GetEvidence() {
    const { currentAccount } = useWalletKit();
    const [evidence, setEvidence] = useState<Evidence | null>(null);
    const [evidenceId, setEvidenceId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [maxEvidence, setMaxEvidence] = useState<number | null>(null);

    const checkMaxEvidence = async () => {
        try {
            const response = await client.getObject({
                id: SYSTEM_STATE_ID,
                options: {
                    showContent: true
                }
            });

            if (response.data?.content) {
                const content = response.data.content as any;
                if (content?.fields?.max_evidence !== undefined) {
                    const currentMax = Number(content.fields.max_evidence);
                    setMaxEvidence(currentMax);
                    // The next evidence ID will be currentMax + 1
                    return currentMax;
                }
            }
            return null;
        } catch (err) {
            console.error('Error checking max evidence:', err);
            return null;
        }
    };

    // Call checkMaxEvidence when component mounts
    React.useEffect(() => {
        checkMaxEvidence();
    }, []);

    const decodeBytes = (bytes: number[]): string => {
        return new TextDecoder().decode(new Uint8Array(bytes));
    };

    const fetchEvidence = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Convert evidence ID to number
            const evidenceIdNumber = parseInt(evidenceId, 10);
            if (isNaN(evidenceIdNumber)) {
                setError('Please enter a valid evidence ID number');
                return;
            }

            // Get the system state object
            const response = await client.getObject({
                id: SYSTEM_STATE_ID,
                options: {
                    showContent: true,
                    showType: true,
                    showOwner: true,
                    showDisplay: true
                }
            });

            console.log('Full response:', JSON.stringify(response, null, 2));

            if (!response.data) {
                setError('Failed to fetch system state');
                return;
            }

            const content = response.data.content as any;
            console.log('Content structure:', JSON.stringify(content, null, 2));

            if (!content || !content.fields) {
                setError('Failed to parse system state data');
                return;
            }

            // Get the table object ID from the system state
            const tableObjectId = content.fields.evidences.fields.id.id;
            console.log('Table Object ID:', tableObjectId);

            // Fetch the dynamic field that contains our evidence
            const dynamicFieldResponse = await client.getDynamicFieldObject({
                parentId: tableObjectId,
                name: {
                    type: "u64",
                    value: evidenceIdNumber.toString()
                }
            });

            console.log('Dynamic field response:', JSON.stringify(dynamicFieldResponse, null, 2));

            if (!dynamicFieldResponse.data) {
                setError(`No evidence found with ID ${evidenceId}`);
                return;
            }

            const evidenceData = dynamicFieldResponse.data.content as any;
            console.log('Evidence data:', JSON.stringify(evidenceData, null, 2));

            // Format the evidence data from the dynamic field
            const formattedEvidence: EvidenceData = {
                evidence_id: evidenceData.fields.value.fields.evidence_id.toString(),
                case_no: evidenceData.fields.value.fields.case_no.toString(),
                fir_no: evidenceData.fields.value.fields.fir_no.toString(),
                ipfs: evidenceData.fields.value.fields.ipfs,
                content: evidenceData.fields.value.fields.content,
                access: evidenceData.fields.value.fields.access,
                head: evidenceData.fields.value.fields.head,
                latitude: evidenceData.fields.value.fields.latitude.toString(),
                longitude: evidenceData.fields.value.fields.longitude.toString(),
                date: evidenceData.fields.value.fields.date.toString()
            };

            console.log('Formatted evidence:', formattedEvidence);

            setEvidence({
                id: evidenceId,
                details: formattedEvidence
            });

        } catch (err) {
            console.error('Error fetching evidence:', err);
            setError(`Error fetching evidence: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Get Evidence Details</h2>
            {maxEvidence !== null && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
                    Current max evidence ID: {maxEvidence}<br />
                    Next evidence ID will be: {maxEvidence + 1}
                </div>
            )}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter Evidence ID"
                    value={evidenceId}
                    onChange={(e) => setEvidenceId(e.target.value)}
                    className="border p-2 w-full mb-2 rounded"
                />
                <button
                    onClick={fetchEvidence}
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Loading...' : 'Fetch Evidence'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {evidence && (
                <div className="bg-gray-50 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-3">Evidence Information</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="font-medium">Evidence ID:</p>
                            <p>{evidence.details.evidence_id}</p>
                        </div>
                        <div>
                            <p className="font-medium">Case Number:</p>
                            <p>{evidence.details.case_no}</p>
                        </div>
                        <div>
                            <p className="font-medium">FIR Number:</p>
                            <p>{evidence.details.fir_no}</p>
                        </div>
                        <div>
                            <p className="font-medium">IPFS Hash:</p>
                            <p className="break-all">{decodeBytes(evidence.details.ipfs)}</p>
                        </div>
                        <div>
                            <p className="font-medium">Content:</p>
                            <p className="break-all">{decodeBytes(evidence.details.content)}</p>
                        </div>
                        <div>
                            <p className="font-medium">Access:</p>
                            <p>{evidence.details.access ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div>
                            <p className="font-medium">Head Address:</p>
                            <p className="break-all">{evidence.details.head}</p>
                        </div>
                        <div>
                            <p className="font-medium">Location:</p>
                            <p>Latitude: {evidence.details.latitude}, Longitude: {evidence.details.longitude}</p>
                        </div>
                        <div>
                            <p className="font-medium">Date:</p>
                            <p>{new Date(Number(evidence.details.date) * 1000).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

