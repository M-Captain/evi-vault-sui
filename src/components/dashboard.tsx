import { useState, useEffect } from 'react';
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

function Dashboard() {
    const [evidences, setEvidences] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    return currentMax;
                }
            }
            return null;
        } catch (err) {
            console.error('Error checking max evidence:', err);
            return null;
        }
    };

    const fetchAllEvidence = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get max evidence count
            const maxEvidenceCount = await checkMaxEvidence();
            if (maxEvidenceCount === null) {
                setError('Failed to get maximum evidence count');
                return;
            }

            // Get the system state object to get the table ID
            const response = await client.getObject({
                id: SYSTEM_STATE_ID,
                options: {
                    showContent: true
                }
            });

            if (!response.data?.content) {
                setError('Failed to fetch system state');
                return;
            }

            const content = response.data.content as any;
            const tableObjectId = content.fields.evidences.fields.id.id;

            // Fetch all evidence from 0 to maxEvidence
            const evidencePromises = [];
            for (let i = 0; i <= maxEvidenceCount; i++) {
                evidencePromises.push(
                    client.getDynamicFieldObject({
                        parentId: tableObjectId,
                        name: {
                            type: "u64",
                            value: i.toString()
                        }
                    })
                );
            }

            const evidenceResponses = await Promise.allSettled(evidencePromises);
            const allEvidence: Evidence[] = [];

            evidenceResponses.forEach((response, index) => {
                if (response.status === 'fulfilled' && response.value.data) {
                    const evidenceData = response.value.data.content as any;
                    const formattedEvidence: Evidence = {
                        id: index.toString(),
                        details: {
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
                        }
                    };
                    allEvidence.push(formattedEvidence);
                }
            });

            setEvidences(allEvidence);

        } catch (err) {
            console.error('Error fetching all evidence:', err);
            setError(`Error fetching evidence: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEvidence();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-amber-50 text-center">Evidence Dashboard</h1>
            {loading && <p>Loading evidence...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {evidences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evidences.map((evidence) => (
                        <div key={evidence.id} className="bg-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 text-2xl font-bold">Evidence ID: {evidence.details.evidence_id}</p>
                            <p className="text-gray-300">Case Number: {evidence.details.case_no}</p>
                            <p className="text-gray-300">FIR Number: {evidence.details.fir_no}</p>
                            <p className="text-gray-300">Date: {evidence.details.date}</p>
                            <p className="text-gray-300">Location: {evidence.details.latitude}, {evidence.details.longitude}</p>
                            <p className="text-gray-300">
                                Status: 
                                <span className={`ml-2 px-2 py-1 rounded ${evidence.details.access ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                                    {evidence.details.access ? 'Accessible' : 'Restricted'}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No evidence found.</p>
            )}
        </div>
    );
}

export default Dashboard;