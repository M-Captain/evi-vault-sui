import React, { useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

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


    const fetchEvidence = async () => {
        try {
            setLoading(true);
            setError(null);
<<<<<<< HEAD
=======

>>>>>>> origin/master
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
        <>
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Evidence Retrieval</h2>

                {maxEvidence !== null && (
                    <div className="mb-6 p-4 bg-blue-900/50 text-blue-200 rounded-lg border border-blue-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Current max evidence ID</p>
                                <p className="text-2xl font-bold">{maxEvidence}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Next evidence ID</p>
                                <p className="text-2xl font-bold">{maxEvidence + 1}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <label htmlFor="evidenceId" className="block text-sm font-medium text-gray-300 mb-2">
                        Evidence ID
                    </label>
                    <div className="flex gap-3">
                        <input
                            id="evidenceId"
                            type="text"
                            placeholder="Enter Evidence ID"
                            value={evidenceId}
                            onChange={(e) => setEvidenceId(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={fetchEvidence}
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Loading
                                </span>
                            ) : 'Fetch Evidence'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {
                    evidence && (
                        evidence.details.access ? (
                            <div className="bg-gray-700 rounded-lg p-6 space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Evidence Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Evidence ID</p>
                                        <p className="text-lg text-white">{evidence.details.evidence_id}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Case Number</p>
                                        <p className="text-lg text-white">{evidence.details.case_no}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">FIR Number</p>
                                        <p className="text-lg text-white">{evidence.details.fir_no}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Date</p>
                                        <p className="text-lg text-white">{evidence.details.date}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Location</p>
                                        <p className="text-lg text-white">
                                            {evidence.details.latitude}, {evidence.details.longitude}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Access Status</p>
                                        <p className="text-lg">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${evidence.details.access ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                                                {evidence.details.access ? 'Accessible' : 'Restricted'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-600">
                                    <p className="text-sm font-medium text-gray-400 mb-2">Evidence Header</p>
                                    <p className="text-lg text-white">{evidence.details.head}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-900/50 text-red-200 rounded-lg p-6">
                                <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
                                <p>You do not have permission to view this evidence.</p>
                            </div>
                        )
                    )}
            </div>
        </>
    );
}

